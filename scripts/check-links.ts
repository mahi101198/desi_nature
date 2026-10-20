/**
 * Link checker.
 *
 *   npm run content:links              internal links in every article and data file
 *   npm run content:links -- --external   also request every external URL (slow, polite)
 *
 * Internal links that do not resolve fail the run for approved/published
 * articles. External failures are reported only, because sites block bots.
 */
import { getProductCategories } from "../src/lib/content/catalog";
import { buildQualityContext } from "../src/lib/content/context";
import { extractLinks } from "../src/lib/content/markdown";
import { readPostFiles } from "../src/lib/content/posts";
import { internalLinkExists } from "../src/lib/content/quality";
import { args } from "./lib/cli";

async function checkExternal(url: string): Promise<string> {
  for (const method of ["HEAD", "GET"] as const) {
    try {
      const res = await fetch(url, {
        method,
        redirect: "follow",
        signal: AbortSignal.timeout(15000),
        headers: { "user-agent": "DesiNatureLinkCheck/1.0 (+https://desinature.in)" },
      });
      if (res.ok) return "ok";
      if (method === "GET") return `HTTP ${res.status}`;
    } catch (error) {
      if (method === "GET") return `failed: ${(error as Error).message}`;
    }
  }
  return "unknown";
}

async function main() {
  const { flags } = args();
  const posts = readPostFiles()
    .filter((r): r is Extract<typeof r, { ok: true }> => r.ok)
    .map((r) => r.post);
  const ctx = buildQualityContext(posts);
  const live = new Set(posts.filter((p) => p.status === "published").map((p) => p.slug));
  let fatal = 0;

  for (const post of posts) {
    const gated = post.status === "approved" || post.status === "published";
    for (const href of extractLinks(post.body).filter((l) => l.startsWith("/"))) {
      if (!internalLinkExists(href, ctx)) {
        console.log(`${gated ? "ERROR" : "warn "} ${post.slug}: ${href} does not resolve`);
        if (gated) fatal++;
      }
    }
    for (const rel of post.relatedPosts) {
      if (!live.has(rel)) console.log(`warn  ${post.slug}: relatedPosts "${rel}" is not published (hidden until it is)`);
    }
  }
  for (const c of getProductCategories()) {
    for (const s of c.relatedPosts) {
      if (!posts.some((p) => p.slug === s)) {
        console.log(`ERROR product-categories ${c.slug}: unknown post "${s}"`);
        fatal++;
      }
    }
  }

  if (flags.has("--external")) {
    const urls = new Map<string, string[]>();
    for (const post of posts) {
      for (const u of [...extractLinks(post.body).filter((l) => /^https?:/.test(l)), ...post.sources.map((s) => s.url)]) {
        urls.set(u, [...(urls.get(u) ?? []), post.slug]);
      }
    }
    for (const [url, slugs] of urls) {
      const result = await checkExternal(url);
      console.log(`${result === "ok" ? "ok   " : "check"} ${url} (${slugs.join(", ")}): ${result}`);
      await new Promise((r) => setTimeout(r, 1000)); // be polite
    }
  }

  if (fatal) {
    console.error(`${fatal} broken internal link(s) in approved or published content.`);
    process.exit(1);
  }
  console.log("Internal links OK.");
}

main().catch((e) => {
  console.error((e as Error).message);
  process.exit(1);
});
