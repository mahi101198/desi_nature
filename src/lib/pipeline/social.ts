import { absoluteUrl } from "@/config/site";
import type { Post } from "../content/posts";

/**
 * Social drafts built only from the article's own title, description, headings
 * and supported claims, so nothing new is asserted. A person edits and posts
 * them; nothing is posted automatically.
 */
export function socialDrafts(post: Post, headings: string[]): string {
  const url = absoluteUrl(`/blog/${post.slug}`);
  const supported = post.claims.filter((c) => c.status === "supported" && !c.sensitive).map((c) => c.text);
  const points = (headings.length ? headings : supported).slice(0, 4);
  const tags = post.tags.map((t) => `#${t.replace(/[^a-z0-9]/gi, "")}`).join(" ");

  return `---
article: "${post.slug}"
status: "draft"
note: "Edit before posting. Every statement must come from the article. No health claims, no invented results."
---

# Social drafts: ${post.title}

Link: ${url}

## LinkedIn

${post.description}

What the guide covers:
${points.map((p) => `- ${p}`).join("\n")}

Read it here: ${url}

## Instagram caption

${post.title}.

${post.description}

${points.slice(0, 3).map((p) => `• ${p}`).join("\n")}

Full guide: link in bio.
${tags} #DesiNature

## Facebook

${post.title}

${post.description}

${url}

## Short video script (30–45 seconds, Reels / Shorts)

- 0–3 s, on screen: "${post.title}"
- 3–10 s, voice: the one-line answer from the article's opening paragraph.
${points.slice(0, 3).map((p, i) => `- ${10 + i * 8}–${18 + i * 8} s, show: ${p}`).join("\n")}
- Final 5 s: "Full guide on desinature.in, link in bio."

## Visual brief

${post.imageBrief ?? "Owner photograph of the food in a real Indian kitchen. Natural light. No medical imagery, no stock photos presented as Desi Nature's own."}

## Call to action

${post.relatedProducts.length > 0 ? "Enquire about the related product: " + absoluteUrl("/contact") : "Read the full guide: " + url}
`;
}
