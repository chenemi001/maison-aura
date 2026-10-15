"use client";

import Image from "next/image";
import Link from "next/link";
import { MinusIcon, PlusIcon } from "@/app/components/ui/Icons";
import { formatPrice } from "@/app/lib/currency";
import { MAX_QUANTITY_PER_LINE } from "@/app/lib/pricing";
import { cn } from "@/app/lib/utils";
import type { CartItem as CartItemType } from "@/app/types/cart";

interface CartItemProps {
  item: CartItemType;
  unavailable?: boolean;
  /** Tighter layout for the slide-over bag. */
  compact?: boolean;
  /** Called when a product link is followed (e.g. to close the drawer). */
  onNavigate?(): void;
  onQuantityChange(quantity: number): void;
  onRemove(): void;
}

export function CartItem({ item, unavailable, compact, onNavigate, onQuantityChange, onRemove }: CartItemProps) {
  return (
    <li className={cn("flex gap-4", compact ? "py-5" : "py-6 sm:gap-6")} data-testid="cart-item">
      <Link
        href={`/products/${item.slug}`}
        onClick={onNavigate}
        className={cn("relative aspect-[4/5] shrink-0 overflow-hidden bg-stone", compact ? "w-20" : "w-24 sm:w-28")}
        tabIndex={-1}
        aria-hidden="true"
      >
        <Image src={item.image} alt="" fill sizes="112px" className="object-cover" />
      </Link>

      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className={cn("font-serif leading-snug", compact ? "text-base" : "text-xl")}>
              <Link href={`/products/${item.slug}`} onClick={onNavigate} className="hover:text-burgundy-700">
                {item.name}
              </Link>
            </h3>
            <p className="mt-0.5 text-xs tracking-wide text-taupe uppercase">
              {item.variantLabel} · {formatPrice(item.unitPriceCents)}
            </p>
          </div>
          <p className="text-sm font-medium tabular-nums">{formatPrice(item.unitPriceCents * item.quantity)}</p>
        </div>

        {unavailable && (
          <p className="mt-2 text-sm text-danger" role="alert">
            This item is no longer available. Please remove it to continue.
          </p>
        )}

        <div className="mt-auto flex items-center justify-between pt-3">
          <div
            className="flex h-9 items-center border border-beige-300"
            role="group"
            aria-label={`Quantity for ${item.name}`}
          >
            <button
              type="button"
              className="flex size-9 items-center justify-center hover:bg-beige-100"
              onClick={() => onQuantityChange(item.quantity - 1)}
              aria-label={item.quantity <= 1 ? `Remove ${item.name}` : `Decrease quantity of ${item.name}`}
            >
              <MinusIcon className="size-3.5" />
            </button>
            <output className="w-7 text-center text-sm tabular-nums" aria-live="polite">
              {item.quantity}
            </output>
            <button
              type="button"
              className="flex size-9 items-center justify-center hover:bg-beige-100 disabled:opacity-40"
              onClick={() => onQuantityChange(item.quantity + 1)}
              disabled={item.quantity >= MAX_QUANTITY_PER_LINE}
              aria-label={`Increase quantity of ${item.name}`}
            >
              <PlusIcon className="size-3.5" />
            </button>
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="text-[11px] tracking-[0.18em] text-taupe uppercase underline-offset-4 hover:text-burgundy-700 hover:underline"
          >
            Remove<span className="sr-only"> {item.name}</span>
          </button>
        </div>
      </div>
    </li>
  );
}
