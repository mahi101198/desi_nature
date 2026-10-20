import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/ArticleCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { ShareLinks } from "@/components/ShareLinks";
import { absoluteUrl } from "@/config/site";
import { getAuthor, getCategory, getProductCategories, getVerifiedProducts } from "@/lib/content/catalog";
import { extractHeadings, renderMarkdown } from "@/lib/content/markdown";
import { formatDate, getPostBySlug, getRelatedPosts, getVisiblePosts, isLive } from "@/lib/content/posts";
import { articleJsonLd, pageMetadata } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return getVisiblePosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return pageMetadata({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
    type: "article",
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
    // Previews of unpublished articles are never indexed.
    noindex: !isLive(post),
    image: post.featuredImage
      ? { url: absoluteUrl(post.featuredImage.src), alt: post.featuredImage.alt, width: post.featuredImage.width, height: post.featuredImage.height }
      : undefined,
  });
}

export default async function ArticlePage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const html = await renderMarkdown(post.body);
  const headings = extractHeadings(post.body).filter((h) => h.depth === 2);
  const author = getAuthor(post.author);
  const category = getCategory(post.category);
  const related = getRelatedPosts(post);
  const products = getVerifiedProducts().filter((p) => post.relatedProducts.includes(p.slug));
  const foodCategory = getProductCategories().find((c) => c.relatedPosts.includes(post.slug));
  const live = isLive(post);

  return (
    <article className="pt-10">
      <div className="wrap">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "Journal", path: "/blog" },
            { name: post.title, path: `/blog/${post.slug}` },
          ]}
        />
      </div>

      {!live && (
        <div className="wrap mt-6">
          <p role="note" className="bg-ghee px-5 py-3">
            Preview: this article is <strong className="font-medium">{post.status}</strong> and not published. It is
            hidden from search engines and from the production site.
          </p>
        </div>
      )}

      <header className="wrap mt-10 grid md:grid-cols-12 gap-x-8 gap-y-6">
        <div className="md:col-span-9">
          <h1 className="t-head">{post.title}</h1>
          <p className="t-lead mt-6 max-w-[40ch]">{post.description}</p>
        </div>
        <dl className="md:col-span-3 md:col-start-10 self-end grid grid-cols-2 md:grid-cols-1 gap-4 t-small">
          <div>
            <dt className="text-muted">By</dt>
            <dd>
              {author?.ownerSupplied ? (
                <Link className="link" href={`/author/${author.slug}`}>
                  {author.name}
                </Link>
              ) : (
                (author?.name ?? "Desi Nature")
              )}
            </dd>
          </div>
          <div>
            <dt className="text-muted">{post.publishedAt ? "Published" : "Last edited"}</dt>
            <dd>
              <time dateTime={post.publishedAt ?? post.updatedAt}>{formatDate(post.publishedAt ?? post.updatedAt)}</time>
            </dd>
          </div>
          {post.updatedAt && post.publishedAt && post.updatedAt !== post.publishedAt && (
            <div>
              <dt className="text-muted">Updated</dt>
              <dd>
                <time dateTime={post.updatedAt}>{formatDate(post.updatedAt)}</time>
              </dd>
            </div>
          )}
          {category && (
            <div>
              <dt className="text-muted">Filed under</dt>
              <dd>
                <Link className="link" href={`/categories/${category.slug}`}>
                  {category.name}
                </Link>
              </dd>
            </div>
          )}
        </dl>
      </header>

      <div className="wrap mt-16 grid md:grid-cols-12 gap-x-8 gap-y-10">
        {headings.length > 2 && (
          <nav aria-labelledby="toc-title" className="md:col-span-3 md:sticky md:top-6 self-start bg-surface p-6 t-small">
            <h2 id="toc-title" className="italic t-body">
              In this guide
            </h2>
            <ol className="mt-3 space-y-2">
              {headings.map((h) => (
                <li key={h.id}>
                  <a className="link no-underline hover:underline" href={`#${h.id}`}>
                    {h.text}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}
        <div className={headings.length > 2 ? "md:col-span-8 md:col-start-5" : "md:col-span-8 md:col-start-3"}>
          <div className="prose-article max-w-[68ch]" dangerouslySetInnerHTML={{ __html: html }} />

          {post.sources.length > 0 && (
            <section aria-labelledby="sources-title" className="mt-16 bg-surface p-6 md:p-8">
              <h2 id="sources-title" className="t-lead">
                Sources
              </h2>
              <ol className="mt-4 space-y-3 list-decimal pl-5 t-small">
                {post.sources.map((s) => (
                  <li key={s.url}>
                    <a href={s.url} className="link" rel="noopener noreferrer" target="_blank">
                      {s.title}
                    </a>
                    , {s.publisher}. Accessed {formatDate(s.accessed)}.
                  </li>
                ))}
              </ol>
              <p className="mt-5 text-muted t-small">
                How we choose sources and check facts is set out in our{" "}
                <Link className="link" href="/editorial-policy">
                  editorial policy
                </Link>
                .
              </p>
            </section>
          )}

          {(products.length > 0 || foodCategory) && (
            <aside aria-labelledby="related-food-title" className="mt-10 bg-leaf text-[var(--leaf-ink)] p-6 md:p-8">
              <h2 id="related-food-title" className="t-lead">
                Looking for {foodCategory ? foodCategory.name.toLowerCase() : "this"}?
              </h2>
              {products.length > 0 ? (
                <ul className="mt-3 space-y-1">
                  {products.map((p) => (
                    <li key={p.slug}>
                      <Link className="link" href={`/products/${p.slug}`}>
                        {p.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 max-w-[48ch]">{foodCategory?.summary}</p>
              )}
              <Link href={`/contact?product=${foodCategory?.slug ?? "something-else"}`} className="btn btn-ink mt-6">
                Send an enquiry
              </Link>
            </aside>
          )}

          <ShareLinks url={absoluteUrl(`/blog/${post.slug}`)} title={post.title} />
        </div>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related-title" className="wrap mt-[var(--gap-section)]">
          <h2 id="related-title" className="t-head">
            Read next
          </h2>
          <div className="mt-8 grid md:grid-cols-3 gap-3">
            {related.map((p, i) => (
              <ArticleCard key={p.slug} post={p} index={i} />
            ))}
          </div>
        </section>
      )}

      <JsonLd data={articleJsonLd(post, author)} />
    </article>
  );
}
