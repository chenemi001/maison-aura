"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { UserIcon } from "@/app/components/ui/Icons";

const supabaseEnabled = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
);

/**
 * Account entry point in the header. Session state is resolved in the browser
 * so the header stays part of the static, CDN-cached shell on every page.
 * The Supabase SDK is code-split and loaded after hydration so it never
 * weighs on first paint. This is purely presentational — every protected page re-verifies the
 * session on the server.
 */
export function AccountMenu() {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    if (!supabaseEnabled) return;
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;
    import("@/app/lib/supabase/client").then(({ createClient }) => {
      if (cancelled) return;
      const supabase = createClient();
      const { data } = supabase.auth.onAuthStateChange((_event, session) =>
        setSignedIn(Boolean(session)),
      );
      unsubscribe = () => data.subscription.unsubscribe();
    });
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  return (
    <Link
      href={signedIn ? "/account" : "/account/login"}
      className="site-header-icon relative inline-flex size-10 items-center justify-center rounded-full transition-colors hover:bg-beige-100"
      aria-label={signedIn ? "My account" : "Sign in"}
    >
      <UserIcon className="size-5" />
      {signedIn && (
        <span aria-hidden="true" className="absolute top-2 right-2 size-2 rounded-full bg-success" />
      )}
    </Link>
  );
}
