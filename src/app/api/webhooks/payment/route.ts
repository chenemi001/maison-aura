import type Stripe from "stripe";
import { updateOrderStatusBySession } from "@/app/lib/orders";
import { constructWebhookEvent, isPaymentConfigured } from "@/app/lib/payment";
import { isAdminConfigured } from "@/app/lib/supabase/admin";
import { statusForEvent } from "@/app/lib/payment-events";

/**
 * POST /api/webhooks/payment — Stripe webhook endpoint.
 *
 * The signature is verified against the raw request body before anything is
 * trusted. Order updates are idempotent and state-guarded, so Stripe's
 * at-least-once delivery and retries are safe.
 */
export async function POST(request: Request) {
  if (!isPaymentConfigured() || !process.env.STRIPE_WEBHOOK_SECRET) {
    return Response.json({ error: "Payments are not configured" }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return Response.json({ error: "Missing Stripe-Signature header" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = constructWebhookEvent(await request.text(), signature);
  } catch {
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  const transition = statusForEvent(event);
  if (!transition) {
    return Response.json({ received: true, ignored: event.type });
  }

  if (!isAdminConfigured()) {
    console.warn(`[stripe-webhook] ${event.type} received but order storage is not configured`);
    return Response.json({ received: true, stored: false });
  }

  try {
    const updated = await updateOrderStatusBySession(
      transition.sessionId,
      transition.status,
      transition.paymentIntentId,
    );
    return Response.json({ received: true, updated });
  } catch (error) {
    console.error("[stripe-webhook] failed to update order", error);
    // A 5xx tells Stripe to retry later.
    return Response.json({ error: "Failed to process event" }, { status: 500 });
  }
}
