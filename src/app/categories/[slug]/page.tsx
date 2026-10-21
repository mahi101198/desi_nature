import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/ArticleCard";
import { PageHero } from "@/components/PageHero";
import { CATEGORY_INDEX_THRESHOLD, categoryPostCounts, getCategories, getCategory } from "@/lib/content/catalog";
import { getVisiblePosts } from "@/lib/content/posts";
import { pageMetadata } from "@/lib/seo";

export const dynamicParams = false;

/** A category page exists only once it has at least one article to show. */
export function generateStaticParams() {
  const visible = getVisiblePosts();
  return getCategories()
    .filter((c) => visible.some((p) => p.category === c.slug))
    .map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/categories/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) return {};
  const live = categoryPostCounts().get(slug) ?? 0;
  return pageMetadata({
    title: `${category.name}: guides from the Desi Nature journal`,
    description: category.description,
    path: `/categories/${slug}`,
    // Thin archives stay out of the index until they have enough articles.
    noindex: live < CATEGORY_INDEX_THRESHOLD,
  });
}

export default async function CategoryPage({ params }: PageProps<"/categories/[slug]">) {
  const { slug } = await params;
  const category = getCategory(slug);
  const posts = getVisiblePosts().filter((p) => p.category === slug);
  if (!category || posts.length === 0) notFound();

  return (
    <>
      <PageHero
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Journal", path: "/blog" },
          { name: category.name, path: `/categories/${slug}` },
        ]}
        eyebrow={`${posts.length} ${posts.length === 1 ? "guide" : "guides"}`}
        title={category.name}
        intro={category.description}
      />
      <section className="section-tight pb-24">
        <div className="container-x">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <div key={post.slug} className="reveal">
                <ArticleCard post={post} headingLevel="h2" />
              </div>
            ))}
          </div>
          <Link href="/blog" className="arrow-link mt-12">
            <ArrowLeft className="size-4" aria-hidden="true" /> All guides
          </Link>
        </div>
      </section>
    </>
  );
}
