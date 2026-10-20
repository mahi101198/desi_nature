# Desi Nature: implementation and operations report

Date: 20 October 2026. Branch: `ccr-b665f95a-vnbzvv` on `mahi101198/desi_nature`.

## 1. What was implemented

**Website** (Next.js 16.4 App Router, TypeScript strict, Tailwind 4, statically generated):

- Pages: `/`, `/blog`, `/blog/[slug]`, `/categories/[slug]` (only with published articles; noindex below 2), `/products` (enquiry categories: ghee, honey, grains and flours), `/products/[slug]` (only for owner-verified products, none yet), `/about`, `/contact`, `/privacy-policy`, `/terms`, `/editorial-policy`, `/author/[slug]` (only owner-supplied people, none yet), custom 404.
- Design direction "the page is the object" (from the installed taste-skill): one typeface (EB Garamond), a rose-grey ground with field green, and sections made as stationery — a stack of ledger folders as the hero, a receipt slip for the enquiry process, a perforated coupon for the enquiry form, a letter, a block wordmark footer. Live element: **"This month in Indian fields"**, a month picker showing the kharif/rabi/zaid season and a related kitchen note.
- Reusable components: header, footer, breadcrumbs (+ JSON-LD), article cards, related posts, share links, FAQ, enquiry form/coupon, WhatsApp button, policy page shell, drawings.
- Enquiries: form → `/api/enquiry` (Zod validation, honeypot, fill-time check, link-spam check, per-IP rate limit, no personal data in logs) → configurable webhook. Without a webhook the form hands the visitor a prefilled WhatsApp/email message instead of losing it.

**Technical SEO**: unique titles/descriptions; canonical URLs on `https://desinature.in`; `sitemap.xml` (only live, indexable URLs); `robots.txt` (production allows and lists sitemap; preview/dev disallow all); Open Graph + Twitter cards; generated OG image; Organization, WebSite, BlogPosting, BreadcrumbList JSON-LD; Product JSON-LD only for verified products (offers only with a real price); one H1 per page; noindex for previews, thin categories and 404; redirects for common alternative paths; security headers (CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy); self-hosted fonts via `next/font`.

**Content system**: Markdown + YAML frontmatter validated by Zod (title, slug, description, dates, author, category, tags, target query and intent, audience, sources with verification level and optional quote, claims with status, featured image, related posts/products, status draft/review/approved/published, health sensitivity, reviewer). Raw HTML disabled and output sanitised.

**Editorial quality gates**: missing/unverified sources, unresolved and unreviewed claims, risky health/purity/organic/A2/certification terms, invented social proof, filler phrases, keyword stuffing, thin content, heading problems, broken or non-production links, duplicates.

**Reference article**: `content/blog/how-to-store-ghee-at-home.md` (~1,300 words, 4 sources, 6 recorded claims). Status **review**, not published — see §4.

**Topic research and calendar**: `content/topics/calendar.json` with 16 topics over 8 weeks (two per week), each with query, questions, intent, reader, cluster, competitors, evidence, original contribution, internal links, CTA, confidence and research date. Metrics are marked unknown. Two topics are honestly `blocked` pending owner facts. Readable: `docs/CONTENT-CALENDAR.md`. Research method: `docs/KEYWORD-RESEARCH.md`.

**Two-articles-a-week pipeline**: `scripts/weekly-pipeline.ts` + `.github/workflows/content-pipeline.yml` (Tue/Fri). Selects non-duplicate topics, writes a brief, drafts through the provider, forces status `draft`, resets source verification, validates, writes social drafts and a report, records blocked runs, and opens a pull request. Idempotent per slot, locked, concurrency-limited, retryable with `--force`.

**AI provider interface**: `manual` (default, free), `anthropic` (official SDK, streaming, retries, refusal fallback, optional web search), `ollama` (local). Never activated implicitly.

**Publishing modes**: Mode A `review` (default) and Mode B `autonomous`, switchable by the `PUBLISH_MODE` variable or `content/pipeline.config.json`. `npm run content:publish -- <slug>` re-runs every gate.

