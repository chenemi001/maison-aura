import "server-only";
import { isSupabaseConfigured } from "@/app/lib/env";
import { createAdminClient } from "@/app/lib/supabase/admin";
import { createClient } from "@/app/lib/supabase/server";
import type { PricedLine } from "@/app/lib/cart-pricing";
import { sourceStatesFor } from "@/app/lib/order-status";
import type { CartTotals } from "@/app/types/cart";
import type { Order, OrderStatus, ShippingAddress } from "@/app/types/order";

interface OrderRow {
  id: string;
  email: string;
  status: OrderStatus;
  currency: string;
  subtotal_cents: number;
  shipping_cents: number;
  total_cents: number;
  shipping_address: ShippingAddress | null;
  created_at: string;
  order_items?: Array<{
    product_id: string;
    product_slug: string;
    name: string;
    variant_label: string;
    image: string;
    unit_price_cents: number;
    quantity: number;
  }>;
}

const ORDER_COLUMNS =
  "id,email,status,currency,subtotal_cents,shipping_cents,total_cents,shipping_address,created_at,order_items(product_id,product_slug,name,variant_label,image,unit_price_cents,quantity)";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function mapOrder(row: OrderRow): Order {
  return {
    id: row.id,
    email: row.email,
    status: row.status,
    currency: row.currency,
    subtotalCents: row.subtotal_cents,
    shippingCents: row.shipping_cents,
    totalCents: row.total_cents,
    shippingAddress: row.shipping_address,
    createdAt: row.created_at,
    items: (row.order_items ?? []).map((i) => ({
      productId: i.product_id,
      productSlug: i.product_slug,
      name: i.name,
      variantLabel: i.variant_label,
      image: i.image,
      unitPriceCents: i.unit_price_cents,
      quantity: i.quantity,
    })),
  };
}

// ---------------------------------------------------------------------------
// Customer reads — run as the signed-in user, so RLS limits them to their own
// orders. The `userId` filter is defence in depth, not the security boundary.
// ---------------------------------------------------------------------------

export async function getOrdersForUser(userId: string): Promise<Order[]> {
  // Orders live in Supabase; with the built-in auth provider there are none yet.
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_COLUMNS)
    .eq("user_id", userId)
    .neq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw new Error(`Could not load orders: ${error.message}`);
  return (data as OrderRow[]).map(mapOrder);
}

export async function getOrderForUser(userId: string, orderId: string): Promise<Order | null> {
  if (!UUID_RE.test(orderId) || !isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_COLUMNS)
    .eq("id", orderId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(`Could not load order: ${error.message}`);
  return data ? mapOrder(data as OrderRow) : null;
}

// ---------------------------------------------------------------------------
// Trusted writes — server-only, using the secret key.
// ---------------------------------------------------------------------------

export async function createPendingOrder(input: {
  userId: string | null;
  email: string;
  shipping: ShippingAddress;
  lines: PricedLine[];
  totals: CartTotals;
  currency: string;
}): Promise<string> {
  const admin = createAdminClient();
  const { data: order, error } = await admin
    .from("orders")
    .insert({
      user_id: input.userId,
      email: input.email,
      status: "pending",
      currency: input.currency.toLowerCase(),
      subtotal_cents: input.totals.subtotalCents,
      shipping_cents: input.totals.shippingCents,
      total_cents: input.totals.totalCents,
      shipping_address: input.shipping,
    })
    .select("id")
    .single();
  if (error || !order) throw new Error(`Could not create order: ${error?.message}`);

  const { error: itemsError } = await admin.from("order_items").insert(
    input.lines.map((line) => ({
      order_id: order.id,
      product_id: line.product.id,
      product_slug: line.product.slug,
      name: line.product.name,
      variant_id: line.variant.id,
      variant_label: line.variant.label,
      image: line.product.image,
      unit_price_cents: line.unitPriceCents,
      quantity: line.quantity,
    })),
  );
  if (itemsError) {
    await admin.from("orders").delete().eq("id", order.id);
    throw new Error(`Could not create order items: ${itemsError.message}`);
  }
  return order.id as string;
}

export async function attachCheckoutSession(orderId: string, sessionId: string) {
  const { error } = await createAdminClient()
    .from("orders")
    .update({ stripe_session_id: sessionId })
    .eq("id", orderId);
  if (error) throw new Error(`Could not link checkout session: ${error.message}`);
}

/**
 * Idempotently transitions the order linked to a Stripe Checkout Session.
 * Returns `true` if a row changed. Safe to call repeatedly (webhook retries,
 * success-page reloads) because the update is conditional on the prior state.
 */
export async function updateOrderStatusBySession(
  sessionId: string,
  status: OrderStatus,
  paymentIntentId?: string | null,
): Promise<boolean> {
  const fromStates = sourceStatesFor(status);
  if (fromStates.length === 0) return false;
  const { data, error } = await createAdminClient()
    .from("orders")
    .update({
      status,
      ...(paymentIntentId ? { stripe_payment_intent_id: paymentIntentId } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_session_id", sessionId)
    .in("status", fromStates)
    .select("id");
  if (error) throw new Error(`Could not update order: ${error.message}`);
  return (data?.length ?? 0) > 0;
}
