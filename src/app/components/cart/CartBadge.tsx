"use client";

import { AnimatePresence, m } from "motion/react";
import { BagIcon } from "@/app/components/ui/Icons";
import { useCart } from "@/app/hooks/use-cart";

/** Header bag button — opens the slide-over bag and pops when the count changes. */
export function CartBadge() {
  const { totals, openCart, isOpen } = useCart();
  const count = totals.itemCount;

  return (
    <button
      type="button"
      onClick={openCart}
      className="site-header-icon relative inline-flex size-10 items-center justify-center rounded-full transition-colors hover:bg-beige-100"
      aria-label={count > 0 ? `Shopping bag, ${count} ${count === 1 ? "item" : "items"}` : "Shopping bag, empty"}
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      data-testid="cart-badge"
    >
      <BagIcon className="size-5" />
      <AnimatePresence>
        {count > 0 && (
          <m.span
            key={count}
            aria-hidden="true"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 22 }}
            className="absolute top-0.5 right-0.5 flex min-w-4.5 items-center justify-center rounded-full bg-burgundy-700 px-1 text-[10px] leading-4.5 font-semibold text-porcelain"
          >
            {count > 99 ? "99+" : count}
          </m.span>
        )}
      </AnimatePresence>
    </button>
  );
}
