import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { extractHeadings, extractLinks, renderMarkdown } from "@/lib/content/markdown";
import { findDuplicateSlugs, isLive, isVisible, parsePostSource, readPostFiles } from "@/lib/content/posts";
import { checkPost, hasErrors } from "@/lib/content/quality";
import { buildQualityContext } from "@/lib/content/context";
import { baseFrontmatter, ctx, longBody, makeSource } from "./helpers";

const file = "/tmp/how-to-store-honey.md";

describe("frontmatter validation", () => {
  it("accepts a valid draft", () => {
    const r = parsePostSource(makeSource(baseFrontmatter, longBody), file);
    expect(r.ok).toBe(true);
  });

  it("rejects missing required fields and bad values", () => {
    const noTitle = { ...baseFrontmatter };
    delete noTitle.title;
    const r = parsePostSource(makeSource({ ...noTitle, slug: "Bad Slug", status: "live" }, longBody), file);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      const text = r.errors.join(" ");
      expect(text).toMatch(/title/);
      expect(text).toMatch(/slug/);
      expect(text).toMatch(/status/);
    }
  });

  it("rejects a published post without a publication date", () => {
    const r = parsePostSource(makeSource({ ...baseFrontmatter, status: "published" }, longBody), file);
    expect(r.ok).toBe(false);
  });

  it("rejects a slug that does not match the file name", () => {
    const r = parsePostSource(makeSource(baseFrontmatter, longBody), "/tmp/other-name.md");
    expect(r.ok).toBe(false);
  });

  it("rejects claims pointing at sources that do not exist", () => {
    const r = parsePostSource(
      makeSource({ ...baseFrontmatter, claims: [{ text: "Honey keeps for a long time.", sources: [3], status: "supported" }] }, longBody),
      file,
    );
    expect(r.ok).toBe(false);
  });

  it("keeps dates as strings rather than Date objects", () => {
    const r = parsePostSource(makeSource(baseFrontmatter, longBody), file);
    expect(r.ok && typeof r.post.updatedAt).toBe("string");
  });
});

describe("duplicate slugs", () => {
  it("finds duplicates", () => {
    expect(findDuplicateSlugs([{ slug: "a" }, { slug: "b" }, { slug: "a" }])).toEqual(["a"]);
    expect(findDuplicateSlugs([{ slug: "a" }, { slug: "b" }])).toEqual([]);
  });

  it("the repository has no duplicate slugs and every file parses", () => {
    const results = readPostFiles();
    expect(results.every((r) => r.ok)).toBe(true);
    const posts = results.filter((r) => r.ok).map((r) => (r as { post: { slug: string } }).post);
    expect(findDuplicateSlugs(posts)).toEqual([]);
  });
});

describe("draft versus published visibility", () => {
  const now = new Date("2026-10-20T12:00:00Z");
  it("shows only live published posts in production", () => {
    expect(isLive({ status: "published", publishedAt: "2026-10-19" }, now)).toBe(true);
    expect(isLive({ status: "published", publishedAt: "2026-10-21" }, now)).toBe(false); // scheduled
    expect(isLive({ status: "approved", publishedAt: "2026-10-01" }, now)).toBe(false);
    expect(isVisible({ status: "review" }, { now })).toBe(false);
  });
  it("shows review and approved posts only in preview, never drafts", () => {
    expect(isVisible({ status: "review" }, { now, preview: true })).toBe(true);
    expect(isVisible({ status: "approved" }, { now, preview: true })).toBe(true);
    expect(isVisible({ status: "draft" }, { now, preview: true })).toBe(false);
  });
});

