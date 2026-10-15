import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/app/lib/env";
import { createClient } from "@/app/lib/supabase/server";
import { safeRedirectPath } from "@/app/lib/validations";

/**
 * GET /auth/confirm — completes Supabase email confirmation.
 * Supports both the token-hash link format and the PKCE `code` exchange.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const next = safeRedirectPath(searchParams.get("next"));
  const failure = new URL("/account/login?error=confirmation", request.url);

  if (!isSupabaseConfigured()) return NextResponse.redirect(failure);

  const supabase = await createClient();
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");

  const { error } = tokenHash && type
    ? await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
    : code
      ? await supabase.auth.exchangeCodeForSession(code)
      : { error: new Error("Missing confirmation token") };

  return NextResponse.redirect(error ? failure : new URL(next, request.url));
}
