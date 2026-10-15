import Image from "next/image";
import Link from "next/link";
import { QuickAddButton } from "@/app/components/cart/QuickAddButton";
import { Price } from "@/app/components/ui/Price";
import { Rating } from "@/app/components/ui/Rating";
import { CATEGORY_BY_SLUG } from "@/app/data/categories";
import type { ProductSummary } from "@/app/types/product";

interface ProductCardProps {
  product: ProductSummary;
  /** Preload the image (use for above-the-fold cards to improve LCP). */
  preload?: boolean;
  headingLevel?: "h2" | "h3";
}

const SIZES = "(min-width: 1280px) 22vw, (min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw";

export function ProductCard({ product, preload = false, headingLevel = "h3" }: ProductCardProps) {
  const Heading = headingLevel;
  const category = CATEGORY_BY_SLUG.get(product.categorySlug);

  return (
    <article className="group relative flex w-full flex-col" data-testid="product-card">
      <div className="relative aspect-[4/5] overflow-hidden bg-stone">
        <Image
          src={product.image}
          alt=""
          fill
          preload={preload}
          loading={preload ? "eager" : "lazy"}
          sizes={SIZES}
          className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-luxe)] group-hover:scale-[1.05]"
        />
        {product.hoverImage && (
          <Image
            src={product.hoverImage}
            alt=""
            fill
            sizes={SIZES}
            className="object-cover opacity-0 transition-opacity duration-700 ease-[var(--ease-luxe)] group-hover:opacity-100"
          />
        )}

        <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
          {product.badge && (
            <span className="bg-porcelain/95 px-2.5 py-1 text-[10px] font-medium tracking-[0.18em] text-burgundy-800 uppercase">
              {product.badge}
            </span>
          )}
          {!product.inStock && (
            <span className="bg-ink/85 px-2.5 py-1 text-[10px] font-medium tracking-[0.18em] text-porcelain uppercase">
              Sold out
            </span>
          )}
        </div>

        {product.inStock && product.defaultVariant && (
          <div className="absolute inset-x-3 bottom-3 translate-y-[calc(100%+0.75rem)] transition-transform duration-500 ease-[var(--ease-luxe)] group-focus-within:translate-y-0 group-hover:translate-y-0 max-md:hidden">
            <QuickAddButton
              item={{
                productId: product.id,
                variantId: product.defaultVariant.id,
                slug: product.slug,
                name: product.name,
                variantLabel: product.defaultVariant.label,
                image: product.image,
                unitPriceCents: product.priceCents,
              }}
            />
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-1 flex-col gap-1">
        {category && <p className="eyebrow text-[10px]">{category.name}</p>}
        <div className="flex items-start justify-between gap-3">
          <Heading className="font-serif text-lg leading-snug text-ink">
            {/* Stretched link: the whole card is clickable with a single tab stop. */}
            <Link
              href={`/products/${product.slug}`}
              className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none group-focus-within:underline"
            >
              {product.name}
            </Link>
          </Heading>
          <Price
            amountCents={product.priceCents}
            compareAtCents={product.compareAtCents}
            className="shrink-0 flex-col items-end gap-0 pt-1 text-sm"
          />
        </div>
        {product.reviewCount > 0 && <Rating value={product.rating} count={product.reviewCount} />}
      </div>
    </article>
  );
}
