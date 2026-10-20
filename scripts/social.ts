/**
 * Writes social drafts for an article to content/social/<slug>.md.
 *
 *   npm run content:social -- <slug> [--force]
 *
 * Drafts reuse only the article's own title, description, headings and
 * supported claims. They are for a person to edit and post.
 */
import fs from "node:fs";
import path from "node:path";
import { extractHeadings } from "../src/lib/content/markdown";
import { BLOG_DIR, CONTENT_DIR, parsePostSource } from "../src/lib/content/posts";
import { socialDrafts } from "../src/lib/pipeline/social";
import { args, rel, writeFile } from "./lib/cli";

const { positional, flags } = args();
const slug = positional[0];
if (!slug) {
  console.error("Usage: npm run content:social -- <slug> [--force]");
  process.exit(2);
}
const file = path.join(BLOG_DIR, `${slug}.md`);
const parsed = parsePostSource(fs.readFileSync(file, "utf8"), file);
if (!parsed.ok) {
  console.error(parsed.errors.join("\n"));
  process.exit(1);
}
const out = path.join(CONTENT_DIR, "social", `${slug}.md`);
if (fs.existsSync(out) && !flags.has("--force")) {
  console.log(`${rel(out)} exists; use --force to regenerate.`);
  process.exit(0);
}
const headings = extractHeadings(parsed.post.body).filter((h) => h.depth === 2).map((h) => h.text);
writeFile(out, socialDrafts(parsed.post, headings));
console.log(`Wrote ${rel(out)}`);
