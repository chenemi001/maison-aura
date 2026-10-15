import type { MetadataRoute } from "next";
import { countProducts } from "@/app/lib/products";
import { absoluteUrl } from "@/app/lib/seo";

const PRODUCTS_PER_SITEMAP = 10_000;

export default async function robots(): Promise<MetadataRoute.Robots> {
  const chunks = Math.max(1, Math.ceil((await countProducts()) / PRODUCTS_PER_SITEMAP));
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Private, transactional and infinite-space URLs.
        disallow: ["/account", "/cart", "/checkout", "/api/", "/auth/", "/search"],
      },
    ],
    sitemap: [
      absoluteUrl("/sitemap.xml"),
      ...Array.from({ length: chunks }, (_, i) => absoluteUrl(`/products/sitemap/${i}.xml`)),
    ],
  };
}
