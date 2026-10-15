import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { signOut } from "@/app/actions/auth";
import { AccountsUnavailable } from "@/app/components/account/AccountsUnavailable";
import { OrderList } from "@/app/components/account/OrderList";
import { Button, ButtonLink } from "@/app/components/ui/Button";
import { EmptyState } from "@/app/components/ui/EmptyState";
import { Skeleton } from "@/app/components/ui/Skeleton";
import { requireUser } from "@/app/lib/auth";
import { isSupabaseConfigured } from "@/app/lib/env";
import { getOrdersForUser } from "@/app/lib/orders";

export const metadata: Metadata = {
  title: "My account",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return (
    <div className="container-page py-10 md:py-14">
      <Suspense fallback={<AccountSkeleton />}>
        <AccountOverview />
      </Suspense>
    </div>
  );
}

async function AccountOverview() {
  if (!isSupabaseConfigured()) return <AccountsUnavailable />;
  const user = await requireUser("/account");
  const orders = await getOrdersForUser(user.id);

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow">My account</p>
          <h1 className="mt-2 text-5xl">Welcome{user.fullName ? `, ${user.fullName.split(" ")[0]}` : ""}</h1>
          <p className="mt-2 text-taupe">{user.email}</p>
        </div>
        <form action={signOut}>
          <Button type="submit" variant="outline">
            Sign out
          </Button>
        </form>
      </header>

      <section aria-labelledby="recent-orders" className="mt-14">
        <div className="mb-6 flex items-center justify-between">
          <h2 id="recent-orders" className="text-3xl">
            Recent orders
          </h2>
          {orders.length > 3 && (
            <Link href="/account/orders" className="text-sm text-burgundy-700 underline underline-offset-4">
              View all orders
            </Link>
          )}
        </div>
        {orders.length > 0 ? (
          <OrderList orders={orders.slice(0, 3)} />
        ) : (
          <EmptyState
            title="No orders yet"
            description="When you place an order, it will appear here."
            action={<ButtonLink href="/products">Start shopping</ButtonLink>}
          />
        )}
      </section>
    </>
  );
}

function AccountSkeleton() {
  return (
    <div role="status" aria-label="Loading your account" className="space-y-4">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-12 w-72" />
      <Skeleton className="h-4 w-48" />
      <Skeleton className="mt-14 h-40 w-full" />
    </div>
  );
}
