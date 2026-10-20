# Topic research workflow

Goal: pick topics real people search for, where Desi Nature can be genuinely more useful. Use free, legitimate sources only. Never bypass CAPTCHAs, robots rules or rate limits, and never invent volumes or difficulty scores: write `unknown` instead.

## Sources, in order of value

1. **Google Search Console** (after verification): Performance → Search results → Queries. Look for queries with impressions but few clicks, and questions you have no page for.
2. **Google Trends** (trends.google.com, region India, past 5 years): compare candidate phrasings; note seasonality (e.g. grain storage peaks around harvest and monsoon).
3. **Google autocomplete and "People also ask"**: type the query in an incognito window, set to India; record the suggestions by hand.
4. **Search results**: open the top 5–10. Note what they answer, what they miss, and whether they are brands, government pages or forums.
5. **Bing Webmaster Tools** (after verification): keyword research tool and search performance.
6. **Real customer questions**: enquiries, WhatsApp messages, conversations at the farm. These are the best topics.
7. **Public communities** (Reddit r/india, r/IndianGardening, Quora, gardening Facebook groups): read only; follow each site's rules; never post links for SEO.

## For each topic, record in `content/topics/calendar.json`

`primaryQuery`, `secondaryQuestions`, `intent`, `reader`, `cluster`, `competitors` (what the top results are), `evidence` (what you saw in Trends / autocomplete / GSC, with the date), `originalContribution`, `internalLinks`, `cta`, `confidence` (low/medium/high), `researchDate`.

## Choosing

Write a topic when:

- people demonstrably ask it (autocomplete, PAA, GSC, customers), and
- you can add something specific (Indian conditions, first-hand photos, a better checklist), and
- it connects to a product or to the brand's knowledge, and
- it is not a near-duplicate of an existing page (the pipeline also checks this).

Skip or merge topics that would produce thin, repetitive pages. Do product-specific pages only for products that exist and can be supplied.

## Initial focus clusters

Farm-sourced foods; ghee, honey and grains actually available; food storage and buying guidance; practical Indian gardening; farm-to-home sourcing transparency. See [CONTENT-CALENDAR.md](CONTENT-CALENDAR.md).
