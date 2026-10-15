"use client";

import { m } from "motion/react";
import { useState } from "react";
import { CheckIcon, PlusIcon } from "@/app/components/ui/Icons";
import { useCart } from "@/app/hooks/use-cart";
import type { CartItem } from "@/app/types/cart";

/** One-tap "add smallest size" control overlaid on product card images. */
export function QuickAddButton({ item }: { item: Omit<CartItem, "quantity"> }) {
  const { addItem, openCart } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <m.button
      type="button"
      whileTap={{ scale: 0.97 }}
      onClick={() => {
        addItem(item, 1);
        openCart();
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
      }}
      className="relative z-10 flex h-11 w-full items-center justify-center gap-2 bg-porcelain/95 text-[11px] font-medium tracking-[0.2em] text-ink uppercase backdrop-blur transition-colors hover:bg-ink hover:text-porcelain"
      aria-label={`Add ${item.name}, ${item.variantLabel}, to bag`}
    >
      {added ? <CheckIcon className="size-4" /> : <PlusIcon className="size-4" />}
      {added ? "Added" : `Quick add · ${item.variantLabel}`}
    </m.button>
  );
}
