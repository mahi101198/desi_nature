import type { Env } from "../env";
import { ProviderError, type DraftProvider, type DraftRequest, type DraftResult } from "./types";

/**
 * Drafts with a local model served by Ollama (https://ollama.com). Free to run,
 * but needs a machine that stays on; GitHub-hosted runners cannot run it.
 */
export class OllamaProvider implements DraftProvider {
  readonly name = "ollama";

  constructor(private readonly env: Env = process.env) {}

  private get baseUrl(): string {
    return (this.env.OLLAMA_URL || "http://127.0.0.1:11434").replace(/\/+$/, "");
  }

  isConfigured(): boolean {
    return this.missingConfiguration().length === 0;
  }

  missingConfiguration(): string[] {
    return this.env.OLLAMA_MODEL ? [] : ["OLLAMA_MODEL (for example a local model you have pulled with `ollama pull`)"];
  }

  async generate(request: DraftRequest): Promise<DraftResult> {
    if (!this.isConfigured()) throw new ProviderError("Ollama provider is not configured", false);
    const model = this.env.OLLAMA_MODEL as string;
    let lastError: Error | undefined;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const res = await fetch(`${this.baseUrl}/api/chat`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            model,
            stream: false,
            messages: [
              { role: "system", content: request.system },
              { role: "user", content: request.prompt },
            ],
          }),
          signal: AbortSignal.timeout(20 * 60 * 1000),
        });
        if (!res.ok) throw new ProviderError(`Ollama responded ${res.status}`, res.status >= 500);
        const body = (await res.json()) as { message?: { content?: string }; prompt_eval_count?: number; eval_count?: number };
        const markdown = body.message?.content?.trim() ?? "";
        if (!markdown) throw new ProviderError("Ollama returned no text", true);
        return { markdown, provider: this.name, model, inputTokens: body.prompt_eval_count, outputTokens: body.eval_count };
      } catch (error) {
        lastError = error as Error;
        if (error instanceof ProviderError && !error.retryable) throw error;
        await new Promise((r) => setTimeout(r, 2000 * 2 ** (attempt - 1)));
      }
    }
    throw new ProviderError(`Ollama failed after retries: ${lastError?.message}`, true);
  }
}
