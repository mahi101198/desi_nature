import type { Topic } from "./topics";

/**
 * Stable drafting instructions. Kept free of dates and per-run values so the
 * provider can cache it.
 */
export const DRAFT_SYSTEM_PROMPT = `You write practical guides for Desi Nature, a small Indian business that takes enquiries for farm foods (ghee, honey, grains and flours) and publishes a journal about storing, choosing and growing food in Indian homes.

Write for the reader in the brief: plain, specific, warm, Indian English. Answer the primary question in the first two paragraphs. Use H2 sections (##) and occasional H3. Do not use an H1; the title is set separately. Aim for 900 to 1600 words. Tables are welcome where they compare options.

Evidence rules, which matter more than style:
- Every external factual claim must be supported by a source you list. Prefer FSSAI, Indian government departments, ICAR institutes, state agricultural universities, Codex Alimentarius, and peer-reviewed research. Never cite sellers' marketing pages as evidence.
- List only sources you are confident exist at the exact URL. If you are not sure a page exists, leave it out and mark the claim "needs-evidence" instead.
- Do not state or imply that any food cures, prevents or treats a condition, aids weight loss, detoxifies, or boosts immunity.
- Do not call anything organic, A2, certified, 100% pure, chemical-free, or from a particular place.
- Never invent first-hand experience, customer stories, testimonials, reviews, statistics, credentials, prices, stock or delivery promises. Desi Nature's own process is unknown to you; do not describe it.
- If the evidence is too thin to write a useful article, say so: output only the line "INSUFFICIENT_EVIDENCE:" followed by what is missing.

Links: include two to four relative internal links from the brief's list, where they genuinely help. End with one calm next step for the reader (an enquiry or another guide), never a hard sell.

Output format: one Markdown file and nothing else, starting with YAML frontmatter between --- lines, using exactly these keys:
title, slug, description (110-160 characters), updatedAt (YYYY-MM-DD), author ("desi-nature-editorial"), category, tags (list), targetQuery, secondaryQueries (list), searchIntent, audience, status ("draft"), healthSensitive (true/false), imageBrief, relatedPosts (list), relatedProducts ([]), sources (list of {title, url, publisher, accessed (YYYY-MM-DD), verification: "search-summary-only", note}), claims (list of {text, sources (list of source indexes, from 0), status: "supported" | "needs-evidence" | "opinion", sensitive (true/false)}).
List every external factual claim in claims, including any you could not support.`;

export function buildBrief(topic: Topic, today: string): string {
  return [
    `Today's date: ${today}`,
    ``,
    `Write the article for this brief.`,
    ``,
    `Working title: ${topic.workingTitle}`,
    `Slug (use exactly): ${topic.slug}`,
    `Category (use exactly): ${topic.category}`,
    `Primary search query: ${topic.primaryQuery}`,
    `Secondary questions to answer: ${topic.secondaryQuestions.join("; ") || "none listed"}`,
    `Search intent: ${topic.intent}`,
    `Reader: ${topic.reader}`,
    `What this article should add beyond existing pages: ${topic.originalContribution}`,
    `Evidence notes: ${topic.evidence}`,
    topic.risk ? `Risks to avoid: ${topic.risk}` : null,
    `Internal links you may use: ${topic.internalLinks.join(", ") || "/contact"}`,
    `Call to action: ${topic.cta}`,
  ]
    .filter((l) => l !== null)
    .join("\n");
}

/** A brief for a person writing the draft by hand (manual mode). */
export function buildManualBrief(topic: Topic, today: string): string {
  return `# Brief: ${topic.workingTitle}

Prepared ${today} by the weekly content pipeline. No AI provider is configured, so this draft must be written by a person (or in a Claude Code session) and saved as \`content/blog/${topic.slug}.md\` with \`status: "draft"\`.

| Field | Value |
| --- | --- |
| Slug | ${topic.slug} |
| Category | ${topic.category} |
| Primary query | ${topic.primaryQuery} |
| Secondary questions | ${topic.secondaryQuestions.join("; ") || "-"} |
| Intent | ${topic.intent} |
| Reader | ${topic.reader} |
| Cluster | ${topic.cluster} |
| Competitors | ${topic.competitors} |
| Evidence so far | ${topic.evidence} |
| Original contribution | ${topic.originalContribution} |
| Internal links | ${topic.internalLinks.join(", ") || "-"} |
| Call to action | ${topic.cta} |
| Risks | ${topic.risk ?? "-"} |
| Confidence | ${topic.confidence} |

## Before writing
1. Check the query in Google autocomplete and Google Trends (India); note what you find in \`content/topics/calendar.json\`.
2. Open the top results and note what they miss. Do not copy them.
3. Collect two to five sources from FSSAI, ICAR, state agricultural universities, Codex or peer-reviewed research. Open each one and quote the sentence that supports your claim.

## Outline
1. Direct answer to "${topic.primaryQuery}" in two paragraphs.
${topic.secondaryQuestions.map((q, i) => `${i + 2}. ${q}`).join("\n")}
${topic.secondaryQuestions.length + 2}. Practical checklist.
${topic.secondaryQuestions.length + 3}. Next step: ${topic.cta}.

## Rules
Follow docs/EDITORIAL-GUIDE.md: no health, organic, A2, certification or origin claims without documents; no invented experience; every external fact listed under \`claims\` with its source.
`;
}
