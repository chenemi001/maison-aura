import type { CartTotals } from "@/app/types/cart";

/** Orders at or above this subtotal ship free (₦100,000, in kobo). */
export const FREE_SHIPPING_THRESHOLD_CENTS = 10_000_000;
/** Flat nationwide delivery fee (₦3,500, in kobo). */
export const STANDARD_SHIPPING_CENTS = 350_000;
export const MAX_QUANTITY_PER_LINE = 10;

export function calculateShipping(subtotalCents: number): number {
  if (subtotalCents <= 0) return 0;
  return subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : STANDARD_SHIPPING_CENTS;
}

export function calculateTotals(
  lines: ReadonlyArray<{ unitPriceCents: number; quantity: number }>,
): CartTotals {
  let itemCount = 0;
  let subtotalCents = 0;
  for (const line of lines) {
    itemCount += line.quantity;
    subtotalCents += line.unitPriceCents * line.quantity;
  }
  const shippingCents = calculateShipping(subtotalCents);
  return {
    itemCount,
    subtotalCents,
    shippingCents,
    totalCents: subtotalCents + shippingCents,
    freeShippingRemainingCents: Math.max(0, FREE_SHIPPING_THRESHOLD_CENTS - subtotalCents),
  };
}