**Backlinks**: prospect schema and tracker (`data/backlinks/prospects.json`, 8 prospects, none verified, no guessed contacts), weekly report with live-link re-check, outreach template requiring owner approval (`docs/BACKLINKS.md`).

**Social**: per-article LinkedIn, Instagram, Facebook, short-video script, visual brief and CTA from the article's own text (`content/social/how-to-store-ghee-at-home.md` generated).

**Analytics and search**: Vercel Web Analytics component; GA4 only with ID + consent + production; conversion events without personal data; Search Console and Bing verification via env vars; setup guide `docs/SEARCH-AND-ANALYTICS.md`, including a free Google Sheet webhook for leads.

**Docs**: README (dev, testing, deployment, scheduling, rollback, troubleshooting), editorial guide, workflow, research, backlinks, search & analytics, deployment + GoDaddy checklist, `.env.example` (names only).

## 2. Tests actually run (all on 20 Oct 2026, in this container)

| Check | Result |
| --- | --- |
| `npm run lint` (ESLint, next config) | pass, 0 errors, 0 warnings |
| `npm run typecheck` (`next typegen && tsc --noEmit`, strict) | pass |
| `npm test` (Vitest) | **50/50 pass**: frontmatter validation and invalid frontmatter, duplicate slugs, draft vs published vs scheduled visibility, preview never in production, Markdown sanitising (script/onerror/javascript:/iframe removed), quality gates (broken internal links, health/purity terms, invented proof, unresolved claims, H1, thin content, duplicate targets), sitemap contents and canonical domain, robots per environment, JSON-LD (BlogPosting, breadcrumbs, product gating, `</script>` escaping), topic selection and duplicates, draft processing (status forced to draft), publish gates for both modes, config by env, provider selection, enquiry validation, bot detection, rate limiting, backlink schema |
| `npm run content:validate` | pass (reference article reported "not ready": 4 unverified sources, expected) |
| `npm run content:links` | pass (internal links) |
| `npm run build` | pass; all pages static except `/api/enquiry` |
| HTTP status checks against `next start` | 200 for all public pages, sitemap, robots, OG image, icon; 404 for unpublished article, empty category, unknown product/author, unknown path; 308 for `/shop`; enquiry API: 503 + fallback without webhook, 422 invalid, 415 wrong type, 405 GET, 429 after 5 requests |
| Preview build (`SITE_ENV=preview CONTENT_PREVIEW=true`) | article renders with banner, `noindex, follow`, canonical on desinature.in, BlogPosting + BreadcrumbList + Organization + WebSite JSON-LD, one H1; robots.txt disallows all |
| Security headers | CSP, HSTS, X-Frame-Options DENY, Referrer-Policy present |
| taste-skill `lint.mjs` (design rules) | 0 FAIL, 0 WARN (three CSS masks and the filler-phrase list annotated as intentional) |
| taste-skill `inspect.mjs`, real Chromium at 1440/768/390 | Homepage: **2 FAIL, 4 WARN**. FAIL `few-pictures` (no real photographs: image archives were unreachable from this container and there are no owner photos), FAIL `blank-gap` (a 660 px stretch near the coupon/footer, not resolved). WARN no video, right margin 56 vs 32 px at 1440, coupon "empty middle", 436 px gap on phone. Headlines ≤2 lines, single typeface, 7 sizes, body 20 px, no overflow. Inner pages: 4 FAIL each (no pictures, little motion, no dominant first-screen element on text pages, blank gaps). Screenshots were reviewed for home, article (desktop and mobile). |
| `npm audit` | production deps: 4 moderate (`sprintf-js` via `gray-matter`'s bundled YAML parser, build-time only, own content files); dev deps: 5 high (`braces` via `eslint-config-next`). No fix without breaking changes; revisit when upstream updates. |

**Not run:** Lighthouse / PageSpeed (no deployment exists to measure; no scores are claimed), automated accessibility audit with axe (manual: skip link, focus styles, labels, alt text, ARIA on tabs/accordion, contrast checked by the inspector), external link check (`--external`) and source verification (outbound access to source sites is blocked in this container).

## 3. Deployment

**Not completed.** The Vercel connection works (account `mahi8890537686-5846`, Hobby plan), but Vercel's GitHub link is the account `mahi8890537686-cloud`, which cannot see `mahi101198/desi_nature`; creating the project from the repo returned `repo_not_found`. No project, deployment, domain or DNS change exists. Exact steps: `docs/DEPLOYMENT.md`.

Also note: Vercel Hobby is for non-commercial use under Vercel's terms; a business site is expected to use Pro (paid). Your decision.

## 4. Integrations and status

| Item | Status |
| --- | --- |
| Domain desinature.in | **Not live, not verified.** DNS untouched (GoDaddy). |
| Vercel project | Not created (GitHub access, see §3) |
| GitHub Actions CI | Workflow committed; will run on GitHub's side on the next push (result not observed here) |
| Content pipeline schedule | **Prepared, not active**: the workflow file exists; it runs on schedule only once on the default branch, in manual mode until you add a provider |
| Automated AI drafting | **Not operational**: no provider configured. Manual mode works (tested with `--dry-run`). Anthropic requires a separate paid API key. |
| Enquiry delivery | Webhook not configured; WhatsApp number and email not set, so the fallback currently has no channel |
| Search Console, Bing, GA4 | Not configured (need your accounts) |
| Vercel Web Analytics | Code present; enable in the Vercel dashboard after import |
| Backlinks | 8 prospects, none verified, no outreach sent, **no links earned** |
| Reference article | In review. The 4 sources were found through web search but could not be opened from this container; you must open each one, confirm the claim, add a quote, mark it `opened-and-checked`, then approve and publish |

## 5. Tasks that need you

1. Give Vercel access to the repo (connect GitHub account `mahi101198` or transfer the repo) and import it (DEPLOYMENT.md steps 1–2). Decide Hobby vs Pro.
2. Supply contact details: WhatsApp number and enquiry email (env vars), and set up the free Google Sheet webhook for enquiries.
3. Add the domain in Vercel and set the DNS records Vercel shows in GoDaddy (A `@`, CNAME `www`); remove GoDaddy parking/forwarding.
4. Verify Search Console (DNS TXT) and submit the sitemap; optionally Bing and GA4.
5. Review the ghee article: open the 4 sources (FAO Codex standard list, Department of Consumer Affairs ghee report, NIFTEM ghee packaging PDF, Krishikosh record), confirm, approve, publish.
6. Business facts only you can supply: who runs Desi Nature and the real sourcing story (About page placeholder), legal business name/address (privacy policy), returns/refund/delivery terms, which products are actually available, FSSAI registration/licence details. Review the privacy policy and terms, ideally with legal advice, before taking orders.
7. Photographs: real photos of your ghee, honey, grains, kitchen or farm (the site currently uses drawings; the design is built to take large photographs).
8. Optional: an Anthropic API key + `AI_PROVIDER=anthropic` to automate drafting; keep `PUBLISH_MODE=review`.
9. Confirm backlink prospects (open the pages listed in `reports/backlinks/`) and approve any outreach.

## 6. Ongoing costs and limits

- Hosting: US$0 on Vercel Hobby, but Hobby is for non-commercial use; Pro is currently US$20/user/month.
- Domain renewal at GoDaddy (existing).
- GitHub Actions: free for public repos; private repos have a monthly free-minute allowance (each pipeline run ≈ 2–5 minutes).
- AI drafting: US$0 in manual mode. With Anthropic (`claude-opus-5-5`), roughly US$0.15–0.30 per draft, about US$1.50–3/month for two a week, plus web-search fees if enabled. Check current pricing first.
- Everything else (Search Console, Bing, GA4, Apps Script webhook, Vercel Web Analytics basic) is free within its limits.

## 7. Next three priorities

1. **Get the site deployed**: fix the Vercel–GitHub access, import, set contact env vars, add the domain and GoDaddy DNS. Then ask Claude Code to verify the live site and run PageSpeed.
2. **Publish the first article properly**: verify its four sources, add your own photograph, approve and publish; submit the sitemap in Search Console.
3. **Supply the business facts and photographs** (sourcing story, available products, FSSAI details, contact details). They unlock the About page, product pages and the two blocked topics, and make every article more trustworthy.
