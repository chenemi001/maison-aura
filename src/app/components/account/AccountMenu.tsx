"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { UserIcon } from "@/app/components/ui/Icons";

const supabaseEnabled = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
);

// Built-in auth sets this non-sensitive flag alongside its HttpOnly session cookie.
const readSignedInFlag = () => /(?:^|;\s*)ma_signed_in=1(?:;|$)/.test(document.cookie);
const subscribeToFocus = (onChange: () => void) => {
  window.addEventListener("focus", onChange);
  document.addEventListener("visibilitychange", onChange);
  return () => {
    window.removeEventListener("focus", onChange);
    document.removeEventListener("visibilitychange", onChange);
  };
};

/**
 * Account entry point in the header. Session state is resolved in the browser
 * so the header stays part of the static, CDN-cached shell on every page.
 * With Supabase, its SDK is code-split and loaded after hydration so it never
 * weighs on first paint. This is purely presentational — every protected page
 * re-verifies the session on the server.
 */
export function AccountMenu() {
  const [supabaseSignedIn, setSupabaseSignedIn] = useState(false);
  const localSignedIn = useSyncExternalStore(subscribeToFocus, readSignedInFlag, () => false);

  useEffect(() => {
    if (!supabaseEnabled) return;
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;
    import("@/app/lib/supabase/client").then(({ createClient }) => {
      if (cancelled) return;
      const supabase = createClient();
      const { data } = supabase.auth.onAuthStateChange((_event, session) =>
        setSupabaseSignedIn(Boolean(session)),
      );
      unsubscribe = () => data.subscription.unsubscribe();
    });
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  const signedIn = supabaseEnabled ? supabaseSignedIn : localSignedIn;

  return (
    <Link
      href={signedIn ? "/account" : "/account/login"}
      className="site-header-icon relative inline-flex size-10 items-center justify-center rounded-full transition-colors hover:bg-beige-100"
      aria-label={signedIn ? "My account" : "Sign in"}
      data-testid="account-link"
    >
      <UserIcon className="size-5" />
      {signedIn && (
        <span aria-hidden="true" className="absolute top-2 right-2 size-2 rounded-full bg-success" />
      )}
    </Link>
  );
}
