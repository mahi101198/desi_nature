import { z } from "zod";

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const slug = z.string().regex(SLUG_PATTERN, "must be lowercase kebab-case");
const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "must be YYYY-MM-DD")
  .refine((d) => !Number.isNaN(Date.parse(`${d}T00:00:00Z`)), "must be a real date");

export const POST_STATUSES = ["draft", "review", "approved", "published"] as const;
export type PostStatus = (typeof POST_STATUSES)[number];

export const sourceSchema = z.object({
  title: z.string().min(3),
  url: z.url({ protocol: /^https?$/ }),
  publisher: z.string().min(2),
  accessed: isoDate,
  /**
   * How far the source was checked. "opened-and-checked" means a person or the
   * pipeline read the page and confirmed it supports the claim. Anything else
   * must be checked by the owner before publication.
   */
  verification: z.enum(["opened-and-checked", "search-summary-only", "owner-supplied"]),
  note: z.string().optional(),
  /** An exact sentence from the source. `npm run content:verify-sources` checks it appears on the page. */
  quote: z.string().min(20).optional(),
});

export const claimSchema = z.object({
  text: z.string().min(5),
  /** Indexes into `sources`. */
  sources: z.array(z.number().int().nonnegative()).default([]),
  status: z.enum(["supported", "needs-evidence", "opinion", "owner-experience"]),
  /** Health, nutrition, purity, organic, certification or origin claims. */
  sensitive: z.boolean().default(false),
});

export const imageSchema = z.object({
  src: z.string().min(1),
  alt: z.string().min(5, "alt text must describe the image"),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  credit: z.string().optional(),
  license: z.string().optional(),
  sourceUrl: z.url().optional(),
});

export const postFrontmatterSchema = z
  .object({
    title: z.string().min(10).max(90),
    slug,
    description: z.string().min(50).max(180),
    publishedAt: isoDate.optional(),
    updatedAt: isoDate.optional(),
    author: slug,
    category: slug,
    tags: z.array(z.string().min(2)).max(8).default([]),
    targetQuery: z.string().min(3),
    secondaryQueries: z.array(z.string()).default([]),
    searchIntent: z.enum(["informational", "commercial", "transactional", "navigational"]),
    audience: z.string().min(5),
    sources: z.array(sourceSchema).default([]),
    claims: z.array(claimSchema).default([]),
    featuredImage: imageSchema.optional(),
    imageBrief: z.string().optional(),
    relatedPosts: z.array(slug).default([]),
    relatedProducts: z.array(slug).default([]),
    status: z.enum(POST_STATUSES),
    healthSensitive: z.boolean().default(false),
    reviewedBy: z.string().optional(),
    reviewedAt: isoDate.optional(),
  })
  .superRefine((post, ctx) => {
    if (post.status === "published" && !post.publishedAt) {
      ctx.addIssue({ code: "custom", path: ["publishedAt"], message: "published posts need publishedAt" });
    }
    if (post.updatedAt && post.publishedAt && post.updatedAt < post.publishedAt) {
      ctx.addIssue({ code: "custom", path: ["updatedAt"], message: "updatedAt is before publishedAt" });
    }
    post.claims.forEach((claim, i) => {
      claim.sources.forEach((s) => {
        if (s >= post.sources.length) {
          ctx.addIssue({ code: "custom", path: ["claims", i, "sources"], message: `source index ${s} does not exist` });
        }
      });
    });
  });

export type PostFrontmatter = z.infer<typeof postFrontmatterSchema>;

export const categorySchema = z.object({
  slug,
  name: z.string().min(2),
  description: z.string().min(20),
});
export type Category = z.infer<typeof categorySchema>;

export const authorSchema = z.object({
  slug,
  name: z.string().min(2),
  /** "person" pages need real details supplied by the owner. */
  type: z.enum(["person", "organization"]),
  bio: z.string().min(20),
  role: z.string().optional(),
  sameAs: z.array(z.url()).default([]),
  /** Only owner-supplied profiles get a public /author page. */
  ownerSupplied: z.boolean(),
});
export type Author = z.infer<typeof authorSchema>;

export const productCategorySchema = z.object({
  slug,
  name: z.string().min(2),
  summary: z.string().min(20),
  /** What a buyer should ask about. Questions, not claims. */
  askAbout: z.array(z.string()).default([]),
  relatedPosts: z.array(slug).default([]),
  order: z.number().int().default(0),
});
export type ProductCategory = z.infer<typeof productCategorySchema>;

export const productSchema = z
  .object({
    slug,
    name: z.string().min(2),
    category: slug,
    summary: z.string().min(20),
    description: z.string().min(40),
    /** Only verified products get a public page and Product structured data. */
    verified: z.boolean(),
    verifiedBy: z.string().optional(),
    verifiedAt: isoDate.optional(),
    origin: z.string().optional(),
    sizes: z.array(z.string()).default([]),
    /** Prices are optional and only shown when the owner enters them. */
    priceInr: z.number().positive().optional(),
    availability: z.enum(["in-stock", "seasonal", "on-enquiry", "unavailable"]).default("on-enquiry"),
    fssaiLicence: z.string().optional(),
    image: imageSchema.optional(),
    relatedPosts: z.array(slug).default([]),
  })
  .superRefine((p, ctx) => {
    if (p.verified && (!p.verifiedBy || !p.verifiedAt)) {
      ctx.addIssue({ code: "custom", path: ["verified"], message: "verified products need verifiedBy and verifiedAt" });
    }
  });
export type Product = z.infer<typeof productSchema>;
