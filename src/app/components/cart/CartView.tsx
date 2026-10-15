"use client";

import { useEffect, useState } from "react";
import { validateCart } from "@/app/actions/cart";
import { CartItem } from "@/app/components/cart/CartItem";
import { CartSummary } from "@/app/components/cart/CartSummary";
import { ButtonLink } from "@/app/components/ui/Button";
import { EmptyState } from "@/app/components/ui/EmptyState";
import { ErrorMessage } from "@/app/components/ui/ErrorMessage";
import { Skeleton } from "@/app/components/ui/Skeleton";
import { useCart } from "@/app/hooks/use-cart";
import { useHydrated } from "@/app/hooks/use-hydrated";

export function CartView() {
  const { items, totals, updateQuantity, removeItem, replaceItems } = useCart();
  const hydrated = useHydrated();
  const [unavailable, setUnavailable] = useState<string[]>([]);
  const [priceChanged, setPriceChanged] = useState(false);

  // Re-price against the live catalogue whenever the bag's contents change.
  const signature = items.map((i) => `${i.variantId}:${i.quantity}`).join("|");
  useEffect(() => {
    if (!signature) return;
    let cancelled = false;
    const lines = items.map(({ productId, variantId, quantity }) => ({ productId, variantId, quantity }));
    validateCart(lines)
      .then((result) => {
        if (cancelled || !result.ok) return;
        setUnavailable(result.unavailable);
        const prices = new Map(result.lines.map((l) => [l.variantId, l.unitPriceCents]));
        const changed = items.some(
          (i) => prices.has(i.variantId) && prices.get(i.variantId) !== i.unitPriceCents,
        );
        if (changed) {
          setPriceChanged(true);
          replaceItems(
            items.map((i) => ({ ...i, unitPriceCents: prices.get(i.variantId) ?? i.unitPriceCents })),
          );
        }
      })
      .catch(() => {
        // Non-fatal: prices are re-validated again at checkout.
      });
    return () => {
      cancelled = true;
    };
    // `items` is intentionally summarised by `signature` to avoid re-running on price updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  if (!hydrated) {
    return (
      <div className="grid gap-10 lg:grid-cols-[1fr_24rem]" role="status" aria-label="Loading your bag">
        <div className="space-y-6">
          {[0, 1].map((i) => (
            <div key={i} className="flex gap-6">
              <Skeleton className="aspect-[4/5] w-28" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </div>
          ))}
        </div>
        <Skeleton className="h-72" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="Your bag is empty"
        description="Discover serums, creams and rituals crafted for radiant, resilient skin."
        action={<ButtonLink href="/products">Explore the collection</ButtonLink>}
      />
    );
  }

  const blocked = items.some((i) => unavailable.includes(i.variantId));

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[1fr_24rem] lg:gap-16">
      <section aria-labelledby="bag-items-heading">
        <h2 id="bag-items-heading" className="sr-only">
          Items in your bag
        </h2>
        {priceChanged && (
          <ErrorMessage tone="info" className="mb-4">
            Some prices have been updated to reflect our current catalogue.
          </ErrorMessage>
        )}
        <ul className="divide-y divide-beige-200 border-y border-beige-200">
          {items.map((item) => (
            <CartItem
              key={item.variantId}
              item={item}
              unavailable={unavailable.includes(item.variantId)}
              onQuantityChange={(q) => updateQuantity(item.variantId, q)}
              onRemove={() => removeItem(item.variantId)}
            />
          ))}
        </ul>
      </section>

      <div className="lg:sticky lg:top-28">
        <CartSummary
          totals={totals}
          action={
            blocked ? (
              <ErrorMessage>Remove unavailable items to continue to checkout.</ErrorMessage>
            ) : (
              <ButtonLink href="/checkout" size="lg" className="w-full" data-testid="checkout-link">
                Continue to checkout
              </ButtonLink>
            )
          }
        />
      </div>
    </div>
  );
}
