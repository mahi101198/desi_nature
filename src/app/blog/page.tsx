import { ArrowRight, Hourglass } from "lucide-react";
import Link from "next/link";
import { ArticleCard } from "@/components/ArticleCard";
import { PageHero } from "@/components/PageHero";
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
  const categories = getCategories();
  const linkable = categories.filter((c) => (counts.get(c.slug) ?? 0) > 0);
  const upcoming = upcomingTopics(8).filter((t) => !posts.some((p) => p.slug === t.slug));
  const [featured, ...rest] = posts;

  return (
    <>
      <PageHero
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Journal", path: "/blog" },
        ]}
        eyebrow="The journal"
        title="Guides for the Indian kitchen and garden"
        intro="How to store, choose and grow food at home, written for Indian seasons. Every guide lists the sources it relies on."
      >
        {linkable.length > 0 && (
          <nav aria-label="Categories" className="mt-8">
            <ul className="flex flex-wrap gap-2">
              {linkable.map((c) => (
                <li key={c.slug}>
                  <Link href={`/categories/${c.slug}`} className="btn btn-ghost btn-sm">
                    {c.name}
                    <span className="rounded-full bg-bg-2 px-2 py-0.5 text-xs">{counts.get(c.slug)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </PageHero>

      <section aria-labelledby="articles-title" className="section-tight">
        <div className="container-x">
          <h2 id="articles-title" className="sr-only">
            Articles
          </h2>
          {posts.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featured && (
                <div className="reveal md:col-span-2 lg:col-span-3">
                  <ArticleCard post={featured} featured />
                </div>
              )}
              {rest.map((post) => (
                <div key={post.slug} className="reveal">
                  <ArticleCard post={post} />
                </div>
              ))}
            </div>
          ) : (
            <div className="card flex flex-col items-start gap-5 p-8 sm:flex-row sm:items-center sm:p-10">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-ghee-soft text-honey">
                <Hourglass className="size-7" aria-hidden="true" />
              </span>
              <div className="flex-1">
                <h3 className="h-card">The first guides are being checked</h3>
                <p className="muted mt-1">Each one is published only after its sources have been read and confirmed.</p>
              </div>
              <Link href="/contact" className="btn">
                Ask us a question <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {upcoming.length > 0 && (
        <section aria-labelledby="upcoming-title" className="section-tight pb-24">
          <div className="container-x grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="eyebrow">Coming up</p>
              <h2 id="upcoming-title" className="h-section mt-3">
                Being researched
              </h2>
              <p className="lead mt-4">Topics we are working on. They go live once their facts are checked.</p>
            </div>
            <ol className="reveal-stagger grid gap-3 sm:grid-cols-2 lg:col-span-8">
              {upcoming.map((t) => (
                <li key={t.id} className="card flex flex-col gap-2 p-5">
                  <span className="pill w-fit">{categories.find((c) => c.slug === t.category)?.name}</span>
                  <span className="font-display text-lg leading-snug">{t.workingTitle}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}
    </>
  );
}
