import { similarity } from "../content/quality";
import type { Topic } from "./topics";

type Existing = { slug: string; title: string; targetQuery: string };

export type Selection = { selected: Topic[]; skipped: { topic: Topic; reason: string }[] };

/**
 * Chooses up to `count` topics to draft this run: planned topics in calendar
 * order, never one that already has a file, and never one too close to an
 * existing article or to another topic chosen in the same run.
 */
export function selectTopics(topics: Topic[], existing: Existing[], count: number): Selection {
  const selected: Topic[] = [];
  const skipped: Selection["skipped"] = [];
  const candidates = topics
    .filter((t) => t.status === "planned" || t.status === "researching")
    .sort((a, b) => a.week - b.week || a.id.localeCompare(b.id));

  for (const topic of candidates) {
    if (selected.length >= count) break;
    if (existing.some((p) => p.slug === topic.slug)) {
      skipped.push({ topic, reason: "an article file with this slug already exists" });
      continue;
    }
    const clash = [...existing.map((p) => ({ slug: p.slug, title: p.title, query: p.targetQuery })), ...selected.map((t) => ({ slug: t.slug, title: t.workingTitle, query: t.primaryQuery }))].find(
      (other) => similarity(other.query, topic.primaryQuery) >= 0.75 || similarity(other.title, topic.workingTitle) >= 0.6,
    );
    if (clash) {
      skipped.push({ topic, reason: `too similar to "${clash.slug}"` });
      continue;
    }
    selected.push(topic);
  }
  return { selected, skipped };
}

/** ISO 8601 week label such as 2026-W44, used to make runs idempotent. */
export function isoWeek(date = new Date()): string {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}
