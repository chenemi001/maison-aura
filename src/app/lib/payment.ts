import "server-only";
import Stripe from "stripe";
import type { PricedLine } from "@/app/lib/cart-pricing";
import { STORE_CURRENCY } from "@/app/lib/currency";
import { getSiteUrl } from "@/app/lib/env";
import type { CartTotals } from "@/app/types/cart";
import type { ShippingAddress } from "@/app/types/order";

/**
 * Stripe integration (hosted Checkout).
 *
 * Card details are entered on Stripe's PCI-DSS Level 1 hosted page and never
 * touch this server. Orders are only marked as paid after Stripe confirms the
 * payment — via a signature-verified webhook or a server-side session lookup.
 * There is no code path that fakes or simulates a successful payment.
 */

let stripeClient: Stripe | null = null;

export function isPaymentConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
  stripeClient ??= new Stripe(key, {
    appInfo: { name: "Maison Aura", url: getSiteUrl() },
    maxNetworkRetries: 2,
  });
  return stripeClient;
}

export async function createCheckoutSession(input: {
  orderId: string | null;
  email: string;
  shipping: ShippingAddress;
  lines: PricedLine[];
  totals: CartTotals;
}): Promise<Stripe.Checkout.Session> {
  const siteUrl = getSiteUrl();
  const currency = STORE_CURRENCY.toLowerCase();
  const metadata: Record<string, string> = input.orderId ? { order_id: input.orderId } : {};

  return getStripe().checkout.sessions.create(
    {
      mode: "payment",
      customer_email: input.email,
      client_reference_id: input.orderId ?? undefined,
      locale: "auto",
      line_items: input.lines.map((line) => ({
        quantity: line.quantity,
        price_data: {
          currency,
          unit_amount: line.unitPriceCents,
          product_data: {
            name: `${line.product.name} — ${line.variant.label}`,
            metadata: { product_id: line.product.id, variant_id: line.variant.id },
          },
        },
      })),
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            display_name:
              input.totals.shippingCents === 0
                ? "Free nationwide delivery"
                : "Nationwide delivery",
            fixed_amount: { amount: input.totals.shippingCents, currency },
            delivery_estimate: {
              minimum: { unit: "business_day", value: 1 },
              maximum: { unit: "business_day", value: 5 },
            },
          },
        },
      ],
      payment_intent_data: {
        metadata,
        shipping: {
          name: input.shipping.fullName,
          phone: input.shipping.phone,
          address: {
            line1: input.shipping.line1,
            line2: input.shipping.line2,
            city: input.shipping.city,
            state: input.shipping.state,
            postal_code: input.shipping.postcode,
            country: input.shipping.country,
          },
        },
      },
      metadata,
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout/cancel`,
    },
    input.orderId ? { idempotencyKey: `checkout-session-${input.orderId}` } : undefined,
  );
}

export async function retrieveCheckoutSession(sessionId: string) {
  return getStripe().checkout.sessions.retrieve(sessionId, {
    expand: ["line_items"],
  });
}

/** Verifies the `Stripe-Signature` header and parses the event. Throws if invalid. */
export function constructWebhookEvent(rawBody: string, signature: string): Stripe.Event {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
  return getStripe().webhooks.constructEvent(rawBody, signature, secret);
}

export const CHECKOUT_SESSION_ID_RE = /^cs_(test|live)_[A-Za-z0-9]{10,}$/;
