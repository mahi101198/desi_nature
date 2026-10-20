import { parsePostSource, type Post } from "../content/posts";
import type { Topic } from "./topics";

export type DraftOutcome =
  | { ok: true; source: string; post: Post }
  | { ok: false; reason: string; insufficientEvidence?: boolean };

/** Strips a ```markdown fence if the model wrapped its answer in one. */
function unwrap(text: string): string {
  const fenced = /^```(?:markdown|md)?\s*\n([\s\S]*?)\n```\s*$/.exec(text.trim());
  return (fenced ? fenced[1] : text).trim();
}

/**
 * Turns provider output into a validated draft file. Whatever the model wrote,
 * the slug, category and status are forced back to the brief's values and
 * "draft": a provider can never publish by writing status: published.
 */
export function processDraft(raw: string, topic: Topic, file: string): DraftOutcome {
  const text = unwrap(raw);
  if (text.startsWith("INSUFFICIENT_EVIDENCE:")) {
    return { ok: false, insufficientEvidence: true, reason: text.slice("INSUFFICIENT_EVIDENCE:".length).trim() };
  }
  if (!text.startsWith("---")) return { ok: false, reason: "Draft does not start with YAML frontmatter." };

  const forced = text
    .replace(/^status:.*$/m, 'status: "draft"')
    .replace(/^slug:.*$/m, `slug: "${topic.slug}"`)
    .replace(/^category:.*$/m, `category: "${topic.category}"`)
    .replace(/^publishedAt:.*\n/m, "")
    .replace(/^reviewedBy:.*\n/m, "")
    .replace(/^reviewedAt:.*\n/m, "");

  const parsed = parsePostSource(forced, file);
  if (!parsed.ok) return { ok: false, reason: `Draft failed schema validation: ${parsed.errors.join("; ")}` };
  // Every source from a model starts unverified, whatever it claims.
  const unverified = forced.replace(/verification:\s*"?(?:opened-and-checked|owner-supplied)"?/g, 'verification: "search-summary-only"');
  const reparsed = parsePostSource(unverified, file);
  if (!reparsed.ok) return { ok: false, reason: `Draft failed schema validation: ${reparsed.errors.join("; ")}` };
  return { ok: true, source: `${unverified}\n`, post: reparsed.post };
}
