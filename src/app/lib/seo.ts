import type { Metadata } from "next";
import { STORE_CURRENCY, toDecimalString } from "@/app/lib/currency";
import { getSiteUrl } from "@/app/lib/env";
import type { Category } from "@/app/types/category";
import type { Product, ProductSummary } from "@/app/types/product";

export const SITE_NAME = "Maison Aura";
export const SITE_TAGLINE = "Considered skincare, crafted in small batches";
export const SITE_DESCRIPTION =
  "Maison Aura is a luxury skincare house creating clinically considered serums, creams and rituals for radiant, resilient skin. Free nationwide delivery across Nigeria on orders over ₦100,000.";

export function absoluteUrl(path = "/"): string {
  return new URL(path, `${getSiteUrl()}/`).toString();
}

interface PageMetadataInput {
  title: string;
  description: string;
  path: string;
  image?: string;
  noIndex?: boolean;
  type?: "website" | "article";
}

/** Builds consistent page metadata with canonical URL, Open Graph and Twitter cards. */
export function buildMetadata({
  title,
  description,
  path,
  image,
  noIndex,
  type = "website",
}: PageMetadataInput): Metadata {
  const url = absoluteUrl(path);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type,
      locale: "en_NG",
      ...(image ? { images: [{ url: absoluteUrl(image), alt: title }] } : {}),
    },
    twitter: { card: "summary_large_image", title, description },
    ...(noIndex ? { robots: { index: false, follow: true } } : {}),
  };
}

// ---------------------------------------------------------------------------
// JSON-LD (schema.org) builders
// ---------------------------------------------------------------------------

type JsonLd = Record<string, unknown>;

/** Serialises JSON-LD safely for an inline `<script>` (escapes `<`). */
export function serializeJsonLd(data: JsonLd | JsonLd[]): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function organizationJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": absoluteUrl("/#organization"),
    name: SITE_NAME,
    url: absoluteUrl("/"),
    logo: absoluteUrl("/logo.svg"),
    description: SITE_DESCRIPTION,
  };
}

export function websiteJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": absoluteUrl("/#website"),
    name: SITE_NAME,
    url: absoluteUrl("/"),
    publisher: { "@id": absoluteUrl("/#organization") },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${absoluteUrl("/search")}?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

export function productJsonLd(product: Product, category: Category | null): JsonLd {
  const url = absoluteUrl(`/products/${product.slug}`);
  const prices = product.variants.map((v) => v.priceCents);
  const availability = product.inStock
    ? "https://schema.org/InStock"
    : "https://schema.org/OutOfStock";

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: product.name,
    description: product.description,
    sku: product.id,
    image: product.images.map((src) => absoluteUrl(src)),
    url,
    brand: { "@type": "Brand", name: SITE_NAME },
    ...(category ? { category: category.name } : {}),
    ...(product.reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating.toFixed(1),
            reviewCount: product.reviewCount,
            bestRating: "5",
            worstRating: "1",
          },
        }
      : {}),
    offers:
      product.variants.length > 1
        ? {
            "@type": "AggregateOffer",
            priceCurrency: STORE_CURRENCY,
            lowPrice: toDecimalString(Math.min(...prices)),
            highPrice: toDecimalString(Math.max(...prices)),
            offerCount: product.variants.length,
            availability,
            url,
          }
        : {
            "@type": "Offer",
            priceCurrency: STORE_CURRENCY,
            price: toDecimalString(product.priceCents),
            availability,
            itemCondition: "https://schema.org/NewCondition",
            url,
          },
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function itemListJsonLd(products: ProductSummary[], startPosition = 1): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: products.map((p, i) => ({
      "@type": "ListItem",
      position: startPosition + i,
      url: absoluteUrl(`/products/${p.slug}`),
      name: p.name,
    })),
  };
}
