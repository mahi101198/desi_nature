import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/ArticleCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
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
    <div className="wrap pt-10">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: author.name, path: `/author/${slug}` }]} />
      <div className="mt-10 max-w-[44rem]">
        <h1 className="t-head">{author.name}</h1>
        {author.role && <p className="t-lead mt-4 italic">{author.role}</p>}
        <p className="mt-6">{author.bio}</p>
      </div>
      {posts.length > 0 && (
        <section aria-labelledby="by-title" className="mt-16">
          <h2 id="by-title" className="t-lead">
            Articles
          </h2>
          <div className="mt-6 grid md:grid-cols-3 gap-3">
            {posts.map((p, i) => (
              <ArticleCard key={p.slug} post={p} index={i} />
            ))}
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
    </div>
  );
}
