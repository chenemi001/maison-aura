import { afterEach, describe, expect, it, vi } from "vitest";
import { getDemoCatalogue } from "@/app/data/products";
import { CATEGORY_BY_SLUG } from "@/app/data/categories";
import { absoluteUrl, buildMetadata, productJsonLd, serializeJsonLd } from "@/app/lib/seo";

afterEach(() => vi.unstubAllEnvs());

describe("absoluteUrl", () => {
  it("uses NEXT_PUBLIC_SITE_URL without double slashes", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://maison-aura.example/");
    expect(absoluteUrl("/products/x")).toBe("https://maison-aura.example/products/x");
  });

  it("uses the deployment URL on Vercel previews", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("VERCEL_URL", "maison-aura-git-feature.vercel.app");
    expect(absoluteUrl("/")).toBe("https://maison-aura-git-feature.vercel.app/");
  });
});

describe("buildMetadata", () => {
  it("sets a canonical URL and social metadata", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://maison-aura.example");
    const meta = buildMetadata({ title: "Serums", description: "d", path: "/categories/serums", noIndex: true });
    expect(meta.alternates?.canonical).toBe("https://maison-aura.example/categories/serums");
    expect(meta.openGraph).toMatchObject({ url: "https://maison-aura.example/categories/serums", locale: "en_NG" });
    expect(meta.robots).toEqual({ index: false, follow: true });
  });
});

describe("productJsonLd", () => {
  const product = getDemoCatalogue()[0];
  const json = productJsonLd(product, CATEGORY_BY_SLUG.get(product.categorySlug)!);

  it("describes the product with brand, rating and price range", () => {
    expect(json).toMatchObject({
      "@type": "Product",
      name: product.name,
      sku: product.id,
      brand: { "@type": "Brand", name: "Maison Aura" },
      aggregateRating: { reviewCount: product.reviewCount },
    });
    const offers = json.offers as Record<string, unknown>;
    expect(offers["@type"]).toBe("AggregateOffer");
    expect(offers.priceCurrency).toBe("NGN");
    expect(offers.lowPrice).toBe("68000.00");
  });
});

describe("serializeJsonLd", () => {
  it("escapes < so content cannot break out of the script tag", () => {
    const out = serializeJsonLd({ name: "</script><script>alert(1)</script>" });
    expect(out).not.toContain("<");
    expect(JSON.parse(out).name).toBe("</script><script>alert(1)</script>");
  });
});
