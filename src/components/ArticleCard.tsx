import Link from "next/link";
import { formatDate, type Post } from "@/lib/content/posts";

const TONES = ["#d7cbc5", "#cfc1ba", "#e3dad6"];

/** A journal card: a filled slip in one of three neighbouring tones. */
export function ArticleCard({ post, index = 0, headingLevel = "h3" }: { post: Post; index?: number; headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  return (
    <article className="lift relative flex flex-col justify-between gap-6 p-7 md:p-8 min-h-[18rem]" style={{ background: TONES[index % TONES.length] }}>
      <div>
        <Heading className="t-lead">
          <Link href={`/blog/${post.slug}`} className="no-underline after:absolute after:inset-0 hover:underline">
            {post.title}
          </Link>
        </Heading>
        <p className="mt-4 line-clamp-3">{post.description}</p>
      </div>
      <div className="flex justify-between gap-4">
        <span>
          {post.status !== "published" ? (
            <span className="text-accent">Preview · {post.status}</span>
          ) : (
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          )}
        </span>
        <span>{post.readingMinutes} min read</span>
      </div>
    </article>
  );
}
