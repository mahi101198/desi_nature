import Anthropic from "@anthropic-ai/sdk";
import type { Env } from "../env";
import { ProviderError, type DraftProvider, type DraftRequest, type DraftResult } from "./types";

/**
 * Drafts with the Anthropic Messages API. Runs only when AI_PROVIDER=anthropic
 * and ANTHROPIC_API_KEY are both set: a Claude Code or claude.ai subscription
 * does not provide an API key, and API usage is billed separately.
 */
export const DEFAULT_ANTHROPIC_MODEL = "claude-opus-5-5";

export class AnthropicProvider implements DraftProvider {
  readonly name = "anthropic";
  private readonly model: string;

  constructor(private readonly env: Env = process.env) {
    this.model = env.ANTHROPIC_MODEL?.trim() || DEFAULT_ANTHROPIC_MODEL;
  }

  isConfigured(): boolean {
    return this.missingConfiguration().length === 0;
  }

  missingConfiguration(): string[] {
    const missing: string[] = [];
    if (!this.env.ANTHROPIC_API_KEY) missing.push("ANTHROPIC_API_KEY (a Claude API key from console.anthropic.com; usage is billed)");
    return missing;
  }

  async generate(request: DraftRequest): Promise<DraftResult> {
    if (!this.isConfigured()) throw new ProviderError("Anthropic provider is not configured", false);
    // The SDK retries 408/409/429/5xx and connection errors itself.
    const client = new Anthropic({ apiKey: this.env.ANTHROPIC_API_KEY, maxRetries: 3, timeout: 15 * 60 * 1000 });
    try {
      // Optional live research: the model may search the web for sources (billed per search).
      const tools: Anthropic.Beta.BetaToolUnion[] =
        this.env.ANTHROPIC_WEB_SEARCH === "true" ? [{ type: "web_search_20260209", name: "web_search", max_uses: 8 }] : [];
      const messages: Anthropic.Beta.BetaMessageParam[] = [{ role: "user", content: request.prompt }];
      let message: Anthropic.Beta.BetaMessage | undefined;
      // A server-side tool loop can pause; resume it a few times at most.
      for (let turn = 0; turn < 4; turn++) {
        // Streaming keeps a long draft from hitting HTTP timeouts.
        message = await client.beta.messages
          .stream({
            model: this.model,
            max_tokens: request.maxTokens ?? 32000,
            betas: ["server-side-fallback-2026-07-01"],
            fallbacks: "default",
            output_config: { effort: "high" },
            system: request.system,
            messages,
            ...(tools.length ? { tools } : {}),
          })
          .finalMessage();
        if (message.stop_reason !== "pause_turn") break;
        messages.push({ role: "assistant", content: message.content });
      }
      if (!message) throw new ProviderError("No response from the Anthropic API.", true);

      if (message.stop_reason === "refusal") {
        throw new ProviderError("The model declined to draft this topic; it needs a person to write it.", false);
      }
      if (message.stop_reason === "max_tokens") {
        throw new ProviderError("The draft was cut off at the token limit; raise maxTokens or shorten the brief.", false);
      }
      const markdown = message.content
        .map((block) => (block.type === "text" ? block.text : ""))
        .join("")
        .trim();
      if (!markdown) throw new ProviderError("The model returned no text.", true);
      return {
        markdown,
        provider: this.name,
        model: message.model,
        inputTokens: message.usage.input_tokens,
        outputTokens: message.usage.output_tokens,
      };
    } catch (error) {
      if (error instanceof ProviderError) throw error;
      if (error instanceof Anthropic.AuthenticationError) throw new ProviderError("Anthropic API key was rejected.", false);
      if (error instanceof Anthropic.PermissionDeniedError) throw new ProviderError("Anthropic API key lacks permission for this model.", false);
      if (error instanceof Anthropic.BadRequestError) throw new ProviderError(`Anthropic rejected the request: ${error.message}`, false);
      if (error instanceof Anthropic.RateLimitError) throw new ProviderError("Anthropic rate limit reached after retries.", true);
      if (error instanceof Anthropic.APIError) throw new ProviderError(`Anthropic API error ${error.status ?? ""}`.trim(), true);
      throw new ProviderError(`Could not reach the Anthropic API: ${(error as Error).message}`, true);
    }
  }
}
