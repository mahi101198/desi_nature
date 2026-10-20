import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { CONTENT_DIR, getLivePosts } from "./posts";
import {
  authorSchema,
  categorySchema,
  productCategorySchema,
  productSchema,
  type Author,
  type Category,
  type Product,
  type ProductCategory,
} from "./schema";

function readJson<T>(file: string, schema: z.ZodType<T>): T {
  const full = path.join(CONTENT_DIR, file);
  const data: unknown = JSON.parse(fs.readFileSync(full, "utf8"));
  const result = schema.safeParse(data);
  if (!result.success) {
    const detail = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`Invalid content in ${file}: ${detail}`);
  }
  return result.data;
}

function readJsonDir<T>(dir: string, schema: z.ZodType<T>): T[] {
  const full = path.join(CONTENT_DIR, dir);
  if (!fs.existsSync(full)) return [];
  return fs
    .readdirSync(full)
    .filter((f) => f.endsWith(".json") && !f.startsWith("_"))
    .sort()
    .map((f) => readJson(path.join(dir, f), schema));
}

export function getCategories(): Category[] {
  return readJson("categories.json", z.array(categorySchema));
}

export function getCategory(slug: string): Category | undefined {
  return getCategories().find((c) => c.slug === slug);
}

/** Minimum live posts before a category page is worth indexing. */
export const CATEGORY_INDEX_THRESHOLD = 2;

export function categoryPostCounts(): Map<string, number> {
  const counts = new Map<string, number>();
  for (const p of getLivePosts()) counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
  return counts;
}

export function getAuthors(): Author[] {
  return readJsonDir("authors", authorSchema);
}

export function getAuthor(slug: string): Author | undefined {
  return getAuthors().find((a) => a.slug === slug);
}

/** Author pages exist only for profiles the owner supplied. */
export function getPublicAuthors(): Author[] {
  return getAuthors().filter((a) => a.ownerSupplied);
}

export function getProductCategories(): ProductCategory[] {
  return readJson("product-categories.json", z.array(productCategorySchema)).sort((a, b) => a.order - b.order);
}

export function getProducts(): Product[] {
  return readJsonDir("products", productSchema);
}

/** Only products the owner has verified are shown as products. */
export function getVerifiedProducts(): Product[] {
  return getProducts().filter((p) => p.verified);
}

export function getVerifiedProduct(slug: string): Product | undefined {
  return getVerifiedProducts().find((p) => p.slug === slug);
}
