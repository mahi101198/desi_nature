import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import type { Element, Root } from "hast";
import { visit } from "unist-util-visit";

/**
 * Article Markdown is rendered with raw HTML disabled and then sanitised, so a
 * malicious or careless content file cannot inject scripts, iframes, styles or
 * event handlers. External links open normally but carry rel="noopener" and
 * "nofollow" only when the article says so; internal links stay plain.
 */
const schema = {
  ...defaultSchema,
  // rehype-slug ids are kept without the "user-content-" prefix so #anchors work.
  clobberPrefix: "",
  attributes: {
    ...defaultSchema.attributes,
    a: [...(defaultSchema.attributes?.a ?? []), "rel", "target"],
    "*": [...(defaultSchema.attributes?.["*"] ?? []), "id"],
  },
  protocols: { href: ["http", "https", "mailto", "tel"], src: ["http", "https"] },
};

function externalLinks() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName !== "a") return;
      const href = String(node.properties?.href ?? "");
      if (/^https?:\/\//.test(href)) {
        node.properties = { ...node.properties, rel: ["noopener", "noreferrer"], target: "_blank" };
      }
    });
  };
}

function lazyImages() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName === "img") {
        node.properties = { ...node.properties, loading: "lazy", decoding: "async" };
      }
    });
  };
}

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: false })
  .use(rehypeSlug)
  .use(externalLinks)
  .use(lazyImages)
  .use(rehypeSanitize, schema)
  .use(rehypeStringify);

export async function renderMarkdown(markdown: string): Promise<string> {
  const file = await processor.process(markdown);
  return String(file);
}

export type Heading = { depth: number; text: string; id: string };

function slugify(text: string): string {
  // Mirrors github-slugger closely enough for the headings we write.
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s/g, "-");
}

/** H2 headings for the in-article contents list. */
export function extractHeadings(markdown: string): Heading[] {
  const out: Heading[] = [];
  const withoutCode = markdown.replace(/```[\s\S]*?```/g, "");
  for (const line of withoutCode.split("\n")) {
    const m = /^(#{2,3})\s+(.+?)\s*#*\s*$/.exec(line);
    if (m) {
      const text = m[2].replace(/[*_`]/g, "");
      out.push({ depth: m[1].length, text, id: slugify(text) });
    }
  }
  return out;
}

/** Every link target in the Markdown, in order. */
export function extractLinks(markdown: string): string[] {
  const links: string[] = [];
  const re = /(?<!!)\[[^\]]*\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g;
  for (const m of markdown.matchAll(re)) links.push(m[1]);
  return links;
}

export function extractImages(markdown: string): { alt: string; src: string }[] {
  const re = /!\[([^\]]*)\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g;
  return [...markdown.matchAll(re)].map((m) => ({ alt: m[1], src: m[2] }));
}
