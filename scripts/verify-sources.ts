/**
 * Checks an article's sources against the live pages.
 *
 *   npm run content:verify-sources -- <slug> [--write]
 *
 * For each source with a `quote`, fetches the URL and confirms the quote
 * appears on the page (HTML pages only; PDFs must be checked by hand). With
 * --write, matching sources are marked "opened-and-checked". Sources without a
 * quote, or whose quote is not found, are left for a person.
 */
import fs from "node:fs";
import path from "node:path";
import { CORE_SCHEMA, dump, load } from "js-yaml";
import { BLOG_DIR, parsePostSource } from "../src/lib/content/posts";
import { args, rel } from "./lib/cli";

function normalise(text: string): string {
  return text
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&rsquo;|&lsquo;/g, "'")
    .replace(/&quot;|&ldquo;|&rdquo;/g, '"')
    .replace(/\s+/g, " ")
    .toLowerCase();
}

async function main() {
  const { positional, flags } = args();
  const slug = positional[0];
  if (!slug) throw new Error("Usage: npm run content:verify-sources -- <slug> [--write]");
  const file = path.join(BLOG_DIR, `${slug}.md`);
  const source = fs.readFileSync(file, "utf8");
  const parsed = parsePostSource(source, file);
  if (!parsed.ok) throw new Error(parsed.errors.join("; "));

  const verified: number[] = [];
  for (const [i, s] of parsed.post.sources.entries()) {
    if (s.verification === "opened-and-checked") {
      console.log(`[${i}] already checked: ${s.title}`);
      continue;
    }
    if (!s.quote) {
      console.log(`[${i}] no quote recorded; a person must open ${s.url}`);
      continue;
    }
    try {
      const res = await fetch(s.url, { signal: AbortSignal.timeout(20000), headers: { "user-agent": "DesiNatureSourceCheck/1.0 (+https://desinature.in)" } });
      const type = res.headers.get("content-type") ?? "";
      if (!res.ok) console.log(`[${i}] HTTP ${res.status}: ${s.url}`);
      else if (!type.includes("html")) console.log(`[${i}] ${type || "non-HTML"} document; check the quote by hand: ${s.url}`);
      else if (normalise(await res.text()).includes(normalise(s.quote))) {
        console.log(`[${i}] quote found: ${s.title}`);
        verified.push(i);
      } else console.log(`[${i}] quote NOT found on ${s.url}`);
    } catch (error) {
      console.log(`[${i}] fetch failed (${(error as Error).message}): ${s.url}`);
    }
  }

  if (flags.has("--write") && verified.length) {
    const end = source.indexOf("\n---", 3);
    const fm = load(source.slice(4, end), { schema: CORE_SCHEMA }) as { sources: { verification: string }[] };
    for (const i of verified) fm.sources[i].verification = "opened-and-checked";
    const next = `---\n${dump(fm, { schema: CORE_SCHEMA, lineWidth: -1 })}${source.slice(end + 1)}`;
    if (!parsePostSource(next, file).ok) throw new Error("Refusing to write: result would not validate.");
    fs.writeFileSync(file, next);
    console.log(`Marked ${verified.length} source(s) as opened-and-checked in ${rel(file)}.`);
  }
}

main().catch((e) => {
  console.error((e as Error).message);
  process.exit(1);
});
