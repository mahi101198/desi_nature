import { countWords, type Post } from "./posts";
import { extractHeadings, extractImages, extractLinks } from "./markdown";

/**
 * Automated editorial checks. Passing them is necessary, not sufficient: they
 * catch missing evidence, risky wording and broken structure, but they cannot
 * judge whether an article is genuinely useful. A person still has to read it.
 */

export type Severity = "error" | "warn";
export type Issue = { severity: Severity; code: string; message: string };

export type QualityContext = {
  /** Every post in the repository, any status. */
  allPosts: Pick<Post, "slug" | "title" | "targetQuery" | "status">[];
  categorySlugs: string[];
  authorSlugs: string[];
  /** Product slugs that may be linked (verified products). */
  productSlugs: string[];
  /** Static routes that exist on the site. */
  staticRoutes: string[];
};

export const STATIC_ROUTES = [
  "/",
  "/blog",
  "/products",
  "/about",
  "/contact",
  "/privacy-policy",
  "/terms",
  "/editorial-policy",
];

/** Words that need evidence and human sign-off when used in food content. */
const SENSITIVE_TERMS: { pattern: RegExp; label: string }[] = [
  { pattern: /\bcures?\b|\bcured\b|\bheals?\b|\btreats?\b(?! (?:it|them|ghee|honey)\b)/i, label: "treatment or cure claim" },
  { pattern: /\bboosts?\s+(?:your\s+)?immun/i, label: "immunity claim" },
  { pattern: /\bdetox/i, label: "detox claim" },
  { pattern: /\bprevents?\s+(?:cancer|diabetes|disease|heart)/i, label: "disease prevention claim" },
  { pattern: /\b(?:weight\s*loss|lose weight|burns?\s+fat)\b/i, label: "weight-loss claim" },
  { pattern: /\b100\s*%\s*(?:pure|natural|organic)\b/i, label: "absolute purity claim" },
  { pattern: /\bcertified\b/i, label: "certification claim" },
  { pattern: /\borganic\b/i, label: "organic claim" },
  { pattern: /\bA2\b/, label: "A2 milk claim" },
  { pattern: /\bchemical[- ]free\b/i, label: "chemical-free claim" },
  { pattern: /\bguarantee[ds]?\b/i, label: "guarantee" },
  { pattern: /\b(?:clinically|scientifically)\s+proven\b/i, label: "proof claim" },
];

/** Phrases that read as filler or as machine-written padding. */
// taste-skill-ignore: this list exists to detect these phrases.
const FILLER_PHRASES = [
  "in today's fast-paced world", // taste-skill-ignore
  "in this day and age",
  "delve into", // taste-skill-ignore
  "dive into",
  "unlock the secrets", // taste-skill-ignore
  "game-changer", // taste-skill-ignore
  "look no further",
  "it is important to note that",
  "in conclusion",
  "without further ado",
  "the world of",
  "a testament to",
  "elevate your", // taste-skill-ignore
  "embark on",
];

/** Invented experience or social proof the site must not claim without the owner. */
const INVENTED_EXPERIENCE: RegExp[] = [
  /\bour (?:customers|clients) (?:say|love|tell us)\b/i,
  /\b(?:thousands|hundreds|millions) of (?:happy )?(?:customers|families)\b/i,
  /\bin my \d+ years\b/i,
  /\bwe have (?:tested|tried) (?:this|it) for \d+/i,
  /\btrusted by\b/i,
];

