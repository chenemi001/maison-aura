/**
 * Centralised, typed access to environment configuration.
 *
 * Only `NEXT_PUBLIC_*` values are ever read in client bundles. Secret keys are
 * read exclusively from server-only modules (`lib/supabase/admin.ts`,
 * `lib/payment.ts`) which import `server-only` to guarantee they can never be
 * bundled for the browser.
 */

function normaliseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return normaliseUrl(process.env.NEXT_PUBLIC_SITE_URL);
  // Vercel preview deployments should link to themselves, not production.
  if (process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return "http://localhost:3000";
}

export function getSupabasePublicConfig(): { url: string; key: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && key ? { url, key } : null;
}

export function isSupabaseConfigured(): boolean {
  return getSupabasePublicConfig() !== null;
}

/**
 * The storefront reads products from Supabase only when explicitly enabled
 * (after the database has been seeded). Otherwise it serves the deterministic
 * 50,000-product demo catalogue from memory.
 */
export function getCatalogSource(): "supabase" | "demo" {
  return process.env.CATALOG_SOURCE === "supabase" && isSupabaseConfigured()
    ? "supabase"
    : "demo";
}
