import type { QualityContext } from "@/lib/content/quality";
import { STATIC_ROUTES } from "@/lib/content/quality";

type Fm = Record<string, unknown>;

export const baseFrontmatter: Fm = {
  title: "How to store honey at home in Indian weather",
  slug: "how-to-store-honey",
  description: "A practical guide to storing honey through Indian summers, monsoon and winter, and what crystallisation really means for your jar.",
  updatedAt: "2026-10-01",
  author: "desi-nature-editorial",
  category: "storage-and-kitchen",
  tags: ["honey"],
  targetQuery: "how to store honey",
  searchIntent: "informational",
  audience: "Households keeping honey at home",
  status: "draft",
  sources: [
    {
      title: "Example source",
      url: "https://example.org/source",
      publisher: "Example Institute",
      accessed: "2026-10-01",
      verification: "opened-and-checked",
    },
  ],
};

function yamlValue(v: unknown, indent = ""): string {
  if (Array.isArray(v)) {
    if (v.length === 0) return "[]";
    return "\n" + v.map((item) => {
      if (item && typeof item === "object") {
        const entries = Object.entries(item as Fm);
        return entries.map(([k, val], i) => `${indent}  ${i === 0 ? "- " : "  "}${k}: ${yamlValue(val, indent + "    ")}`).join("\n");
      }
      return `${indent}  - ${JSON.stringify(item)}`;
    }).join("\n");
  }
  return JSON.stringify(v);
}

export function makeSource(fm: Fm, body: string): string {
  const yaml = Object.entries(fm)
    .map(([k, v]) => `${k}: ${yamlValue(v)}`)
    .join("\n");
  return `---\n${yaml}\n---\n\n${body}\n`;
}

export const longBody = Array.from({ length: 20 }, (_, i) =>
  `## Section ${i + 1}\n\nKeep the jar closed and away from the stove. Use a dry spoon each time you take honey out, and store it in a cool cupboard away from sunlight. See [our enquiry page](/contact) and [products](/products).`,
).join("\n\n");

export function ctx(overrides: Partial<QualityContext> = {}): QualityContext {
  return {
    allPosts: [],
    categorySlugs: ["storage-and-kitchen", "buying-guides"],
    authorSlugs: ["desi-nature-editorial"],
    productSlugs: [],
    staticRoutes: STATIC_ROUTES,
    ...overrides,
  };
}
