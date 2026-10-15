import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { PRODUCTS_TAG } from "@/app/lib/products";

/**
 * POST /api/revalidate — on-demand ISR.
 *
 * Call after editing products in Supabase (e.g. from a database webhook):
 *   curl -X POST -H "Authorization: Bearer $REVALIDATE_SECRET" \
 *        -H "Content-Type: application/json" -d '{"slug":"aura-renewal-serum"}' \
 *        https://your-site/api/revalidate
 *
 * Omit `slug` to refresh the whole catalogue. Stale pages keep being served
 * while fresh ones regenerate in the background (stale-while-revalidate).
 */
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) return Response.json({ error: "Revalidation is not configured" }, { status: 503 });

  const provided = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!safeEqual(provided, secret)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { slug?: unknown };
  const slug = typeof body.slug === "string" && /^[a-z0-9-]{1,200}$/.test(body.slug) ? body.slug : null;
  const tag = slug ? `product:${slug}` : PRODUCTS_TAG;

  revalidateTag(tag, "max");
  return Response.json({ revalidated: tag });
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}
