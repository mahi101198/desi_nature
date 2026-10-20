/**
 * Validates every content file. Fails (exit 1) on schema errors, duplicate
 * slugs, invalid catalog files, or quality errors in posts that are approved
 * or published. Drafts and posts in review are reported but do not fail,
 * unless --strict is passed. Writes reports/quality/latest.md.
 */
import path from "node:path";
import { z } from "zod";
import { getAuthors, getCategories, getProductCategories, getProducts } from "../src/lib/content/catalog";
import { buildQualityContext } from "../src/lib/content/context";
import { findDuplicateSlugs, readPostFiles } from "../src/lib/content/posts";
import { checkPost, hasErrors } from "../src/lib/content/quality";
import { readPipelineConfig } from "../src/lib/pipeline/config";
import { readCalendar } from "../src/lib/pipeline/topics";
import { readProspects } from "../src/lib/backlinks";
import { args, rel, writeFile } from "./lib/cli";

const { flags } = args();
const strict = flags.has("--strict");
const failures: string[] = [];
const lines: string[] = [`# Content quality report`, ``, `Generated ${new Date().toISOString()}${strict ? " (strict)" : ""}`, ``];

function attempt(label: string, fn: () => unknown) {
  try {
    fn();
    lines.push(`- ${label}: ok`);
  } catch (error) {
    const msg = error instanceof z.ZodError ? error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") : (error as Error).message;
    failures.push(`${label}: ${msg}`);
    lines.push(`- ${label}: **FAILED** ${msg}`);
  }
}

lines.push(`## Data files`, ``);
attempt("categories.json", getCategories);
attempt("authors/", getAuthors);
attempt("product-categories.json", getProductCategories);
attempt("products/", getProducts);
attempt("topics/calendar.json", readCalendar);
attempt("pipeline.config.json", () => readPipelineConfig({}));
attempt("data/backlinks/prospects.json", readProspects);

const results = readPostFiles();
const posts = results.filter((r): r is Extract<typeof r, { ok: true }> => r.ok).map((r) => r.post);
lines.push(``, `## Articles (${results.length})`, ``);
for (const r of results) {
  if (!r.ok) {
    failures.push(`${rel(r.file)}: ${r.errors.join("; ")}`);
    lines.push(`### ${rel(r.file)}`, ``, `**Schema errors**`, ...r.errors.map((e) => `- ${e}`), ``);
  }
}
for (const dupe of findDuplicateSlugs(posts)) failures.push(`duplicate slug: ${dupe}`);

let ctx;
try {
  ctx = buildQualityContext(posts);
} catch (error) {
  failures.push(`could not build quality context: ${(error as Error).message}`);
}

if (ctx) {
  for (const post of posts) {
    const gated = post.status === "approved" || post.status === "published" || (strict && post.status === "review");
    const issues = checkPost(post, ctx, post.status !== "draft");
    const errs = issues.filter((i) => i.severity === "error");
    const status = errs.length === 0 ? "passes" : gated ? "FAILS" : "not ready";
    lines.push(`### ${post.slug} (${post.status}): ${status}`, ``);
    lines.push(issues.length ? issues.map((i) => `- **${i.severity}** \`${i.code}\`: ${i.message}`).join("\n") : "- no issues found", ``);
    if (gated && hasErrors(issues)) failures.push(`${post.slug} is ${post.status} but has ${errs.length} quality error(s)`);
  }
}

lines.push(`A script passing is not proof of editorial quality. A person must still read each article against its sources.`, ``);
const reportFile = path.join(process.cwd(), "reports", "quality", "latest.md");
writeFile(reportFile, lines.join("\n"));

if (failures.length) {
  console.error(`Content validation failed:\n- ${failures.join("\n- ")}\nSee ${rel(reportFile)}.`);
  process.exit(1);
}
console.log(`Content validation passed for ${posts.length} article(s). Report: ${rel(reportFile)}`);
