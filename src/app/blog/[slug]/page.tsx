import type { Metadata } from "next";
import { ArrowRight, BookMarked, CalendarDays, Clock, ExternalLink, Info, UserRound } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleCard, ArticleCover, categoryLabel } from "@/components/ArticleCard";
import { ReadingProgress } from "@/components/ReadingProgress";
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
    <article>
      <ReadingProgress />
      <header className="bg-hero relative overflow-hidden border-b border-line">
        <div className="bg-grain pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
        <div className="container-x relative pb-12 pt-8">
          <Breadcrumbs
            items={[
              { name: "Home", path: "/" },
              { name: "Journal", path: "/blog" },
              { name: post.title, path: `/blog/${post.slug}` },
            ]}
          />
          {!live && (
            <p role="note" className="mt-6 flex items-start gap-3 rounded-2xl border border-[#f0d9a8] bg-ghee-soft px-5 py-4 text-sm font-semibold text-[#6b430b]">
              <Info className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
              Preview: this article is “{post.status}” and not published. It is hidden from search engines and from the
              production site.
            </p>
          )}
          <div className="mt-10 grid items-center gap-10 lg:grid-cols-12">
            <div className="reveal-stagger lg:col-span-7">
              <div className="flex flex-wrap gap-2">
                {category ? (
                  <Link href={`/categories/${category.slug}`} className="pill hover:bg-[#d3e6d9]">
                    {categoryLabel(category.slug)}
                  </Link>
                ) : null}
                {post.tags.slice(0, 3).map((t) => (
                  <span key={t} className="pill bg-white text-ink-2">
                    {t}
                  </span>
                ))}
              </div>
              <h1 className="mt-5 text-[clamp(2.3rem,1.4rem+3.4vw,4.2rem)] leading-[1.05] tracking-[-0.03em]">{post.title}</h1>
              <p className="lead mt-5">{post.description}</p>
              <dl className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-semibold text-ink-2">
                <div className="flex items-center gap-2">
                  <dt className="sr-only">Author</dt>
                  <span className="flex size-9 items-center justify-center rounded-full bg-forest text-white">
                    <UserRound className="size-4" aria-hidden="true" />
                  </span>
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
                <div className="flex items-center gap-1.5">
                  <dt className="sr-only">{post.publishedAt ? "Published" : "Last edited"}</dt>
                  <CalendarDays className="size-4" aria-hidden="true" />
                  <dd>
                    <time dateTime={post.publishedAt ?? post.updatedAt}>{formatDate(post.publishedAt ?? post.updatedAt)}</time>
                    {post.updatedAt && post.publishedAt && post.updatedAt !== post.publishedAt && (
                      <span className="text-ink-3"> · updated {formatDate(post.updatedAt)}</span>
                    )}
                  </dd>
                </div>
                <div className="flex items-center gap-1.5">
                  <dt className="sr-only">Reading time</dt>
                  <Clock className="size-4" aria-hidden="true" />
                  <dd>{post.readingMinutes} min read</dd>
                </div>
                <div className="flex items-center gap-1.5">
                  <dt className="sr-only">Sources</dt>
                  <BookMarked className="size-4" aria-hidden="true" />
                  <dd>
                    <a href="#sources-title" className="link">
                      {post.sources.length} sources
                    </a>
                  </dd>
                </div>
              </dl>
            </div>
            <div className="reveal lg:col-span-5">
              <ArticleCover post={post} priority className="aspect-[4/3] rounded-[28px] shadow-[var(--shadow-lg)]" />
            </div>
          </div>
        </div>
      </header>

      <div className="container-x grid gap-12 py-14 lg:grid-cols-12 lg:py-20">
        <aside className="lg:col-span-3">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+24px)] flex flex-col gap-6">
            {headings.length > 2 && (
              <nav aria-labelledby="toc-title" className="card p-5">
                <h2 id="toc-title" className="font-sans text-xs font-extrabold uppercase tracking-wider text-ink-3">
                  In this guide
                </h2>
                <ol className="mt-3 space-y-1 text-[0.95rem]">
                  {headings.map((h) => (
                    <li key={h.id}>
                      <a
                        className="block rounded-lg px-2 py-1.5 font-semibold text-ink-2 transition-colors hover:bg-bg-2 hover:text-forest"
                        href={`#${h.id}`}
                      >
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            )}
            <div className="hidden lg:block">
              <ShareLinks url={absoluteUrl(`/blog/${post.slug}`)} title={post.title} />
            </div>
          </div>
        </aside>

        <div className="lg:col-span-8 lg:col-start-5">
          <div className="prose-article max-w-[70ch]" dangerouslySetInnerHTML={{ __html: html }} />

          {(products.length > 0 || foodCategory) && (
            <aside aria-labelledby="related-food-title" className="bg-forest-glow mt-14 overflow-hidden rounded-[28px] p-8 text-white sm:p-10">
              <p className="eyebrow !text-ghee">From Desi Nature</p>
              <h2 id="related-food-title" className="mt-2 text-3xl text-white">
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
                <p className="mt-3 max-w-xl text-white/75">{foodCategory?.summary}</p>
              )}
              <Link href={`/contact?product=${foodCategory?.slug ?? "something-else"}`} className="btn btn-gold mt-6">
                Send an enquiry <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </aside>
          )}

          {post.sources.length > 0 && (
            <section aria-labelledby="sources-title" className="mt-14">
              <h2 id="sources-title" className="text-3xl">
                Sources
              </h2>
              <ol className="mt-5 grid gap-3">
                {post.sources.map((s, i) => (
                  <li key={s.url}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="card card-hover flex items-start gap-4 p-4"
                    >
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-leaf-soft text-sm font-extrabold text-forest">
                        {i + 1}
                      </span>
                      <span className="flex-1">
                        <span className="block font-bold">{s.title}</span>
                        <span className="block text-sm text-ink-3">
                          {s.publisher} · accessed {formatDate(s.accessed)}
                        </span>
                      </span>
                      <ExternalLink className="mt-1 size-4 shrink-0 text-ink-3" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ol>
              <p className="mt-5 text-sm text-ink-3">
                How we choose sources and check facts is set out in our{" "}
                <Link className="link" href="/editorial-policy">
                  editorial policy
                </Link>
                .
              </p>
            </section>
          )}

          <div className="mt-10 border-t border-line pt-6 lg:hidden">
            <ShareLinks url={absoluteUrl(`/blog/${post.slug}`)} title={post.title} />
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related-title" className="section-tight bg-bg-2">
          <div className="container-x">
            <h2 id="related-title" className="h-section">
              Read next
            </h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {related.map((p) => (
                <ArticleCard key={p.slug} post={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      <JsonLd data={articleJsonLd(post, author)} />
    </article>
  );
}
