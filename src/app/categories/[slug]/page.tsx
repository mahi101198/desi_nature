import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/ArticleCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
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
    <div className="wrap pt-10">
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Journal", path: "/blog" },
          { name: category.name, path: `/categories/${slug}` },
        ]}
      />
      <div className="reveal grid md:grid-cols-12 gap-x-8 gap-y-6 mt-10 items-end">
        <h1 className="md:col-span-7 t-head">{category.name}</h1>
        <p className="md:col-span-4 md:col-start-9 max-w-[34ch]">{category.description}</p>
      </div>
      <div className="mt-12 grid md:grid-cols-2 xl:grid-cols-3 gap-3">
        {posts.map((post, i) => (
          <ArticleCard key={post.slug} post={post} index={i} headingLevel="h2" />
        ))}
      </div>
      <p className="mt-12">
        <Link href="/blog" className="link">
          All articles in the journal
        </Link>
      </p>
    </div>
  );
}
