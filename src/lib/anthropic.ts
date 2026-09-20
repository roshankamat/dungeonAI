import Anthropic from "@anthropic-ai/sdk";

/**
 * Server-only Anthropic client. Credentials resolve from ANTHROPIC_API_KEY
 * (or an `ant auth login` profile) automatically.
 */
let client: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (!client) {
    client = new Anthropic({
      maxRetries: 2,
      timeout: 5 * 60 * 1000,
    });
  }
  return client;
}

/** Claude Fable 5.1 by default; override with COUNCIL_MODEL / JUDGE_MODEL. */
export const COUNCIL_MODEL = process.env.COUNCIL_MODEL ?? "claude-fable-5-1";
export const JUDGE_MODEL = process.env.JUDGE_MODEL ?? COUNCIL_MODEL;

/**
 * Server-side refusal fallbacks are available on Claude Fable 5.1 and Claude Opus 5.
 * On a policy decline the API re-runs the request on a fallback model in the same call.
 */
export function supportsServerFallbacks(model: string): boolean {
  return model.startsWith("claude-fable-5") || model.startsWith("claude-opus-5") || model.startsWith("claude-mythos-5");
}
