import "server-only";
import { getCurrentUser } from "@/app/lib/auth";
import { repriceCart } from "@/app/lib/cart-pricing";
import { STORE_CURRENCY } from "@/app/lib/currency";
import { attachCheckoutSession, createPendingOrder } from "@/app/lib/orders";
import { createCheckoutSession, isPaymentConfigured } from "@/app/lib/payment";
import { isAdminConfigured } from "@/app/lib/supabase/admin";
import {
  cartLinesSchema,
  fieldErrors,
  shippingSchema,
  type ShippingInput,
} from "@/app/lib/validations";

export type BeginCheckoutResult =
  | { ok: true; url: string }
  | {
      ok: false;
      status: 400 | 409 | 502 | 503;
      message: string;
      fieldErrors?: Record<string, string>;
    };

export const PAYMENTS_UNAVAILABLE_MESSAGE =
  "Online payments are not enabled on this deployment yet. No order has been placed and you have not been charged.";

/**
 * Shared checkout pipeline used by both the Server Action (`actions/checkout.ts`)
 * and the JSON API (`api/checkout/route.ts`):
 *
 *   validate input → re-price from catalogue → create pending order →
 *   create Stripe Checkout Session → return the hosted payment URL.
 */
export async function beginCheckout(input: {
  items: unknown;
  shipping: unknown;
}): Promise<BeginCheckoutResult> {
  if (!isPaymentConfigured()) {
    return { ok: false, status: 503, message: PAYMENTS_UNAVAILABLE_MESSAGE };
  }

  const items = cartLinesSchema.safeParse(input.items);
  if (!items.success) {
    return { ok: false, status: 400, message: items.error.issues[0]?.message ?? "Invalid bag" };
  }

  const shipping = shippingSchema.safeParse(input.shipping);
  if (!shipping.success) {
    return {
      ok: false,
      status: 400,
      message: "Please check your delivery details.",
      fieldErrors: fieldErrors(shipping.error),
    };
  }

  const priced = await repriceCart(items.data);
  if (priced.issues.length > 0 || priced.lines.length === 0) {
    return {
      ok: false,
      status: 409,
      message:
        "Some items in your bag are no longer available. Please review your bag and try again.",
    };
  }

  const { email, ...address } = shipping.data satisfies ShippingInput;
  const user = await getCurrentUser();

  try {
    const orderId = isAdminConfigured()
      ? await createPendingOrder({
          userId: user?.id ?? null,
          email,
          shipping: address,
          lines: priced.lines,
          totals: priced.totals,
          currency: STORE_CURRENCY,
        })
      : null;

    const session = await createCheckoutSession({
      orderId,
      email,
      shipping: address,
      lines: priced.lines,
      totals: priced.totals,
    });

    if (orderId) await attachCheckoutSession(orderId, session.id);
    if (!session.url) throw new Error("Stripe did not return a checkout URL");
    return { ok: true, url: session.url };
  } catch (error) {
    console.error("[checkout] failed to start checkout", error);
    return {
      ok: false,
      status: 502,
      message:
        "We couldn't reach our payment provider. You have not been charged — please try again in a moment.",
    };
  }
}
