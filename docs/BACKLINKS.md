# Earning backlinks, honestly

Links are earned by making something worth citing and offering it to the right people. A handful of relevant links from real Indian food, farming and regional sites is worth more than hundreds of weak ones. Nothing here promises links, rankings or "domain authority".

## Never

Buying links; link exchanges as a scheme; private blog networks; spam comments or forum posts; fake profiles; mass or automated guest posts; adding promotional links to Wikipedia; guessing anyone's email; claiming a site accepts submissions without seeing it say so.

## The tracker

`data/backlinks/prospects.json` (validated by `src/lib/backlinks.ts`). Each prospect records: organization, website and page, type, relevance, why it fits, whether an editorial link seems possible, guidelines, public contact (only with the page it came from), date checked, verification status, evidence, suggested contribution, outreach status, link status and last verification date.

Verification levels: `unverified` → `search-result-only` → `page-checked` (a person opened the guidelines) → `owner-confirmed`. Outreach can only be marked `sent` once a prospect is verified.

`npm run backlinks:report` writes `reports/backlinks/<week>.md` with new prospects, drafts awaiting approval, follow-ups, links actually earned and what needs re-checking (`--check-live` re-fetches pages carrying live links). The content pipeline workflow runs it weekly.

## Kinds of opportunity worth pursuing

- **Original material**: the owner's farm photographs (on Wikimedia Commons under a free licence, or offered to journalists), a simple storage experiment written up with method and photos, a seasonal calendar of what is harvested where.
- **Publications that accept contributions** (e.g. rural-India and agriculture publications with a "write for us" page) — a reported, non-promotional story.
- **Real relationships**: supplier farms, local KVK or extension programmes, farmer producer organisations, local business associations.
- **Legitimate listings**: Google Business Profile (with a real address/service area), relevant regional directories you would actually want customers to use.
- **Expert requests**: answer journalists only where the owner has first-hand knowledge.

## Outreach (always approved by the owner before sending)

Template, to personalise every time:

> Subject: [specific idea] for [publication]
>
> Hello [name from their own contact page],
>
> I read [specific article of theirs] and [one genuine, specific reaction].
>
> I run Desi Nature, a small business that [one true sentence]. I'd like to offer [the contribution: a reported story / photographs / a practical guide] about [topic], because [why it fits their readers]. [One line on what makes it original: photographs from the farm, first-hand detail.]
>
> If it fits, I can send a draft by [date]. If not, no reply needed — thank you for your work.
>
> [Name], Desi Nature, desinature.in

Record the draft in `outreachDraft`, set `outreachStatus: "drafted"`, and send only after the owner approves. Never send more than one follow-up.
