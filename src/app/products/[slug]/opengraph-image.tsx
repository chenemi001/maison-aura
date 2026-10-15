import { CATEGORY_BY_SLUG } from "@/app/data/categories";
import { formatPrice } from "@/app/lib/currency";
import { OG_SIZE, renderOgImage } from "@/app/lib/og";
import { getProductBySlug } from "@/app/lib/products";

export const alt = "Maison Aura product";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    return renderOgImage({ eyebrow: "Maison Aura", title: "Luxury skincare, considered." });
  }
  return renderOgImage({
    eyebrow: CATEGORY_BY_SLUG.get(product.categorySlug)?.name ?? "Skincare",
    title: product.name,
    footer: `From ${formatPrice(product.priceCents)}`,
  });
}
