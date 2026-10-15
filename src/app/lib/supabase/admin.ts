import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Privileged Supabase client that bypasses Row Level Security.
 *
 * Used only by trusted server code paths — creating orders during checkout,
 * updating them from verified payment webhooks, and newsletter sign-ups.
 * The `server-only` import makes it a build error to reference this module
 * from a Client Component, so the secret key can never reach the browser.
 */
export function getAdminConfig(): { url: string; key: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? { url, key } : null;
}

export function isAdminConfigured(): boolean {
  return getAdminConfig() !== null;
}

export function createAdminClient() {
  const config = getAdminConfig();
  if (!config) throw new Error("Supabase secret key is not configured");
  return createClient(config.url, config.key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
