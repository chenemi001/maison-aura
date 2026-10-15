import type Stripe from "stripe";
import { describe, expect, it } from "vitest";
import { ALLOWED_TRANSITIONS, sourceStatesFor } from "@/app/lib/order-status";
import { statusForEvent } from "@/app/lib/payment-events";

describe("order status transitions", () => {
  it("only lets pending (or failed) orders become paid", () => {
    expect(sourceStatesFor("paid").sort()).toEqual(["failed", "pending"]);
  });

  it("never lets a terminal order change state", () => {
    expect(ALLOWED_TRANSITIONS.cancelled).toEqual([]);
    expect(ALLOWED_TRANSITIONS.refunded).toEqual([]);
  });

  it("never moves a paid order back to pending", () => {
    expect(sourceStatesFor("pending")).toEqual([]);
  });
});

const sessionEvent = (type: string, session: Partial<Stripe.Checkout.Session>) =>
  ({ type, data: { object: { id: "cs_test_123", ...session } } }) as unknown as Stripe.Event;

describe("statusForEvent (Stripe webhook mapping)", () => {
  it("marks paid sessions as paid", () => {
    expect(
      statusForEvent(sessionEvent("checkout.session.completed", { payment_status: "paid", payment_intent: "pi_1" })),
    ).toEqual({ sessionId: "cs_test_123", status: "paid", paymentIntentId: "pi_1" });
  });

  it("does not mark an order paid before funds have cleared", () => {
    expect(statusForEvent(sessionEvent("checkout.session.completed", { payment_status: "unpaid" }))).toBeNull();
  });

  it("handles delayed payment outcomes and expiry", () => {
    expect(
      statusForEvent(sessionEvent("checkout.session.async_payment_succeeded", { payment_status: "paid", payment_intent: null })),
    ).toMatchObject({ status: "paid" });
    expect(statusForEvent(sessionEvent("checkout.session.async_payment_failed", {}))).toMatchObject({ status: "failed" });
    expect(statusForEvent(sessionEvent("checkout.session.expired", {}))).toMatchObject({ status: "cancelled" });
  });

  it("ignores unrelated events", () => {
    expect(statusForEvent({ type: "customer.created", data: { object: {} } } as unknown as Stripe.Event)).toBeNull();
  });
});
