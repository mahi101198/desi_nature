/**
 * Weekly content pipeline. Run by .github/workflows/content-pipeline.yml twice a
 * week, or by hand: `npm run pipeline:weekly -- [--dry-run] [--force]`.
 *
 * It selects up to two non-duplicate topics, writes a brief for each, asks the
 * configured provider for a draft (or records that a person must write it),
 * validates drafts, prepares social copy and writes a report. In the default
 * "review" mode it never publishes.
 */
import fs from "node:fs";
import path from "node:path";
import { buildQualityContext } from "../src/lib/content/context";
import { extractHeadings } from "../src/lib/content/markdown";
import { BLOG_DIR, CONTENT_DIR, readPostFiles, type Post } from "../src/lib/content/posts";
import { checkPost, type Issue } from "../src/lib/content/quality";
import { readPipelineConfig } from "../src/lib/pipeline/config";
import { processDraft } from "../src/lib/pipeline/draft";
import { buildBrief, buildManualBrief, DRAFT_SYSTEM_PROMPT } from "../src/lib/pipeline/prompts";
import { markPublished, publishDecision } from "../src/lib/pipeline/publish";
import { isoWeek, selectTopics } from "../src/lib/pipeline/select";
import { socialDrafts } from "../src/lib/pipeline/social";
import { readCalendar, writeCalendar } from "../src/lib/pipeline/topics";
import { getProvider, ManualStepRequired, ProviderError } from "../src/lib/providers";
import { acquireLock, args, rel, todayIso, writeFile } from "./lib/cli";

type TopicResult = {
  id: string;
  slug: string;
  title: string;
  outcome: "drafted" | "manual-brief" | "blocked" | "failed" | "published";
  detail: string;
  files: string[];
  issues?: Issue[];
  tokens?: { input?: number; output?: number; model?: string };
};

const REPORT_DIR = path.join(process.cwd(), "reports", "pipeline");

