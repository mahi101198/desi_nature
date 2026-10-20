# Deployment: GitHub → Vercel → GoDaddy DNS

## Current state (20 October 2026)

- Code is on GitHub: `mahi101198/desi_nature`, branch `ccr-b665f95a-vnbzvv` (currently the repository's only and default branch).
- The Vercel account (`mahi8890537686-5846`, Hobby plan) is linked to the GitHub account **mahi8890537686-cloud**, not to **mahi101198**. Vercel therefore cannot see this repository, and project creation from it failed with `repo_not_found`. **No Vercel project or deployment exists yet.**
- The domain has not been added to Vercel and no DNS has been changed.

## Before you deploy: Vercel plan

Vercel's Hobby plan is free but its terms limit it to non-commercial, personal use. A site that takes enquiries for products is commercial. For production use, Vercel expects the Pro plan (currently US$20 per user per month; check vercel.com/pricing). Options: start on Hobby while the site has no sales and upgrade before taking orders, or choose Pro from the start. This is your decision; nothing here buys anything.

## Step 1: give Vercel access to the repository (you)

Pick one:

- **A. Connect the right GitHub account**: vercel.com → Account Settings → Authentication / Git → connect GitHub as **mahi101198**, then on GitHub install the Vercel app for `desi_nature` (github.com/apps/vercel → Configure → Only select repositories → `desi_nature`).
- **B. Move the repo**: transfer `desi_nature` to `mahi8890537686-cloud` (GitHub → repo Settings → Transfer), which Vercel already sees.

Optionally create a `main` branch first and make it the default (GitHub → Settings → Branches), so production deploys from `main` and the session branch can be deleted later.

## Step 2: import the project

vercel.com/new → Import `desi_nature` → Framework: Next.js (auto) → Root directory: `/` → Build command: default (`next build`) → Install: default (`npm install`) → Node 22.

Environment variables (Settings → Environment Variables). Only these are needed to start:

| Name | Value | Environments |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://desinature.in` | Production, Preview |
| `CONTENT_PREVIEW` | `true` | Preview only (shows articles in review on preview URLs, noindexed) |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | your number with country code, digits only | Production, Preview |
| `NEXT_PUBLIC_CONTACT_EMAIL` | your enquiry email | Production, Preview |
| `ENQUIRY_WEBHOOK_URL` | Apps Script URL (see SEARCH-AND-ANALYTICS.md) | Production (Sensitive) |

Never add `ANTHROPIC_API_KEY` to Vercel; the website does not need it.

Deploy. Then tell Claude Code "the Vercel project is imported" and it can verify the deployment through the Vercel connection: homepage, `/blog`, a preview article, `/sitemap.xml`, `/robots.txt`, metadata.

## Step 3: add the domain in Vercel

Project → Settings → Domains → add `desinature.in`, then `www.desinature.in`. Choose **redirect www → desinature.in (308)** so there is one canonical host (the site's canonical URLs use the apex).

Vercel then shows the exact DNS records to create. **Use the values Vercel shows for your project**; they can differ per project. Typically:

| Type | Name | Value |
| --- | --- | --- |
| A | `@` | the IP Vercel shows (historically `76.76.21.21`) |
| CNAME | `www` | the target Vercel shows (e.g. `cname.vercel-dns.com` or a project-specific `*.vercel-dns-0xx.com`) |

## Step 4: GoDaddy DNS checklist (you)

1. Sign in to GoDaddy → My Products → `desinature.in` → **DNS** (Manage DNS). Do not change nameservers and do not transfer the domain.
2. Note what exists now (screenshot it, so you can roll back).
3. **A record `@`**: edit the existing one (GoDaddy often has a "Parked" A record) to the IP Vercel shows. Delete any other A records for `@`. TTL: 1 hour or the minimum.
4. **CNAME `www`**: edit the existing `www` CNAME (often `@` or `desinature.in`) to the target Vercel shows.
5. Remove any GoDaddy **Forwarding** set up for the domain (Domain → Forwarding), and any AAAA record for `@` (Vercel uses IPv4 here unless it shows otherwise).
6. Leave MX, TXT (email, Google verification) and other records alone.
7. Save. Propagation usually takes minutes, sometimes up to 48 hours.
8. In Vercel → Domains, wait for both to show **Valid Configuration**. Vercel issues HTTPS certificates automatically.

## Step 5: verify after DNS (Claude Code or you)

```bash
curl -sI https://desinature.in | head -5            # 200, served by Vercel
curl -sI https://www.desinature.in | grep -i location   # 308 → https://desinature.in/
curl -sI http://desinature.in | grep -i location     # → https
curl -s https://desinature.in/robots.txt             # Allow, Sitemap line
curl -s https://desinature.in/sitemap.xml | head     # only https://desinature.in URLs
curl -s https://desinature.in | grep -o '<link rel="canonical"[^>]*>'
```

Then: Search Console (SEARCH-AND-ANALYTICS.md), and PageSpeed Insights (pagespeed.web.dev) on the homepage and an article; record real scores in the operations report.

## Rollback

- **Bad deploy**: Vercel → Deployments → pick the last good one → "Promote to Production" (instant, no rebuild). Or `git revert <commit>` and push.
- **Bad article**: set its `status` back to `review` (or delete the file), commit, push. It leaves the site and the sitemap on the next deploy.
- **DNS problem**: restore the GoDaddy records from your screenshot.

## Free-tier notes

Vercel Hobby (if you use it): limited build minutes, bandwidth and function invocations per month, one concurrent build, Web Analytics with a small event allowance and no custom events. This site is almost entirely static, so usage should be small. GitHub Actions: free for public repos; private repos get a monthly free-minute allowance.
