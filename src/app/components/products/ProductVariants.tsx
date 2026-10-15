"use client";

import { useState } from "react";
import { AddToCartButton } from "@/app/components/cart/AddToCartButton";
import { MinusIcon, PlusIcon } from "@/app/components/ui/Icons";
import { Price } from "@/app/components/ui/Price";
import { MAX_QUANTITY_PER_LINE } from "@/app/lib/pricing";
import { cn } from "@/app/lib/utils";
import type { ProductVariant } from "@/app/types/product";

interface ProductVariantsProps {
  product: {
    id: string;
    slug: string;
    name: string;
    image: string;
    inStock: boolean;
    compareAtCents: number | null;
  };
  variants: ProductVariant[];
}

/** Size selector, live price, quantity stepper and add-to-bag for the product page. */
export function ProductVariants({ product, variants }: ProductVariantsProps) {
  const [variantId, setVariantId] = useState(variants[0]?.id);
  const [quantity, setQuantity] = useState(1);
  const variant = variants.find((v) => v.id === variantId) ?? variants[0];
  if (!variant) return null;

  const isBaseVariant = variant.id === variants[0].id;

  return (
    <div className="space-y-6">
      <Price
        amountCents={variant.priceCents}
        compareAtCents={isBaseVariant ? product.compareAtCents : null}
        className="text-2xl text-ink"
      />

      {variants.length > 1 && (
        <fieldset>
          <legend className="mb-3 text-[11px] font-medium tracking-[0.2em] uppercase">
            Size — <span className="font-normal text-taupe">{variant.label}</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => (
              <label
                key={v.id}
                className={cn(
                  "cursor-pointer border px-5 py-2.5 text-xs tracking-[0.12em] uppercase transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-burgundy-700",
                  v.id === variant.id
                    ? "border-ink bg-ink text-porcelain"
                    : "border-beige-300 hover:border-ink",
                )}
              >
                <input
                  type="radio"
                  name="variant"
                  value={v.id}
                  checked={v.id === variant.id}
                  onChange={() => setVariantId(v.id)}
                  className="sr-only"
                />
                {v.label}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex h-13 w-fit items-center border border-beige-300" role="group" aria-label="Quantity">
          <button
            type="button"
            className="flex size-12 items-center justify-center hover:bg-beige-100 disabled:opacity-40"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
          >
            <MinusIcon className="size-4" />
          </button>
          <output className="w-8 text-center tabular-nums" aria-live="polite" aria-label={`Quantity ${quantity}`}>
            {quantity}
          </output>
          <button
            type="button"
            className="flex size-12 items-center justify-center hover:bg-beige-100 disabled:opacity-40"
            onClick={() => setQuantity((q) => Math.min(MAX_QUANTITY_PER_LINE, q + 1))}
            disabled={quantity >= MAX_QUANTITY_PER_LINE}
            aria-label="Increase quantity"
          >
            <PlusIcon className="size-4" />
          </button>
        </div>
        <AddToCartButton
          className="flex-1"
          quantity={quantity}
          disabled={!product.inStock}
          item={{
            productId: product.id,
            variantId: variant.id,
            slug: product.slug,
            name: product.name,
            variantLabel: variant.label,
            image: product.image,
            unitPriceCents: variant.priceCents,
          }}
        />
      </div>
    </div>
  );
}
