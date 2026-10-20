import { getAuthors, getCategories, getVerifiedProducts } from "./catalog";
import { readPostFiles, type Post } from "./posts";
import { STATIC_ROUTES, type QualityContext } from "./quality";

/** Everything the quality checks need to know about the rest of the site. */
export function buildQualityContext(posts?: Post[]): QualityContext {
  const all =
    posts ??
    readPostFiles()
      .filter((r): r is Extract<typeof r, { ok: true }> => r.ok)
      .map((r) => r.post);
  return {
    allPosts: all.map((p) => ({ slug: p.slug, title: p.title, targetQuery: p.targetQuery, status: p.status })),
    categorySlugs: getCategories().map((c) => c.slug),
    authorSlugs: getAuthors().map((a) => a.slug),
    productSlugs: getVerifiedProducts().map((p) => p.slug),
    staticRoutes: STATIC_ROUTES,
  };
}
