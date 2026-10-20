/**
 * Publishes an article a person has approved.
 *
 *   npm run content:publish -- <slug> [--date=YYYY-MM-DD] [--dry-run]
 *
 * Requires `status: "approved"` and `reviewedBy` in the frontmatter, and every
 * quality gate to pass. Sets status and dates, marks the topic published in the
 * calendar and appends to reports/publications.json. Commit and push the result;
 * Vercel deploys it and the sitemap updates with the build.
 */
import fs from "node:fs";
import path from "node:path";
import { absoluteUrl } from "../src/config/site";
import { buildQualityContext } from "../src/lib/content/context";
import { BLOG_DIR, parsePostSource, readPostFiles } from "../src/lib/content/posts";
import { readPipelineConfig } from "../src/lib/pipeline/config";
import { markPublished, publishDecision } from "../src/lib/pipeline/publish";
import { readCalendar, writeCalendar } from "../src/lib/pipeline/topics";
import { args, rel, todayIso, writeFile } from "./lib/cli";

const { positional, values, flags } = args();
const slug = positional[0];
if (!slug) {
  console.error("Usage: npm run content:publish -- <slug> [--date=YYYY-MM-DD] [--dry-run]");
  process.exit(2);
}
const date = values.get("date") ?? todayIso();
if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
  console.error("--date must be YYYY-MM-DD");
  process.exit(2);
}

const file = path.join(BLOG_DIR, `${slug}.md`);
if (!fs.existsSync(file)) {
  console.error(`No article at ${rel(file)}`);
  process.exit(1);
}
const source = fs.readFileSync(file, "utf8");
const parsed = parsePostSource(source, file);
if (!parsed.ok) {
  console.error(`Schema errors:\n- ${parsed.errors.join("\n- ")}`);
  process.exit(1);
}
const post = parsed.post;
if (post.status === "published") {
  console.log(`${slug} is already published (${post.publishedAt}). Nothing to do.`);
  process.exit(0);
}

const all = readPostFiles()
  .filter((r): r is Extract<typeof r, { ok: true }> => r.ok)
  .map((r) => r.post);
const decision = publishDecision(post, buildQualityContext(all), readPipelineConfig(), { automatic: false, providerConfigured: false });
if (!decision.allowed) {
  console.error(`Cannot publish ${slug}:\n- ${decision.reasons.join("\n- ")}`);
  for (const i of decision.issues.filter((x) => x.severity === "error")) console.error(`  · ${i.code}: ${i.message}`);
  process.exit(1);
}

if (flags.has("--dry-run")) {
  console.log(`Dry run: ${slug} passes every gate and would be published on ${date}.`);
  process.exit(0);
}

fs.writeFileSync(file, markPublished(source, date));

const calendar = readCalendar();
const topic = calendar.topics.find((t) => t.slug === slug);
if (topic) {
  topic.status = "published";
  writeCalendar(calendar);
}

const logFile = path.join(process.cwd(), "reports", "publications.json");
const log: { slug: string; url: string; publishedAt: string; reviewedBy?: string }[] = fs.existsSync(logFile)
  ? JSON.parse(fs.readFileSync(logFile, "utf8"))
  : [];
log.push({ slug, url: absoluteUrl(`/blog/${slug}`), publishedAt: date, reviewedBy: post.reviewedBy });
writeFile(logFile, `${JSON.stringify(log, null, 2)}\n`);

console.log(`Published ${slug} with date ${date}.
Next: commit and push. After Vercel deploys, check ${absoluteUrl(`/blog/${slug}`)} and ${absoluteUrl("/sitemap.xml")},
then request indexing in Google Search Console (URL inspection).`);
