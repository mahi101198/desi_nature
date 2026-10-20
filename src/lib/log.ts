/**
 * Structured, single-line JSON logs. Callers pass event names and non-personal
 * fields only: never names, phone numbers, emails, message text or secrets.
 */
type Level = "info" | "warn" | "error";

const REDACT = /(name|phone|email|message|secret|token|key|password)/i;

export function log(level: Level, event: string, fields: Record<string, string | number | boolean | null> = {}) {
  const safe: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(fields)) safe[k] = REDACT.test(k) ? "[redacted]" : v;
  const line = JSON.stringify({ level, event, at: new Date().toISOString(), ...safe });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}
