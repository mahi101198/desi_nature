# Desi Nature

Website and journal for **Desi Nature** (https://desinature.in): Indian farm foods by enquiry, and practical guides on storing, choosing and growing food. Built with Next.js 16 (App Router), TypeScript (strict), Tailwind CSS 4 and Markdown content in Git. No database, CMS or paid service is required.

## What's here

| Path | Purpose |
| --- | --- |
| `src/app/` | Pages: `/`, `/blog`, `/blog/[slug]`, `/categories/[slug]`, `/products`, `/products/[slug]`, `/about`, `/contact`, `/privacy-policy`, `/terms`, `/editorial-policy`, `/author/[slug]`, 404, `sitemap.xml`, `robots.txt`, OG image, `/api/enquiry` |
| `src/lib/content/` | Zod schemas, Markdown loading and sanitised rendering, quality checks |
| `src/lib/pipeline/` | Topic selection, prompts, draft processing, publish gates, social drafts |
| `src/lib/providers/` | AI provider interface: manual (default), Anthropic, Ollama |
| `content/blog/` | Articles (`<slug>.md` with frontmatter) |
| `content/topics/calendar.json` | Topic backlog and 8-week calendar ([readable](docs/CONTENT-CALENDAR.md)) |
| `content/products/`, `product-categories.json` | Food categories; product pages only for owner-verified products |
| `content/authors/` | Author profiles; public author pages only for owner-supplied people |
| `content/social/`, `content/briefs/` | Social drafts and writing briefs |
| `data/backlinks/prospects.json` | Backlink prospect tracker |
| `scripts/` | CLI tools (see below) |
| `reports/` | Pipeline, quality, backlink reports; [operations report](reports/OPERATIONS-REPORT.md) |
| `docs/` | Guides: [editorial](docs/EDITORIAL-GUIDE.md), [workflow](docs/CONTENT-WORKFLOW.md), [research](docs/KEYWORD-RESEARCH.md), [backlinks](docs/BACKLINKS.md), [search & analytics](docs/SEARCH-AND-ANALYTICS.md), [deployment & DNS](docs/DEPLOYMENT.md) |

## Local development

Requires Node 20.9+ (22 recommended).

```bash
npm install
cp .env.example .env.local      # fill in what you have; everything is optional
npm run dev                      # http://localhost:3000
```

To see articles that are in review locally: `SITE_ENV=preview CONTENT_PREVIEW=true npm run dev`.

## Checks

```bash
npm run lint
npm run typecheck
npm test                  # unit tests (Vitest)
npm run content:validate  # content schema + editorial gates → reports/quality/latest.md
npm run content:links     # internal links (add -- --external for external URLs)
npm run build
npm run check             # all of the above
```

CI runs the same checks on every push and pull request (`.github/workflows/ci.yml`).

## Photos

The site ships with illustrated artwork. To use real photographs, add files to `public/images/` with these names (`.webp`, `.jpg`, `.png` or `.avif`, at least 1600 px wide); they replace the artwork automatically on the next build:

| File name | Where it appears |
| --- | --- |
| `hero-ghee` | Homepage hero, large image |
| `hero-honey`, `hero-grains` | Homepage hero, small images |
| `product-ghee`, `product-honey`, `product-grains-and-flours` | Food cards and the Farm foods page |
| `about-farm` | About page and the homepage "Why Desi Nature" panel |

Article covers come from each article's `featuredImage` frontmatter. Only use photographs you own or are licensed to use, and never present stock photos as your own products or farm.

## Writing and publishing

See [docs/CONTENT-WORKFLOW.md](docs/CONTENT-WORKFLOW.md). In short:

```bash
npm run pipeline:weekly                     # pick a topic, write a brief, draft if a provider is set
npm run content:verify-sources -- <slug>    # re-check source quotes against live pages
npm run content:social -- <slug>            # social drafts
npm run content:publish -- <slug>           # only for status: approved with reviewedBy
```

Publishing is Git-based: commit the changed article and push; Vercel rebuilds and the sitemap updates. Default mode is **review**: nothing is published without the owner.

## Scheduling

`.github/workflows/content-pipeline.yml` runs Tuesday and Friday at 06:10 IST and opens a pull request with briefs/drafts/reports. Configure `AI_PROVIDER`, `PUBLISH_MODE` (variables) and `ANTHROPIC_API_KEY` (secret) in GitHub → Settings → Secrets and variables → Actions. Without them it runs free in manual mode.

## Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for Vercel import, environment variables, domain and the GoDaddy DNS checklist, verification commands and rollback.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| Build fails with "Invalid blog content" | Run `npm run content:validate`; it names the file and field. |
| Article missing on the live site | Only `status: published` with `publishedAt` on or before today is shown. Future dates are scheduled. |
| Article shows on preview but not production | Expected for `review`/`approved`. Publish it. |
| Enquiry form says "Almost there" | `ENQUIRY_WEBHOOK_URL` is not set; the form falls back to WhatsApp/email. |
| Enquiry form shows no WhatsApp/email buttons | Set `NEXT_PUBLIC_WHATSAPP_NUMBER` / `NEXT_PUBLIC_CONTACT_EMAIL` and redeploy. |
| Pipeline says "already completed" | It ran for this slot. Use `-- --force` or the workflow's "force" input. |
| Pipeline "Another run holds the lock" | Wait, or delete `reports/pipeline/.lock` if a run crashed (stale locks expire after 2 hours). |
| Category page 404 | Category pages exist only once they have a published article. |
| Product page 404 | Product pages exist only for products with `verified: true`. |

## Security notes

Article Markdown is rendered with raw HTML disabled and then sanitised. JSON-LD is escaped. The enquiry API validates input, has a honeypot and timing check, rate-limits per (hashed) IP, never logs personal data, and forwards only to a configured webhook. Secrets live in Vercel/GitHub environment settings, never in the repo or the browser. Security headers (CSP, HSTS, frame denial, referrer policy) are set in `next.config.ts`. Preview deployments are `noindex` and disallowed in robots.txt.
