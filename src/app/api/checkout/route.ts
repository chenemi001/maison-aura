import { beginCheckout } from "@/app/lib/checkout";

/**
 * POST /api/checkout
 *
 * JSON API for headless clients (e.g. a mobile app). The web storefront uses
 * the equivalent Server Action; both share `beginCheckout`, which re-prices
 * the bag on the server and returns a Stripe-hosted payment URL.
 *
 * Body: { items: [{ productId, variantId, quantity }], shipping: { email, fullName, ... } }
 * 200:  { url }                     — redirect the customer here to pay
 * 4xx/5xx: { error, fieldErrors? }
 */
export async function POST(request: Request) {
  // Browsers always send Origin on cross-site POSTs; reject foreign origins (CSRF).
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return Response.json({ error: "Cross-origin requests are not allowed" }, { status: 403 });
  }

  if (!request.headers.get("content-type")?.includes("application/json")) {
    return Response.json({ error: "Expected application/json" }, { status: 415 });
  }

  let body: { items?: unknown; shipping?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const result = await beginCheckout({ items: body?.items, shipping: body?.shipping });
  if (!result.ok) {
    return Response.json(
      { error: result.message, fieldErrors: result.fieldErrors },
      { status: result.status },
    );
  }
  return Response.json({ url: result.url });
}