function normalise(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

/** Jaccard similarity of word sets; 1 means identical vocabulary. */
export function similarity(a: string, b: string): number {
  const sa = new Set(normalise(a).split(" ").filter((w) => w.length > 2));
  const sb = new Set(normalise(b).split(" ").filter((w) => w.length > 2));
  if (sa.size === 0 || sb.size === 0) return 0;
  let inter = 0;
  for (const w of sa) if (sb.has(w)) inter++;
  return inter / (sa.size + sb.size - inter);
}

function occurrences(haystack: string, needle: string): number {
  if (!needle) return 0;
  const h = normalise(haystack);
  const n = normalise(needle);
  let count = 0;
  let i = h.indexOf(n);
  while (i !== -1) {
    count++;
    i = h.indexOf(n, i + n.length);
  }
  return count;
}

export function internalLinkExists(href: string, ctx: QualityContext): boolean {
  const pathOnly = href.split("#")[0].split("?")[0].replace(/\/+$/, "") || "/";
  if (ctx.staticRoutes.includes(pathOnly)) return true;
  const blog = /^\/blog\/([a-z0-9-]+)$/.exec(pathOnly);
  if (blog) return ctx.allPosts.some((p) => p.slug === blog[1] && p.status === "published");
  const cat = /^\/categories\/([a-z0-9-]+)$/.exec(pathOnly);
  if (cat) return ctx.categorySlugs.includes(cat[1]);
  const product = /^\/products\/([a-z0-9-]+)$/.exec(pathOnly);
  if (product) return ctx.productSlugs.includes(product[1]);
  return false;
}

/**
 * Checks one post. `forPublication` raises evidence problems to errors; drafts
 * get the same findings as warnings so writers see them early.
 */
export function checkPost(post: Post, ctx: QualityContext, forPublication = post.status !== "draft"): Issue[] {
  const issues: Issue[] = [];
  const gate: Severity = forPublication ? "error" : "warn";
  const add = (severity: Severity, code: string, message: string) => issues.push({ severity, code, message });
  const body = post.body;
  const words = countWords(body);

  // Structure
  if (/^#\s/m.test(body.replace(/```[\s\S]*?```/g, ""))) add("error", "h1-in-body", "The body must not contain an H1; the title is the H1.");
  const headings = extractHeadings(body);
  if (words > 500 && headings.filter((h) => h.depth === 2).length < 2) add("warn", "few-headings", "Long article with fewer than two H2 sections.");
  let last = 1;
  for (const h of headings) {
    if (h.depth > last + 1) add("warn", "heading-skip", `Heading "${h.text}" skips a level.`);
    last = h.depth;
  }
  if (words < 600) add(gate, "thin-content", `Only ${words} words. Useful guides on these topics usually need 800 or more.`);
  if (post.title.length > 65) add("warn", "long-title", `Title is ${post.title.length} characters; search results usually show about 60.`);
  if (post.description.length < 110 || post.description.length > 160) add("warn", "description-length", `Description is ${post.description.length} characters; aim for 110–160.`);

  // References
  if (!ctx.categorySlugs.includes(post.category)) add("error", "unknown-category", `Category "${post.category}" does not exist.`);
  if (!ctx.authorSlugs.includes(post.author)) add("error", "unknown-author", `Author "${post.author}" has no profile in content/authors.`);
  if (post.sources.length === 0) add(gate, "no-sources", "No sources listed. External facts need references.");
  const unchecked = post.sources.filter((s) => s.verification !== "opened-and-checked");
  if (unchecked.length > 0) add(gate, "unverified-sources", `${unchecked.length} source(s) not yet opened and checked by a person.`);

  // Claims
  for (const claim of post.claims) {
    if (claim.status === "needs-evidence") add(gate, "claim-needs-evidence", `Unresolved claim: "${claim.text}"`);
    if (claim.status === "supported" && claim.sources.length === 0) add(gate, "claim-without-source", `Claim marked supported but cites no source: "${claim.text}"`);
    if (claim.status === "owner-experience" && !post.reviewedBy) add(gate, "experience-unconfirmed", `First-hand claim needs owner confirmation: "${claim.text}"`);
    if (claim.sensitive && !post.reviewedBy) add(gate, "sensitive-claim-unreviewed", `Sensitive claim needs human review: "${claim.text}"`);
  }
  if (post.healthSensitive && !post.reviewedBy) add(gate, "health-review-missing", "Health-sensitive article has no reviewedBy.");

  // Risky wording that is not covered by a reviewed claim
  const plain = body.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1");
  const reviewedClaims = post.claims.filter((c) => c.status === "supported" && (!c.sensitive || post.reviewedBy));
  for (const term of SENSITIVE_TERMS) {
    const m = term.pattern.exec(plain);
    if (m && !reviewedClaims.some((c) => term.pattern.test(c.text))) {
      add(gate, "sensitive-term", `Contains ${term.label} ("${m[0]}") with no supported, reviewed claim covering it.`);
    }
  }
  for (const re of INVENTED_EXPERIENCE) {
    const m = re.exec(plain);
    if (m) add("error", "invented-experience", `Possible invented experience or social proof: "${m[0]}".`);
  }
  const lower = plain.toLowerCase();
  for (const phrase of FILLER_PHRASES) {
    if (lower.includes(phrase)) add("warn", "filler", `Filler phrase: "${phrase}".`);
  }

  // Keyword stuffing: exact target query repeated far more than natural.
  const qCount = occurrences(plain, post.targetQuery);
  const qWords = post.targetQuery.split(/\s+/).length;
  if (words > 0 && (qCount * qWords) / words > 0.03) add("warn", "keyword-stuffing", `Target query appears ${qCount} times; write naturally.`);

  // Links
  const links = extractLinks(body);
  const internal = links.filter((l) => l.startsWith("/"));
  for (const href of internal) {
    if (!internalLinkExists(href, ctx)) add(gate, "broken-internal-link", `Internal link to ${href} does not resolve to a live page.`);
  }
  for (const href of links) {
    if (/^https?:\/\/(?:www\.)?desinature\.in/i.test(href)) add("warn", "absolute-internal-link", `Use a relative link instead of ${href}.`);
    if (/^http:\/\//.test(href)) add("warn", "insecure-link", `Insecure http link: ${href}.`);
    if (/vercel\.app|localhost/i.test(href)) add("error", "staging-link", `Link to a non-production host: ${href}.`);
  }
  if (internal.length < 2) add("warn", "few-internal-links", "Fewer than two internal links.");

  // Images
  for (const img of extractImages(body)) {
    if (img.alt.trim().length < 5) add("error", "image-alt", `Image ${img.src} needs descriptive alt text.`);
  }

  // Duplicates
  for (const other of ctx.allPosts) {
    if (other.slug === post.slug) continue;
    if (normalise(other.targetQuery) === normalise(post.targetQuery)) add("error", "duplicate-target", `Same target query as "${other.slug}".`);
    else if (similarity(other.title, post.title) > 0.6) add("warn", "similar-title", `Title is very similar to "${other.slug}".`);
  }

  return issues;
}

export function hasErrors(issues: Issue[]): boolean {
  return issues.some((i) => i.severity === "error");
}
