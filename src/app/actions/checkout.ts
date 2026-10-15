"use server";

import { redirect } from "next/navigation";
import { beginCheckout } from "@/app/lib/checkout";

export interface CheckoutFormState {
  message?: string;
  fieldErrors?: Record<string, string>;
  /** Echoed back so the form can be re-populated after a failed attempt. */
  values?: Record<string, string>;
}

const SHIPPING_FIELDS = ["email", "fullName", "line1", "line2", "city", "state", "postcode", "country", "phone"] as const;

/**
 * Checkout Server Action. Validates the form and bag, re-prices on the
 * server, then redirects the browser to Stripe's hosted payment page.
 */
export async function startCheckout(
  _previous: CheckoutFormState,
  formData: FormData,
): Promise<CheckoutFormState> {
  const values = Object.fromEntries(
    SHIPPING_FIELDS.map((field) => [field, String(formData.get(field) ?? "")]),
  );

  let items: unknown;
  try {
    items = JSON.parse(String(formData.get("cart") ?? "[]"));
  } catch {
    return { message: "We couldn't read your bag. Please refresh and try again.", values };
  }

  const result = await beginCheckout({ items, shipping: values });
  if (!result.ok) {
    return { message: result.message, fieldErrors: result.fieldErrors, values };
  }

  // Must be outside try/catch: redirect() works by throwing.
  redirect(result.url);
}
