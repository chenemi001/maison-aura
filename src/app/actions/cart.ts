"use server";

import { repriceCart } from "@/app/lib/cart-pricing";
import { cartLinesSchema } from "@/app/lib/validations";

export interface ValidatedCartLine {
  variantId: string;
  unitPriceCents: number;
}

export type CartValidationResult =
  | { ok: true; lines: ValidatedCartLine[]; unavailable: string[] }
  | { ok: false };

/**
 * Re-prices the visitor's bag against the live catalogue so the cart page
 * always shows current prices and flags items that can no longer be bought.
 * Accepts only IDs and quantities; prices sent by the client are never read.
 */
export async function validateCart(input: unknown): Promise<CartValidationResult> {
  const parsed = cartLinesSchema.safeParse(input);
  if (!parsed.success) return { ok: false };

  const { lines, issues } = await repriceCart(parsed.data);
  return {
    ok: true,
    lines: lines.map((l) => ({ variantId: l.variant.id, unitPriceCents: l.unitPriceCents })),
    unavailable: issues.map((i) => i.variantId),
  };
}
