import type { MetadataRoute } from "next";
import { getCategories } from "@/app/lib/products";
import { absoluteUrl } from "@/app/lib/seo";

/**
 * /sitemap.xml — static and category pages.
 * Product URLs live in chunked sitemaps (see `products/sitemap.ts`) so the
 * 50,000+ product catalogue stays within search-engine limits per file.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const categories = await getCategories();

  return [
    { url: absoluteUrl("/"), changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/products"), changeFrequency: "daily", priority: 0.9 },
    ...categories.map((c) => ({
      url: absoluteUrl(`/categories/${c.slug}`),
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    { url: absoluteUrl("/policies/returns"), changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/policies/terms"), changeFrequency: "yearly", priority: 0.2 },
    { url: absoluteUrl("/policies/privacy"), changeFrequency: "yearly", priority: 0.2 },
  ];
}
