import { ArrowUpRight, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatDate, type Post } from "@/lib/content/posts";
import { FoodArt, type ArtKind } from "./art/FoodArt";

const CATEGORY_ART: Record<string, ArtKind> = {
  "storage-and-kitchen": "kitchen",
  "buying-guides": "ghee",
  "garden-and-field": "field",
  sourcing: "grains",
};

const CATEGORY_LABEL: Record<string, string> = {
  "storage-and-kitchen": "Storage & kitchen",
  "buying-guides": "Buying guide",
  "garden-and-field": "Garden & field",
  sourcing: "Sourcing",
};

export function artForCategory(category: string): ArtKind {
  return CATEGORY_ART[category] ?? "field";
}

/** Prefer artwork for the food the article is about, then its category. */
export function artForPost(post: Pick<Post, "category" | "tags">): ArtKind {
  const tags = post.tags.join(" ").toLowerCase();
  if (tags.includes("ghee")) return "ghee";
  if (tags.includes("honey")) return "honey";
  if (/grain|wheat|atta|millet|rice|dal|pulse/.test(tags)) return "grains";
  return artForCategory(post.category);
}

export function categoryLabel(category: string): string {
  return CATEGORY_LABEL[category] ?? category;
}

/** Cover: the article's own image if it has one, otherwise category artwork. */
export function ArticleCover({ post, className = "", priority = false }: { post: Post; className?: string; priority?: boolean }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {post.featuredImage ? (
        <Image
          src={post.featuredImage.src}
          alt={post.featuredImage.alt}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
      ) : (
        <FoodArt kind={artForPost(post)} title="" className="absolute inset-0 h-full w-full" />
      )}
    </div>
  );
}

export function ArticleCard({
  post,
  headingLevel = "h3",
  featured = false,
}: {
  post: Post;
  index?: number;
  headingLevel?: "h2" | "h3";
  featured?: boolean;
}) {
  const Heading = headingLevel;
  return (
    <article
      className={`card card-hover group relative flex overflow-hidden ${featured ? "flex-col md:flex-row" : "flex-col"}`}
    >
      <ArticleCover
        post={post}
        className={featured ? "aspect-[16/10] md:aspect-auto md:w-1/2 md:min-h-[360px]" : "aspect-[16/10]"}
      />
      <div className={`flex flex-1 flex-col gap-4 p-6 ${featured ? "md:p-10 md:justify-center" : ""}`}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="pill">{categoryLabel(post.category)}</span>
          {post.status !== "published" && <span className="pill pill-gold">Preview · {post.status}</span>}
        </div>
        <Heading className={featured ? "text-3xl md:text-4xl" : "h-card"}>
          <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0">
            {post.title}
          </Link>
        </Heading>
        <p className="muted line-clamp-3">{post.description}</p>
        <div className="mt-auto flex items-center justify-between gap-4 pt-2 text-sm font-semibold text-ink-3">
          <span className="flex items-center gap-3">
            {post.publishedAt && <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>}
            <span className="inline-flex items-center gap-1">
              <Clock className="size-4" aria-hidden="true" /> {post.readingMinutes} min read
            </span>
          </span>
          <span className="flex size-10 items-center justify-center rounded-full bg-bg-2 text-forest transition-colors group-hover:bg-forest group-hover:text-white">
            <ArrowUpRight className="size-5" aria-hidden="true" />
          </span>
        </div>
      </div>
    </article>
  );
}
