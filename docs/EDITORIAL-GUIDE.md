# Editorial guide

The public version of these rules is the [editorial policy page](../src/app/editorial-policy/page.tsx). This file is the working checklist for anyone (person or AI) writing for the journal.

## What every article must do

- Answer its primary query directly, in the first two paragraphs.
- Be written for a person in an Indian home, not for a search engine.
- Add something the top results do not: Indian seasons and conditions, a comparison table, a checklist, the owner's real photographs or experience.
- Give practical detail and examples; end with one calm next step.
- Link naturally to two to four relevant internal pages.

## Evidence

| Kind of statement | What it needs | Frontmatter `claims` status |
| --- | --- | --- |
| External fact (a regulation, a number, a scientific finding) | A cited source you have opened | `supported`, with source indexes |
| Practical advice that follows from facts | Reasoning in the text | `opinion` |
| Something the owner has seen or done | Owner confirmation; `reviewedBy` set | `owner-experience` |
| Anything you could not support yet | Nothing is published until resolved | `needs-evidence` |

Source preference: FSSAI and Indian government departments → ICAR institutes, KVKs and state agricultural universities → Codex Alimentarius and peer-reviewed research → established reference works. Sellers' marketing pages are never evidence.

For each source record `title`, `url`, `publisher`, `accessed` and `verification`:

- `opened-and-checked`: a person opened the page and confirmed it supports the claim. Add a `quote` (an exact sentence) so `npm run content:verify-sources -- <slug>` can re-check HTML pages automatically.
- `search-summary-only`: found through search but not opened. Blocks publication.
- `owner-supplied`: a document the owner holds (a lab report, a licence). Blocks publication until opened and checked.

## Never

- Health claims: cures, prevents, treats, boosts immunity, detox, weight loss. Nutrition statements need strong evidence, `sensitive: true` on the claim and `healthSensitive: true` plus a named human reviewer.
- Organic, A2, certified, 100% pure, chemical-free, single-origin, unless the owner holds the documents for that batch.
- Invented experience, customers, testimonials, reviews, statistics, credentials, prices, stock or delivery promises.
- Copying competitors. Read them to find gaps, then write your own.
- Many near-identical pages for keyword variants. One strong page per question.
- Keyword stuffing. Use the query where it reads naturally.
- Filler: "in today's fast-paced world", "delve into", "game-changer", "in conclusion" and similar (the validator flags these).

## Status workflow

`draft` → `review` → `approved` → `published`

1. **draft**: being written. Visible nowhere.
2. **review**: ready for the owner. Visible on preview deployments only (with a banner and `noindex`).
3. **approved**: the owner has read it against its sources and set `reviewedBy` and `reviewedAt`.
4. **published**: set only by `npm run content:publish -- <slug>`, which re-runs every gate.

## Automated checks (`npm run content:validate`)

Schema, duplicate slugs and targets, H1 in body, heading order, word count, title and description length, unknown category or author, missing or unverified sources, unresolved and unreviewed claims, risky terms, invented social proof, filler phrases, keyword density, broken or non-production internal links, missing image alt text.

**A passing script is not proof of quality.** Someone must still read the article against its sources and ask: would a reader in an Indian kitchen be glad they found this?

## Frontmatter reference

See `content/blog/how-to-store-ghee-at-home.md` (the reference article) and `src/lib/content/schema.ts`.

## Images

- Prefer the owner's own photographs of real batches, kitchens and farms. Save under `public/images/blog/<slug>/`, at least 1600 px wide, and set `featuredImage` with true `alt` text, `width` and `height`.
- Never present stock or found photographs as Desi Nature's own product, farm or people. If you use a licensed image, record `credit`, `license` and `sourceUrl`.
