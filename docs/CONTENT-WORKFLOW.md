# Content workflow: two articles a week

## Overview

```
calendar.json ──► weekly pipeline (Tue + Fri) ──► brief ──► draft (provider or person)
                                                           │
                       validate + social drafts ◄──────────┘
                                │
                     pull request for the owner
                                │
          owner reads, verifies sources, sets status: approved + reviewedBy
                                │
             npm run content:publish -- <slug>  ──► commit/merge ──► Vercel deploy
                                │                                   (sitemap updates)
                     Search Console URL inspection, social posts
```

Each run drafts **one** topic (two runs a week = two articles). A run never overwrites an existing article, and records a `blocked` outcome instead of padding when evidence is thin.

## Running it

| Command | What it does |
| --- | --- |
| `npm run pipeline:weekly` | Run this week's slot (idempotent per slot; `--force` to repeat, `--dry-run` to preview) |
| `npm run content:validate` | Schema + quality gates; writes `reports/quality/latest.md` |
| `npm run content:links` | Internal links (`--external` also checks external URLs, politely) |
| `npm run content:verify-sources -- <slug> [--write]` | Confirms each source's `quote` appears on its page |
| `npm run content:social -- <slug>` | Writes social drafts to `content/social/<slug>.md` |
| `npm run content:publish -- <slug>` | Publishes an approved article after re-running every gate |
| `npm run backlinks:report` | Weekly backlink report in `reports/backlinks/` |

Reports land in `reports/pipeline/<week>-a|b.md`.

## Scheduler

`.github/workflows/content-pipeline.yml` runs Tuesdays and Fridays at 06:10 IST, plus a manual "Run workflow" button. It commits briefs, drafts and reports to a new branch and opens a pull request. It cannot publish to production by itself: merging is the owner's decision.

Why GitHub Actions rather than Vercel Cron: the pipeline writes files to the repository, may run for many minutes, and needs secrets that should never reach the website. Vercel Cron calls a URL on the deployed site, which has a read-only filesystem and short function limits. Claude Code being open in a terminal is not required.

Limits and costs: GitHub Actions is free for public repositories and includes a monthly allowance of free minutes for private ones (each run takes about 2–5 minutes). Check your plan's current allowance under GitHub → Settings → Billing. Scheduled workflows in repositories with no activity for 60 days are paused by GitHub; any push re-enables them.

Duplicate-run protection: workflow `concurrency`, a lock file, and one report per slot (`2026-W44-a`). Retry: Actions → Content pipeline → Run workflow with "force".

## AI providers

Set as repository **variables** (Settings → Secrets and variables → Actions):

| Provider | `AI_PROVIDER` | Needs | Cost |
| --- | --- | --- | --- |
| Manual (default) | `manual` or unset | nothing | free; the pipeline writes briefs and a person drafts (e.g. in a Claude Code session) |
| Anthropic | `anthropic` | secret `ANTHROPIC_API_KEY` from console.anthropic.com; optional `ANTHROPIC_MODEL`, `ANTHROPIC_WEB_SEARCH=true` | billed per token (and per search) on your Anthropic API account |
| Ollama | `ollama` | `OLLAMA_MODEL`, `OLLAMA_URL`; a machine running Ollama (use a self-hosted runner or run locally) | free, your hardware |

**Important:** a Claude Code or claude.ai subscription does not include an Anthropic API key, and does not authorise unattended API calls. API usage is a separate, paid account. Nothing in this project switches on paid usage by itself: an API key with `AI_PROVIDER` unset still runs in manual mode.

Rough Anthropic cost per draft (default `claude-opus-5-5`, about 3k input and 6–10k output tokens with thinking): roughly US$0.15–0.30, plus web-search fees if enabled. Two drafts a week ≈ US$1.50–3 a month. Check current pricing before enabling.

API keys live only in GitHub Actions secrets. They are never sent to Vercel, the browser, or the logs.

## Publishing modes

Set `PUBLISH_MODE` (repository variable) or `publishMode` in `content/pipeline.config.json`.

**Mode A, `review` (default).** Drafts wait for the owner. Only `npm run content:publish` publishes, and only `approved` articles with `reviewedBy`.

**Mode B, `autonomous`.** A freshly drafted article is marked published in the pipeline's pull request only if *all* of these hold: an AI provider is configured; every quality gate passes; every source is `opened-and-checked` (in practice, `verify-sources` confirmed its quote); there are no `needs-evidence` claims; it is not health-sensitive and has no sensitive claims. Merging the pull request deploys it. Because drafts from a model start with unverified sources, Mode B will usually still stop for a person; that is intentional.

## Owner's weekly routine (about 60–90 minutes)

1. Open the pipeline pull request. Read `reports/pipeline/*.md`.
2. For each draft: open every source, check the claim, add a `quote`, set `verification: "opened-and-checked"`. Rewrite anything vague; add your own photographs and experience where true.
3. Set `status: "approved"`, `reviewedBy: "<your name>"`, `reviewedAt: "<date>"`.
4. Run `npm run content:publish -- <slug>` (or ask Claude Code to), commit, merge.
5. After deploy: check the URL, request indexing in Search Console, post the social drafts.

## Social repurposing

Each draft gets `content/social/<slug>.md`: LinkedIn post, Instagram caption, Facebook post, a 30–45 second Reels/Shorts script, a visual brief and a call to action. They reuse only the article's own text. Edit and post by hand; nothing is posted automatically.