describe("markdown safety", () => {
  it("drops raw HTML, scripts and javascript: links", async () => {
    const html = await renderMarkdown(
      `Hello <script>alert(1)</script> <img src=x onerror="alert(2)">\n\n[click](javascript:alert(3))\n\n<iframe src="https://evil.example"></iframe>`,
    );
    expect(html).not.toMatch(/<script/i);
    expect(html).not.toMatch(/onerror/i);
    expect(html).not.toMatch(/javascript:/i);
    expect(html).not.toMatch(/<iframe/i);
  });
  it("adds heading ids and safe external link attributes", async () => {
    const html = await renderMarkdown(`## Store it cool\n\n[FAO](https://www.fao.org)`);
    expect(html).toContain('id="store-it-cool"');
    expect(html).toMatch(/rel="noopener noreferrer"/);
  });
  it("extracts headings and links", () => {
    expect(extractHeadings("## One\n### Two\n```\n## not\n```")).toEqual([
      { depth: 2, text: "One", id: "one" },
      { depth: 3, text: "Two", id: "two" },
    ]);
    expect(extractLinks("[a](/blog/x) ![img](/i.png) [b](https://e.org)")).toEqual(["/blog/x", "https://e.org"]);
  });
});

describe("quality gates", () => {
  const parse = (fm: Record<string, unknown>, body = longBody) => {
    const r = parsePostSource(makeSource({ ...baseFrontmatter, ...fm }, body), file);
    if (!r.ok) throw new Error(r.errors.join("; "));
    return r.post;
  };

  it("passes a clean, sourced article", () => {
    expect(hasErrors(checkPost(parse({}), ctx(), true))).toBe(false);
  });

  it("flags missing internal links", () => {
    const issues = checkPost(parse({}, `${longBody}\n\nSee [this](/blog/does-not-exist).`), ctx(), true);
    expect(issues.some((i) => i.code === "broken-internal-link" && i.severity === "error")).toBe(true);
  });

  it("flags unsupported health and purity claims", () => {
    const issues = checkPost(parse({}, `${longBody}\n\nThis honey boosts immunity and is 100% pure.`), ctx(), true);
    const codes = issues.filter((i) => i.code === "sensitive-term").map((i) => i.message);
    expect(codes.join(" ")).toMatch(/immunity/);
    expect(codes.join(" ")).toMatch(/purity/);
  });

  it("flags invented social proof", () => {
    const issues = checkPost(parse({}, `${longBody}\n\nThousands of happy customers love it.`), ctx(), true);
    expect(issues.some((i) => i.code === "invented-experience")).toBe(true);
  });

  it("blocks unresolved claims and unverified sources for publication", () => {
    const post = parse({
      sources: [{ ...(baseFrontmatter.sources as object[])[0], verification: "search-summary-only" }],
      claims: [{ text: "Honey never spoils at all.", sources: [], status: "needs-evidence" }],
    });
    const codes = checkPost(post, ctx(), true).filter((i) => i.severity === "error").map((i) => i.code);
    expect(codes).toContain("claim-needs-evidence");
    expect(codes).toContain("unverified-sources");
    // The same findings are only warnings on a draft that is not up for publication.
    expect(hasErrors(checkPost(post, ctx(), false))).toBe(false);
  });

  it("rejects an H1 in the body and thin content", () => {
    const codes = checkPost(parse({}, "# Title again\n\nShort."), ctx(), true).map((i) => i.code);
    expect(codes).toContain("h1-in-body");
    expect(codes).toContain("thin-content");
  });

  it("detects duplicate target queries", () => {
    const issues = checkPost(parse({}), ctx({ allPosts: [{ slug: "other", title: "Other", targetQuery: "How to store honey", status: "published" }] }), true);
    expect(issues.some((i) => i.code === "duplicate-target")).toBe(true);
  });

  it("the reference article is blocked only by its unverified sources", () => {
    const f = path.join(process.cwd(), "content/blog/how-to-store-ghee-at-home.md");
    const r = parsePostSource(fs.readFileSync(f, "utf8"), f);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const errors = checkPost(r.post, buildQualityContext(), true).filter((i) => i.severity === "error");
    expect(errors.map((e) => e.code)).toEqual(["unverified-sources"]);
  });
});
