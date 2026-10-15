import type { MetadataRoute } from "next";
import { countProducts, getSitemapProducts } from "@/app/lib/products";
import { absoluteUrl } from "@/app/lib/seo";

/** URLs per sitemap file (search engines allow up to 50,000 / 50 MB). */
export const PRODUCTS_PER_SITEMAP = 10_000;

/** Generates /products/sitemap/0.xml … /products/sitemap/N.xml. */
export async function generateSitemaps() {
  const total = await countProducts();
  const chunks = Math.max(1, Math.ceil(total / PRODUCTS_PER_SITEMAP));
  return Array.from({ length: chunks }, (_, id) => ({ id }));
}

export default async function sitemap(props: { id: Promise<string> }): Promise<MetadataRoute.Sitemap> {
  const id = Number(await props.id);
  const products = await getSitemapProducts(id * PRODUCTS_PER_SITEMAP, PRODUCTS_PER_SITEMAP);
  return products.map((p) => ({
    url: absoluteUrl(`/products/${p.slug}`),
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));
}
