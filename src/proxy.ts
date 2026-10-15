import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Next.js Proxy (formerly Middleware).
 *
 * 1. Refreshes the Supabase session cookie on authenticated routes so Server
 *    Components always see a valid token.
 * 2. Redirects signed-out visitors away from private account pages with a
 *    real HTTP redirect (an optimistic check — every page and action still
 *    re-verifies the session itself).
 *
 * Lives in `src/` because Next.js requires it next to the `app` directory.
 * Catalogue pages are deliberately excluded so they stay fully static.
 */

const PUBLIC_ACCOUNT_PATHS = ["/account/login", "/account/register"];

function isProtected(pathname: string): boolean {
  return pathname.startsWith("/account") && !PUBLIC_ACCOUNT_PATHS.some((p) => pathname.startsWith(p));
}

export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.next();

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
        for (const [header, value] of Object.entries(headers ?? {})) response.headers.set(header, value);
      },
    },
  });

  // getClaims() validates the JWT and refreshes an expired session if needed.
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims && isProtected(request.nextUrl.pathname)) {
    const login = request.nextUrl.clone();
    login.pathname = "/account/login";
    login.search = `?next=${encodeURIComponent(request.nextUrl.pathname)}`;
    return NextResponse.redirect(login);
  }

  return response;
}

export const config = {
  matcher: ["/account/:path*", "/checkout/:path*", "/auth/:path*"],
};
