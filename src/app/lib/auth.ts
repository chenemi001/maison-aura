import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { isSupabaseConfigured } from "@/app/lib/env";
import {
  SESSION_TTL_SECONDS,
  createSessionToken,
  findUserById,
  getSessionSecret,
  verifySessionToken,
  type LocalUser,
} from "@/app/lib/local-auth";
import { createClient } from "@/app/lib/supabase/server";

export interface SessionUser {
  id: string;
  email: string;
  fullName: string | null;
}

/**
 * Authentication facade. Supabase Auth is used when configured; otherwise the
 * built-in provider (`lib/local-auth.ts`) keeps sign-up and sign-in working
 * with zero setup. Callers never need to know which one is active.
 */
export function getAuthProvider(): "supabase" | "local" {
  return isSupabaseConfigured() ? "supabase" : "local";
}

/** HttpOnly cookie carrying the signed session token (built-in provider). */
export const SESSION_COOKIE = "ma_session";
/**
 * Non-sensitive companion flag readable by client JS, so the header can show
 * the signed-in state while staying in the static, CDN-cached shell.
 */
export const SIGNED_IN_COOKIE = "ma_signed_in";

/**
 * Returns the signed-in user, or `null`. Reads cookies, so callers must
 * render inside a `<Suspense>` boundary.
 *
 * Supabase: uses `getClaims()`, which verifies the JWT signature, rather than
 * `getSession()`, whose cookie contents must never be trusted on the server.
 * Built-in: verifies the HMAC signature and expiry, then confirms the user
 * still exists.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  if (getAuthProvider() === "supabase") {
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

  // Expiry checks read the clock, so this must only ever run at request time,
  // never during prerendering (Cache Components rejects `Date.now()` there).
  await connection();
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const payload = verifySessionToken(token, await getSessionSecret());
  if (!payload) return null;
  const user = await findUserById(payload.sub);
  return user ? { id: user.id, email: user.email, fullName: user.fullName } : null;
}

/** Redirects to the login page (preserving the destination) when signed out. */
export async function requireUser(returnTo: string): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/account/login?next=${encodeURIComponent(returnTo)}`);
  return user;
}

/** Starts a built-in session. Only callable from Server Actions / Route Handlers. */
export async function startLocalSession(user: LocalUser): Promise<void> {
  const store = await cookies();
  const secure = process.env.NODE_ENV === "production";
  store.set(SESSION_COOKIE, createSessionToken(user.id, await getSessionSecret()), {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  store.set(SIGNED_IN_COOKIE, "1", { secure, sameSite: "lax", path: "/", maxAge: SESSION_TTL_SECONDS });
}

export async function endLocalSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  store.delete(SIGNED_IN_COOKIE);
}
