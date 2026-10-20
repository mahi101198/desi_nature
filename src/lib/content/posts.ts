import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { CORE_SCHEMA, load as loadYaml } from "js-yaml";
import { previewContentEnabled } from "../env";
import { postFrontmatterSchema, type PostFrontmatter } from "./schema";

export const CONTENT_DIR = path.join(process.cwd(), "content");
export const BLOG_DIR = path.join(CONTENT_DIR, "blog");

export type Post = PostFrontmatter & {
  body: string;
  file: string;
  readingMinutes: number;
};

export type ParseResult =
  | { ok: true; post: Post }
  | { ok: false; file: string; errors: string[] };

export function countWords(markdown: string): number {
  const text = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`|-]/g, " ");
  return text.split(/\s+/).filter(Boolean).length;
}

export function parsePostSource(source: string, file: string): ParseResult {
  let parsed: matter.GrayMatterFile<string>;
  try {
    // gray-matter's default YAML engine turns dates into Date objects; keep them as strings.
    parsed = matter(source, {
      engines: {
        yaml: (s: string) => (loadYaml(s, { schema: CORE_SCHEMA }) ?? {}) as object,
      },
    });
  } catch (error) {
    return { ok: false, file, errors: [`frontmatter is not valid YAML: ${(error as Error).message}`] };
  }
  const result = postFrontmatterSchema.safeParse(parsed.data);
  if (!result.success) {
    return {
      ok: false,
      file,
      errors: result.error.issues.map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`),
    };
  }
  const expectedSlug = path.basename(file).replace(/\.md$/, "");
  if (result.data.slug !== expectedSlug) {
    return { ok: false, file, errors: [`slug "${result.data.slug}" must match file name "${expectedSlug}"`] };
  }
  const body = parsed.content.trim();
  return {
    ok: true,
    post: { ...result.data, body, file, readingMinutes: Math.max(1, Math.round(countWords(body) / 200)) },
  };
}

export function readPostFiles(dir = BLOG_DIR): ParseResult[] {
  // Content is read at build time only; tell the bundler not to trace these paths.
  if (!fs.existsSync(/*turbopackIgnore: true*/ dir)) return [];
  return fs
    .readdirSync(/*turbopackIgnore: true*/ dir)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
    .sort()
    .map((f) => {
      const file = path.join(/*turbopackIgnore: true*/ dir, f);
      return parsePostSource(fs.readFileSync(/*turbopackIgnore: true*/ file, "utf8"), file);
    });
}

export function findDuplicateSlugs(posts: Pick<Post, "slug">[]): string[] {
  const seen = new Set<string>();
  const dupes = new Set<string>();
  for (const p of posts) {
    if (seen.has(p.slug)) dupes.add(p.slug);
    seen.add(p.slug);
  }
  return [...dupes];
}

let cache: Post[] | null = null;

/** All posts in every status. Throws on invalid content so a bad file fails the build. */
export function getAllPosts(): Post[] {
  if (cache && process.env.NODE_ENV === "production") return cache;
  const results = readPostFiles();
  const failures = results.filter((r): r is Extract<ParseResult, { ok: false }> => !r.ok);
  if (failures.length > 0) {
    const detail = failures.map((f) => `${path.relative(process.cwd(), f.file)}\n  - ${f.errors.join("\n  - ")}`);
    throw new Error(`Invalid blog content:\n${detail.join("\n")}`);
  }
  const posts = results.map((r) => (r as Extract<ParseResult, { ok: true }>).post);
  const dupes = findDuplicateSlugs(posts);
  if (dupes.length > 0) throw new Error(`Duplicate post slugs: ${dupes.join(", ")}`);
  cache = posts;
  return posts;
}

export function todayIso(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

/** Published and not scheduled for the future. */
export function isLive(post: Pick<Post, "status" | "publishedAt">, now = new Date()): boolean {
  return post.status === "published" && !!post.publishedAt && post.publishedAt <= todayIso(now);
}

export function isVisible(
  post: Pick<Post, "status" | "publishedAt">,
  options: { now?: Date; preview?: boolean } = {},
): boolean {
  if (isLive(post, options.now)) return true;
  return !!options.preview && post.status !== "draft";
}

function byNewest(a: Post, b: Post): number {
  const ad = a.publishedAt ?? a.updatedAt ?? "9999";
  const bd = b.publishedAt ?? b.updatedAt ?? "9999";
  return bd.localeCompare(ad) || a.title.localeCompare(b.title);
}

/** Posts a visitor may see on this deployment, newest first. */
export function getVisiblePosts(): Post[] {
  const preview = previewContentEnabled();
  return getAllPosts()
    .filter((p) => isVisible(p, { preview }))
    .sort(byNewest);
}

/** Posts that are live and indexable. Used for the sitemap and feeds. */
export function getLivePosts(): Post[] {
  return getAllPosts().filter((p) => isLive(p)).sort(byNewest);
}

export function getPostBySlug(slug: string): Post | undefined {
  return getVisiblePosts().find((p) => p.slug === slug);
}

/** Explicit related posts first, then others from the same category, then tag overlap. */
export function getRelatedPosts(post: Post, limit = 3): Post[] {
  const pool = getVisiblePosts().filter((p) => p.slug !== post.slug);
  const explicit = post.relatedPosts
    .map((s) => pool.find((p) => p.slug === s))
    .filter((p): p is Post => !!p);
  const scored = pool
    .filter((p) => !explicit.includes(p))
    .map((p) => ({
      p,
      score: (p.category === post.category ? 2 : 0) + p.tags.filter((t) => post.tags.includes(t)).length,
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.p);
  return [...explicit, ...scored].slice(0, limit);
}

export function formatDate(iso: string | undefined): string {
  if (!iso) return "";
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
