import { absoluteUrl } from "@/config/site";
import { CATEGORY_INDEX_THRESHOLD, categoryPostCounts, getPublicAuthors, getVerifiedProducts } from "./content/catalog";
import { getLivePosts, type Post } from "./content/posts";

export type SitemapEntry = { url: string; lastModified?: string };

/** Static pages that are always indexable. Policies are included: they are real, unique pages. */
const STATIC_PATHS = ["/", "/blog", "/products", "/about", "/contact", "/editorial-policy", "/privacy-policy", "/terms"];

/**
 * Only URLs that are live, canonical and indexable: published posts, categories
 * with enough articles, verified products and owner-supplied author pages.
 */
export function sitemapEntries(posts: Post[] = getLivePosts()): SitemapEntry[] {
  const newest = posts[0]?.updatedAt ?? posts[0]?.publishedAt;
  const entries: SitemapEntry[] = STATIC_PATHS.map((p) => ({
    url: absoluteUrl(p),
    ...(p === "/blog" && newest ? { lastModified: newest } : {}),
  }));
  for (const post of posts) {
    entries.push({ url: absoluteUrl(`/blog/${post.slug}`), lastModified: post.updatedAt ?? post.publishedAt });
  }
  for (const [slug, count] of categoryPostCounts()) {
    if (count >= CATEGORY_INDEX_THRESHOLD) entries.push({ url: absoluteUrl(`/categories/${slug}`) });
  }
  for (const product of getVerifiedProducts()) {
    entries.push({ url: absoluteUrl(`/products/${product.slug}`), lastModified: product.verifiedAt });
  }
  for (const author of getPublicAuthors()) {
    if (posts.some((p) => p.author === author.slug)) entries.push({ url: absoluteUrl(`/author/${author.slug}`) });
  }
  return entries;
}
