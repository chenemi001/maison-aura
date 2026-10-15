import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/app/components/products/ProductGallery";
import { ProductVariants } from "@/app/components/products/ProductVariants";
import { RelatedProducts } from "@/app/components/products/RelatedProducts";
import { CONCERN_LABELS, SKIN_TYPE_LABELS } from "@/app/components/products/filter-options";
import { Breadcrumbs } from "@/app/components/ui/Breadcrumbs";
import { Rating } from "@/app/components/ui/Rating";
import { getCategory, getPopularProductSlugs, getProductBySlug } from "@/app/lib/products";
import { buildMetadata, productJsonLd, serializeJsonLd } from "@/app/lib/seo";
import { formatPrice } from "@/app/lib/currency";
import { FREE_SHIPPING_THRESHOLD_CENTS } from "@/app/lib/pricing";

/**
 * Incremental Static Regeneration: the most popular products are prerendered
 * at build time; the remaining ~50,000 are rendered on first request, cached,
 * and revalidated in the background thereafter.
 */
export async function generateStaticParams() {
  const slugs = await getPopularProductSlugs(48);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found", robots: { index: false } };

  const description =
    product.description.length > 155 ? `${product.description.slice(0, 152).trimEnd()}…` : product.description;
  return buildMetadata({ title: product.name, description, path: `/products/${product.slug}` });
}

export default async function ProductPage({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const category = await getCategory(product.categorySlug);

  return (
    <div className="container-page py-10 md:py-14">
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          ...(category ? [{ name: category.name, path: `/categories/${category.slug}` }] : []),
          { name: product.name, path: `/products/${product.slug}` },
        ]}
      />

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
        <ProductGallery images={product.images} name={product.name} />

        <div className="lg:sticky lg:top-28 lg:self-start lg:py-4">
          {category && <p className="eyebrow">{category.name}</p>}
          <h1 className="mt-4 font-serif text-5xl leading-[1.02] md:text-6xl">{product.name}</h1>
          {product.reviewCount > 0 && (
            <Rating value={product.rating} count={product.reviewCount} size="md" className="mt-4 text-sm" />
          )}
          <p className="mt-6 leading-relaxed text-taupe">{product.description}</p>

          <div className="mt-8">
            <ProductVariants
              product={{
                id: product.id,
                slug: product.slug,
                name: product.name,
                image: product.image,
                inStock: product.inStock,
                compareAtCents: product.compareAtCents,
              }}
              variants={product.variants}
            />
          </div>

          <dl className="mt-8 grid grid-cols-2 gap-6 border-t border-beige-200 pt-6 text-sm">
            <div>
              <dt className="eyebrow text-[10px]">Best for</dt>
              <dd className="mt-1.5">{product.skinTypes.map((s) => SKIN_TYPE_LABELS[s]).join(", ")} skin</dd>
            </div>
            <div>
              <dt className="eyebrow text-[10px]">Targets</dt>
              <dd className="mt-1.5">{product.concerns.map((c) => CONCERN_LABELS[c]).join(", ")}</dd>
            </div>
          </dl>

          <div className="mt-8 divide-y divide-beige-200 border-y border-beige-200">
            <Disclosure title="How to use" defaultOpen>
              <p>{product.howToUse}</p>
            </Disclosure>
            <Disclosure title="Ingredients">
              <p>{product.ingredients.join(", ")}.</p>
              <p className="mt-2 text-xs">
                Ingredient lists may change. Always refer to the packaging of the product you receive.
              </p>
            </Disclosure>
            <Disclosure title="Delivery & returns">
              <p>
                Free nationwide delivery on orders over {formatPrice(FREE_SHIPPING_THRESHOLD_CENTS)} — 1–2 working days in
                Lagos, 2–5 elsewhere in Nigeria. Unopened items may be returned within 14 days for a full refund.
              </p>
            </Disclosure>
          </div>
        </div>
      </div>

      <RelatedProducts slug={product.slug} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(productJsonLd(product, category)) }}
      />
    </div>
  );
}

function Disclosure({
  title,
  children,
  defaultOpen,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details className="group py-4" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between font-serif text-lg [&::-webkit-details-marker]:hidden">
        {title}
        <span aria-hidden="true" className="text-xl text-taupe transition-transform group-open:rotate-45">
          +
        </span>
      </summary>
      <div className="mt-3 text-sm leading-relaxed text-taupe">{children}</div>
    </details>
  );
}
