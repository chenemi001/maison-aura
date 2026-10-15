"use client";

import { AnimatePresence, m } from "motion/react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { CartItem } from "@/app/components/cart/CartItem";
import { buttonClasses } from "@/app/components/ui/Button";
import { CloseIcon } from "@/app/components/ui/Icons";
import { useCart } from "@/app/hooks/use-cart";
import { formatPrice } from "@/app/lib/currency";
import { FREE_SHIPPING_THRESHOLD_CENTS } from "@/app/lib/pricing";

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Slide-over bag. Opens from the header or after "Add to bag".
 * Accessible modal: focus moves in on open and returns on close, Escape and
 * backdrop clicks close it, focus is trapped and the page behind is inert.
 */
export function CartDrawer() {
  const { isOpen, closeCart, items, totals, updateQuantity, removeItem } = useCart();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const main = document.getElementById("main");
    document.body.style.overflow = "hidden";
    main?.setAttribute("inert", "");
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCart();
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      main?.removeAttribute("inert");
      previouslyFocused?.focus?.();
    };
  }, [isOpen, closeCart]);

  const progress = Math.min(100, (totals.subtotalCents / FREE_SHIPPING_THRESHOLD_CENTS) * 100);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50">
          <m.div
            className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={closeCart}
            aria-hidden="true"
          />
          <m.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-drawer-title"
            className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-cream shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.6, ease }}
          >
            <div className="flex h-16 items-center justify-between border-b border-beige-200 px-6">
              <h2 id="cart-drawer-title" className="text-[11px] font-medium tracking-[0.22em] uppercase">
                Your bag {totals.itemCount > 0 && `(${totals.itemCount})`}
              </h2>
              <button
                ref={closeRef}
                type="button"
                onClick={closeCart}
                className="inline-flex size-10 items-center justify-center rounded-full hover:bg-beige-100"
                aria-label="Close bag"
              >
                <CloseIcon className="size-5" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
                <p className="font-display text-4xl">Your bag is empty</p>
                <p className="text-sm text-taupe">Discover formulas crafted for radiant, resilient skin.</p>
                <Link href="/products" onClick={closeCart} className={buttonClasses("primary", "lg")}>
                  Shop the collection
                </Link>
              </div>
            ) : (
              <>
                <div className="border-b border-beige-200 px-6 py-4">
                  <p className="text-xs text-taupe">
                    {totals.freeShippingRemainingCents > 0
                      ? `Add ${formatPrice(totals.freeShippingRemainingCents)} for complimentary delivery`
                      : "Complimentary delivery unlocked"}
                  </p>
                  <div className="mt-2 h-px bg-beige-300">
                    <m.div
                      className="h-px bg-burgundy-700"
                      initial={false}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.6, ease }}
                    />
                  </div>
                </div>

                <ul className="flex-1 divide-y divide-beige-200 overflow-y-auto px-6" aria-label="Items in your bag">
                  {items.map((item) => (
                    <CartItem
                      key={item.variantId}
                      item={item}
                      compact
                      onNavigate={closeCart}
                      onQuantityChange={(q) => updateQuantity(item.variantId, q)}
                      onRemove={() => removeItem(item.variantId)}
                    />
                  ))}
                </ul>

                <div className="space-y-4 border-t border-beige-200 bg-porcelain px-6 py-6">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[11px] tracking-[0.22em] text-taupe uppercase">Subtotal</span>
                    <span className="font-serif text-2xl tabular-nums">{formatPrice(totals.subtotalCents)}</span>
                  </div>
                  <p className="text-xs text-taupe">Delivery calculated at checkout. Prices include 7.5% VAT.</p>
                  <Link
                    href="/checkout"
                    onClick={closeCart}
                    className={buttonClasses("primary", "lg", "w-full")}
                    data-testid="drawer-checkout"
                  >
                    Checkout
                  </Link>
                  <Link href="/cart" onClick={closeCart} className={buttonClasses("outline", "lg", "w-full")}>
                    View bag
                  </Link>
                </div>
              </>
            )}
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );
}
