/**
 * Weekly backlink report from data/backlinks/prospects.json.
 *
 *   npm run backlinks:report [-- --check-live]
 *
 * --check-live fetches each page marked as carrying a live link and confirms a
 * link to desinature.in is still present. Nothing is ever submitted or sent.
 */
import path from "node:path";
import { readProspects, summarise, type Prospect } from "../src/lib/backlinks";
import { isoWeek } from "../src/lib/pipeline/select";
import { args, rel, writeFile } from "./lib/cli";

async function linkStillPresent(p: Prospect): Promise<string> {
  if (!p.linkUrl) return "no linkUrl";
  try {
    const res = await fetch(p.linkUrl, { signal: AbortSignal.timeout(15000), headers: { "user-agent": "DesiNatureLinkCheck/1.0 (+https://desinature.in)" } });
    if (!res.ok) return `HTTP ${res.status}`;
    const html = await res.text();
    return /href=["']https?:\/\/(?:www\.)?desinature\.in/i.test(html) ? "present" : "NOT FOUND";
  } catch (error) {
    return `fetch failed: ${(error as Error).message}`;
  }
}

async function main() {
  const { flags } = args();
  const prospects = readProspects();
  const since = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  const s = summarise(prospects, since);
  const lines = [
    `# Backlink report ${isoWeek()}`,
    ``,
    `Prospects tracked: ${s.total} (${Object.entries(s.byVerification).map(([k, v]) => `${k}: ${v}`).join(", ")})`,
    ``,
    `## Links actually earned (${s.earned.length})`,
    ``,
    ...(s.earned.length ? s.earned.map((p) => `- ${p.organization}: ${p.linkUrl} (verified ${p.linkVerifiedOn})`) : ["- none yet"]),
  ];
  if (flags.has("--check-live") && s.earned.length) {
    lines.push(``, `### Live link check`, ``);
    for (const p of s.earned) lines.push(`- ${p.organization}: ${await linkStillPresent(p)}`);
  }
  lines.push(
    ``,
    `## New or re-checked this week (${s.newSince.length})`,
    ``,
    ...(s.newSince.length ? s.newSince.map((p) => `- ${p.id} ${p.organization} (${p.verification}): ${p.whySuitable}`) : ["- none"]),
    ``,
    `## Outreach drafts waiting for owner approval (${s.readyForOwner.length})`,
    ``,
    ...(s.readyForOwner.length ? s.readyForOwner.map((p) => `- ${p.id} ${p.organization}`) : ["- none"]),
    ``,
    `## Follow-ups (${s.followUps.length})`,
    ``,
    ...(s.followUps.length ? s.followUps.map((p) => `- ${p.id} ${p.organization}: ${p.outreachStatus}`) : ["- none"]),
    ``,
    `## Needs re-verification (${s.needsRecheck.length})`,
    ``,
    ...(s.needsRecheck.length ? s.needsRecheck.map((p) => `- ${p.id} ${p.organization}, last checked ${p.linkVerifiedOn ?? p.checkedOn}`) : ["- none"]),
    ``,
    `## Next actions for the owner`,
    ``,
    ...prospects
      .filter((p) => p.verification === "unverified" || p.verification === "search-result-only")
      .slice(0, 5)
      .map((p) => `- Open ${p.guidelinesUrl ?? p.pageUrl ?? p.website} and confirm: ${p.notes ?? "relevance, contribution guidelines and whether editorial links are given"}`),
    ``,
    `No backlinks, rankings or authority changes are promised. Links are earned only through genuine contributions.`,
    ``,
  );
  const file = path.join(process.cwd(), "reports", "backlinks", `${isoWeek()}.md`);
  writeFile(file, lines.join("\n"));
  console.log(lines.join("\n"));
  console.log(`Saved ${rel(file)}`);
}

main().catch((e) => {
  console.error((e as Error).message);
  process.exit(1);
});
