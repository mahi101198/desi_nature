import Link from "next/link";
import { ArticleCard } from "@/components/ArticleCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { categoryPostCounts, getCategories } from "@/lib/content/catalog";
import { getVisiblePosts } from "@/lib/content/posts";
import { upcomingTopics } from "@/lib/pipeline/topics";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Journal: storing, choosing and growing Indian farm food",
  description:
    "Practical guides on storing ghee, honey and grains in Indian weather, buying farm food with confidence, and kitchen gardening. Every article lists its sources.",
  path: "/blog",
});

export default function BlogIndex() {
  const posts = getVisiblePosts();
  const counts = categoryPostCounts();
  const categories = getCategories().filter((c) => (counts.get(c.slug) ?? 0) > 0);
  const upcoming = upcomingTopics(8).filter((t) => !posts.some((p) => p.slug === t.slug));

  return (
    <div className="wrap pt-10">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Journal", path: "/blog" }]} />
      <div className="reveal grid md:grid-cols-12 gap-x-8 gap-y-6 mt-10 items-end">
        <h1 className="md:col-span-7 t-head">The journal</h1>
        <p className="md:col-span-4 md:col-start-9 max-w-[34ch]">
          Guides to keeping and choosing farm food in Indian homes. Each one lists its sources at the end.
        </p>
      </div>

      {categories.length > 0 && (
        <nav aria-label="Categories" className="mt-12">
          <ul className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/categories/${c.slug}`} className="btn btn-quiet min-h-11 text-base">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <section aria-labelledby="articles-title" className="mt-12">
        <h2 id="articles-title" className="sr-only">
          Articles
        </h2>
        {posts.length > 0 ? (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
            {posts.map((post, i) => (
              <ArticleCard key={post.slug} post={post} index={i} />
            ))}
          </div>
        ) : (
          <div className="bg-surface p-8 md:p-12 grid md:grid-cols-2 gap-8">
            <p className="t-lead">The first guides are being checked against their sources and will appear here soon.</p>
            <p>
              Meanwhile, you can{" "}
              <Link href="/contact" className="link">
                send us a question
              </Link>{" "}
              about ghee, honey or grains. Good questions often become articles.
            </p>
          </div>
        )}
      </section>

      {upcoming.length > 0 && (
        <section aria-labelledby="upcoming-title" className="mt-[var(--gap-section)] grid md:grid-cols-12 gap-x-8 gap-y-8">
          <div className="md:col-span-4">
            <h2 id="upcoming-title" className="t-head">
              Being researched
            </h2>
            <p className="mt-4 text-muted">Topics we are working on. They are published only once their facts are checked.</p>
          </div>
          <ol className="md:col-span-7 md:col-start-6 space-y-4">
            {upcoming.map((t) => (
              <li key={t.id} className="bg-surface px-5 py-4 flex flex-wrap justify-between gap-x-6 gap-y-1">
                <span className="t-body">{t.workingTitle}</span>
                <span className="text-muted">
                  {getCategories().find((c) => c.slug === t.category)?.name}
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
