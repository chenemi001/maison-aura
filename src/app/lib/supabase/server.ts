import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { getSupabasePublicConfig } from "@/app/lib/env";

/**
 * Request-scoped Supabase client bound to the visitor's auth cookies.
 * Every query runs as the signed-in user, so Row Level Security applies.
 * Create a new client per request — never share one between requests.
 */
export async function createClient() {
  const config = getSupabasePublicConfig();
  if (!config) throw new Error("Supabase is not configured");
  const cookieStore = await cookies();

  return createServerClient(config.url, config.key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component, where cookies are read-only.
          // The proxy (src/proxy.ts) refreshes sessions, so this is safe.
        }
      },
    },
  });
}

/**
 * Cookie-less client with the public key, for anonymous reads of public data
 * (the product catalogue). Safe to use inside `"use cache"` scopes because it
 * never touches request data.
 */
export function createPublicClient() {
  const config = getSupabasePublicConfig();
  if (!config) throw new Error("Supabase is not configured");
  return createSupabaseClient(config.url, config.key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
