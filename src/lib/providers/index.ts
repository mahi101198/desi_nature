import type { Env } from "../env";
import { AnthropicProvider } from "./anthropic";
import { OllamaProvider } from "./ollama";
import { ManualStepRequired, type DraftProvider, type DraftResult } from "./types";

export * from "./types";

/** The default: no automated drafting. The pipeline prepares briefs for a person. */
export class ManualProvider implements DraftProvider {
  readonly name = "manual";
  isConfigured(): boolean {
    return true;
  }
  missingConfiguration(): string[] {
    return [];
  }
  async generate(): Promise<DraftResult> {
    throw new ManualStepRequired(
      "No AI provider is configured (AI_PROVIDER=manual). The brief has been saved; write the draft from it, for example in a Claude Code session.",
    );
  }
}

export const PROVIDER_NAMES = ["manual", "anthropic", "ollama"] as const;
export type ProviderName = (typeof PROVIDER_NAMES)[number];

/**
 * Picks the provider named in AI_PROVIDER. Nothing is chosen implicitly: an
 * API key alone never switches on paid usage.
 */
export function getProvider(env: Env = process.env): DraftProvider {
  const name = (env.AI_PROVIDER || "manual").trim().toLowerCase();
  switch (name) {
    case "anthropic":
      return new AnthropicProvider(env);
    case "ollama":
      return new OllamaProvider(env);
    case "manual":
      return new ManualProvider();
    default:
      throw new Error(`Unknown AI_PROVIDER "${name}". Use one of: ${PROVIDER_NAMES.join(", ")}.`);
  }
}
