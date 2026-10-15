import "server-only";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/app/lib/env";
import { createClient } from "@/app/lib/supabase/server";

export interface SessionUser {
  id: string;
  email: string;
  fullName: string | null;
}

/**
 * Returns the signed-in user, or `null`.
 *
 * Uses `getClaims()`, which verifies the JWT signature, rather than
 * `getSession()`, whose cookie contents must never be trusted on the server.
 * Reads cookies, so callers must render inside a `<Suspense>` boundary.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims?.sub) return null;
  const { claims } = data;
  const fullName = claims.user_metadata?.full_name;
  return {
    id: claims.sub,
    email: claims.email ?? "",
    fullName: typeof fullName === "string" ? fullName : null,
  };
}

/** Redirects to the login page (preserving the destination) when signed out. */
export async function requireUser(returnTo: string): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/account/login?next=${encodeURIComponent(returnTo)}`);
  return user;
}