async function main() {
  const { flags, values } = args();
  const dryRun = flags.has("--dry-run");
  const week = values.get("week") ?? isoWeek();
  const runId = `${week}-${new Date().getUTCDay() <= 3 ? "a" : "b"}`;
  const reportJson = path.join(REPORT_DIR, `${runId}.json`);

  if (fs.existsSync(reportJson) && !flags.has("--force")) {
    console.log(`Run ${runId} already completed (${rel(reportJson)}). Use --force to run again.`);
    return;
  }

  const release = dryRun ? () => {} : acquireLock(path.join(REPORT_DIR, ".lock"));
  try {
    const config = readPipelineConfig();
    const provider = getProvider();
    const today = todayIso();
    const calendar = readCalendar();
    const posts = readPostFiles()
      .filter((r): r is Extract<typeof r, { ok: true }> => r.ok)
      .map((r) => r.post);

    const perRun = Math.min(Math.ceil(config.articlesPerWeek / 2), config.maxDraftsPerRun);
    const { selected, skipped } = selectTopics(calendar.topics, posts, perRun);
    const results: TopicResult[] = [];

    console.log(`Pipeline ${runId}: provider=${provider.name} mode=${config.publishMode} selecting ${perRun}${dryRun ? " (dry run)" : ""}`);
    if (!provider.isConfigured()) {
      console.log(`Provider "${provider.name}" is not configured: ${provider.missingConfiguration().join("; ")}`);
    }

    for (const topic of selected) {
      const briefFile = path.join(CONTENT_DIR, "briefs", `${topic.slug}.md`);
      const draftFile = path.join(BLOG_DIR, `${topic.slug}.md`);
      const result: TopicResult = { id: topic.id, slug: topic.slug, title: topic.workingTitle, outcome: "failed", detail: "", files: [] };
      if (!dryRun) {
        writeFile(briefFile, buildManualBrief(topic, today));
        result.files.push(rel(briefFile));
      }

      try {
        if (dryRun) throw new ManualStepRequired("Dry run: no provider call.");
        if (!provider.isConfigured()) throw new ManualStepRequired(`Provider "${provider.name}" is not configured.`);
        const draft = await provider.generate({ system: DRAFT_SYSTEM_PROMPT, prompt: buildBrief(topic, today) });
        result.tokens = { input: draft.inputTokens, output: draft.outputTokens, model: draft.model };
        const outcome = processDraft(draft.markdown, topic, draftFile);
        if (!outcome.ok) {
          if (outcome.insufficientEvidence) {
            topic.status = "blocked";
            topic.blockedReason = outcome.reason;
            result.outcome = "blocked";
          }
          result.detail = outcome.reason;
        } else {
          if (fs.existsSync(draftFile)) throw new Error(`${rel(draftFile)} already exists; not overwriting.`);
          writeFile(draftFile, outcome.source);
          const socialFile = path.join(CONTENT_DIR, "social", `${topic.slug}.md`);
          writeFile(socialFile, socialDrafts(outcome.post, extractHeadings(outcome.post.body).filter((h) => h.depth === 2).map((h) => h.text)));
          result.files.push(rel(draftFile), rel(socialFile));
          const ctx = buildQualityContext([...posts, outcome.post]);
          result.issues = checkPost(outcome.post, ctx, true);
          topic.status = "drafted";
          result.outcome = "drafted";
          result.detail = `${result.issues.filter((i) => i.severity === "error").length} error(s), ${result.issues.filter((i) => i.severity === "warn").length} warning(s) to resolve before approval`;
          maybeAutoPublish(outcome.post, draftFile, [...posts, outcome.post], provider.isConfigured(), result, today);
        }
      } catch (error) {
        if (error instanceof ManualStepRequired) {
          topic.status = "researching";
          result.outcome = "manual-brief";
          result.detail = error.message;
        } else if (error instanceof ProviderError) {
          result.detail = `${error.message}${error.retryable ? " (retryable: run again later or use --force)" : ""}`;
        } else {
          result.detail = (error as Error).message;
        }
      }
      results.push(result);
    }

    if (selected.length < perRun) {
      results.push({
        id: "-",
        slug: "-",
        title: "Not enough eligible topics",
        outcome: "blocked",
        detail: `Only ${selected.length} of ${perRun} topics were eligible. Add researched topics to content/topics/calendar.json.`,
        files: [],
      });
    }

    const awaiting = posts.filter((p) => p.status === "review" || p.status === "approved");
    const report = { runId, week, at: new Date().toISOString(), provider: provider.name, publishMode: config.publishMode, dryRun, results, skipped: skipped.map((s) => ({ slug: s.topic.slug, reason: s.reason })), awaitingApproval: awaiting.map((p) => ({ slug: p.slug, status: p.status })) };

    if (!dryRun) {
      writeCalendar(calendar);
      writeFile(reportJson, `${JSON.stringify(report, null, 2)}\n`);
      writeFile(path.join(REPORT_DIR, `${runId}.md`), renderReport(report));
    }
    console.log(renderReport(report));

    function maybeAutoPublish(post: Post, file: string, all: Post[], providerConfigured: boolean, res: TopicResult, date: string) {
      if (config.publishMode !== "autonomous") return;
      const decision = publishDecision(post, buildQualityContext(all), config, { automatic: true, providerConfigured });
      if (!decision.allowed) {
        res.detail += `. Not auto-published: ${decision.reasons.join("; ")}`;
        return;
      }
      fs.writeFileSync(file, markPublished(fs.readFileSync(file, "utf8"), date));
      res.outcome = "published";
      res.detail += ". Published automatically (Mode B).";
    }
  } finally {
    release();
  }
}

function renderReport(r: {
  runId: string;
  at: string;
  provider: string;
  publishMode: string;
  dryRun: boolean;
  results: TopicResult[];
  skipped: { slug: string; reason: string }[];
  awaitingApproval: { slug: string; status: string }[];
}): string {
  const lines = [
    `# Content pipeline run ${r.runId}`,
    ``,
    `- Ran at: ${r.at}`,
    `- Provider: ${r.provider}`,
    `- Publish mode: ${r.publishMode}${r.dryRun ? " (dry run)" : ""}`,
    ``,
    `## Topics`,
    ``,
    `| Topic | Outcome | Detail | Files |`,
    `| --- | --- | --- | --- |`,
    ...r.results.map((t) => `| ${t.title} | ${t.outcome} | ${t.detail.replace(/\|/g, "/")} | ${t.files.join("<br>")} |`),
  ];
  for (const t of r.results.filter((x) => x.issues?.length)) {
    lines.push(``, `### Validation: ${t.slug}`, ``, ...t.issues!.map((i) => `- **${i.severity}** \`${i.code}\`: ${i.message}`));
  }
  if (r.skipped.length) lines.push(``, `## Skipped`, ``, ...r.skipped.map((s) => `- ${s.slug}: ${s.reason}`));
  lines.push(``, `## Awaiting owner approval`, ``, ...(r.awaitingApproval.length ? r.awaitingApproval.map((a) => `- ${a.slug} (${a.status})`) : ["- none"]));
  lines.push(``, `A passing validation is not proof of quality. Read each draft against its sources before approving it.`, ``);
  return lines.join("\n");
}

main().catch((error) => {
  console.error(`Pipeline failed: ${(error as Error).message}`);
  process.exit(1);
});
