/**
 * The content pipeline talks to a drafting provider through this interface
 * only, so the pipeline does not depend on any one AI service.
 */
export type DraftRequest = {
  /** Stable instructions: house style, evidence rules, output format. */
  system: string;
  /** The topic brief for this article. */
  prompt: string;
  maxTokens?: number;
};

export type DraftResult = {
  markdown: string;
  provider: string;
  model: string;
  inputTokens?: number;
  outputTokens?: number;
};

export interface DraftProvider {
  readonly name: string;
  /** True when the provider is configured and allowed to run. */
  isConfigured(): boolean;
  /** Human-readable description of what is missing, for reports. */
  missingConfiguration(): string[];
  generate(request: DraftRequest): Promise<DraftResult>;
}

/** Raised when a person must do this step; the pipeline records it, it is not a crash. */
export class ManualStepRequired extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ManualStepRequired";
  }
}

export class ProviderError extends Error {
  constructor(
    message: string,
    readonly retryable: boolean,
  ) {
    super(message);
    this.name = "ProviderError";
  }
}
