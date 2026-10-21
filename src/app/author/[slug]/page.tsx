import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/ArticleCard";
import { PageHero } from "@/components/PageHero";
import { JsonLd } from "@/components/JsonLd";
import { absoluteUrl } from "@/config/site";
import { getPublicAuthors } from "@/lib/content/catalog";
import { getVisiblePosts } from "@/lib/content/posts";
import { pageMetadata } from "@/lib/seo";

export const dynamicParams = false;

/** Author pages exist only for real profiles the owner has supplied. */
export function generateStaticParams() {
  return getPublicAuthors().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/author/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const author = getPublicAuthors().find((a) => a.slug === slug);
  if (!author) return {};
  return pageMetadata({ title: author.name, description: author.bio.slice(0, 160), path: `/author/${slug}` });
}

export default async function AuthorPage({ params }: PageProps<"/author/[slug]">) {
  const { slug } = await params;
  const author = getPublicAuthors().find((a) => a.slug === slug);
  if (!author) notFound();
  const posts = getVisiblePosts().filter((p) => p.author === slug);

  return (
    <>
      <PageHero
        crumbs={[
          { name: "Home", path: "/" },
          { name: author.name, path: `/author/${slug}` },
        ]}
        eyebrow={author.role}
        title={author.name}
        intro={author.bio}
      />
      {posts.length > 0 && (
        <section aria-labelledby="by-title" className="section-tight pb-24">
          <div className="container-x">
            <h2 id="by-title" className="h-section">
              Articles
            </h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {posts.map((p) => (
                <ArticleCard key={p.slug} post={p} />
              ))}
            </div>
          </div>
        </section>
      )}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": author.type === "person" ? "Person" : "Organization",
          name: author.name,
          url: absoluteUrl(`/author/${slug}`),
          description: author.bio,
          ...(author.sameAs.length ? { sameAs: author.sameAs } : {}),
        }}
      />
    </>
  );
}
