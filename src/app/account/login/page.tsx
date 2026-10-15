import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AccountsUnavailable } from "@/app/components/account/AccountsUnavailable";
import { LoginForm } from "@/app/components/account/LoginForm";
import { Skeleton } from "@/app/components/ui/Skeleton";
import { getCurrentUser } from "@/app/lib/auth";
import { isSupabaseConfigured } from "@/app/lib/env";
import { safeRedirectPath } from "@/app/lib/validations";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: true },
};

export default function LoginPage({ searchParams }: PageProps<"/account/login">) {
  return (
    <div className="container-page flex justify-center py-12 md:py-20">
      <div className="w-full max-w-md">
        <Suspense fallback={<Skeleton className="h-96 w-full" />}>
          <Login searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

async function Login({ searchParams }: Pick<PageProps<"/account/login">, "searchParams">) {
  if (!isSupabaseConfigured()) return <AccountsUnavailable />;

  const nextParam = (await searchParams).next;
  const next = safeRedirectPath(Array.isArray(nextParam) ? nextParam[0] : nextParam);
  if (await getCurrentUser()) redirect(next);

  return (
    <div className="bg-porcelain p-8 ring-1 ring-beige-200 sm:p-10">
      <p className="eyebrow text-center">Welcome back</p>
      <h1 className="mt-2 mb-8 text-center text-4xl">Sign in</h1>
      <LoginForm next={next} />
    </div>
  );
}
