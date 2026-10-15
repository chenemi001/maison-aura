import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { CATEGORIES, CATEGORY_BY_SLUG } from "@/app/data/categories";
import { demoCatalog } from "@/app/lib/catalog/demo";
import { supabaseCatalog } from "@/app/lib/catalog/supabase";
import type { CatalogRepository } from "@/app/lib/catalog/types";
import { getCatalogSource } from "@/app/lib/env";
import type { Category } from "@/app/types/category";
import type { ProductQuery } from "@/app/types/product";

/**
 * Cached catalogue facade used by every page.
 *
 * Results are cached with `"use cache"` (Next.js Cache Components) so listing
 * and product pages are prerendered into the static shell and revalidated in
 * the background (ISR). Data can also be invalidated on demand via the
 * `products` tag — see `src/app/api/revalidate/route.ts`.
 */

export const PRODUCTS_TAG = "products";

function catalog(): CatalogRepository {
  return getCatalogSource() === "supabase" ? supabaseCatalog : demoCatalog;
}

export async function getProducts(query: ProductQuery) {
  "use cache";
  cacheLife("hours");
  cacheTag(PRODUCTS_TAG);
  return catalog().listProducts(query);
}

export async function getProductBySlug(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(PRODUCTS_TAG, `product:${slug}`);
  return catalog().getProductBySlug(slug);
}

export async function getFeaturedProducts(limit = 8) {
  "use cache";
  cacheLife("hours");
  cacheTag(PRODUCTS_TAG);
  return catalog().getFeaturedProducts(limit);
}

export async function getNewArrivals(limit = 8) {
  "use cache";
  cacheLife("hours");
  cacheTag(PRODUCTS_TAG);
  const result = await catalog().listProducts({ sort: "newest", page: 1, pageSize: limit, inStock: true });
  return result.items;
}

export async function getRelatedProducts(slug: string, limit = 4) {
  "use cache";
  cacheLife("hours");
  cacheTag(PRODUCTS_TAG);
  const product = await catalog().getProductBySlug(slug);
  return product ? catalog().getRelatedProducts(product, limit) : [];
}

/** Slugs of the most popular products, prerendered at build time. */
export async function getPopularProductSlugs(limit: number) {
  "use cache";
  cacheLife("days");
  cacheTag(PRODUCTS_TAG);
  const products = await catalog().getFeaturedProducts(limit);
  return products.map((p) => p.slug);
}

export async function countProducts() {
  "use cache";
  cacheLife("days");
  cacheTag(PRODUCTS_TAG);
  return catalog().countProducts();
}

export async function getSitemapProducts(offset: number, limit: number) {
  "use cache";
  cacheLife("days");
  cacheTag(PRODUCTS_TAG);
  return catalog().listSitemapProducts(offset, limit);
}

/**
 * Uncached lookup for checkout. Prices must be read fresh from the source of
 * truth at the moment of payment, never from a cache or from the client.
 */
export function getProductsForCheckout(ids: string[]) {
  return catalog().getProductsByIds(ids);
}

export async function getCategories(): Promise<Category[]> {
  return CATEGORIES;
}

export async function getCategory(slug: string): Promise<Category | null> {
  return CATEGORY_BY_SLUG.get(slug) ?? null;
}
