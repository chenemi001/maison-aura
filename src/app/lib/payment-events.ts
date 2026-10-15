import type Stripe from "stripe";
import type { OrderStatus } from "@/app/types/order";

/**
 * Maps a verified Stripe event to the order status transition it implies.
 * Pure function (no I/O) so the webhook's business rules are unit-tested.
 */
export interface Transition {
  sessionId: string;
  status: OrderStatus;
  paymentIntentId: string | null;
}

export function statusForEvent(event: Stripe.Event): Transition | null {
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object;
      // `completed` can fire before funds clear for delayed payment methods.
      if (session.payment_status !== "paid") return null;
      return { sessionId: session.id, status: "paid", paymentIntentId: intentId(session.payment_intent) };
    }
    case "checkout.session.async_payment_failed":
      return { sessionId: event.data.object.id, status: "failed", paymentIntentId: null };
    case "checkout.session.expired":
      return { sessionId: event.data.object.id, status: "cancelled", paymentIntentId: null };
    default:
      return null;
  }
}

function intentId(value: string | Stripe.PaymentIntent | null): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}
