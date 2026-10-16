import type { Metadata } from "next";
import { Suspense } from "react";
import { OrderList } from "@/app/components/account/OrderList";
import { Breadcrumbs } from "@/app/components/ui/Breadcrumbs";
import { ButtonLink } from "@/app/components/ui/Button";
import { EmptyState } from "@/app/components/ui/EmptyState";
import { Skeleton } from "@/app/components/ui/Skeleton";
import { requireUser } from "@/app/lib/auth";
import { getOrdersForUser } from "@/app/lib/orders";

export const metadata: Metadata = {
  title: "Your orders",
  robots: { index: false, follow: false },
};

export default function OrdersPage() {
  return (
    <div className="container-page py-10 md:py-14">
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <Orders />
      </Suspense>
    </div>
  );
}

async function Orders() {
  const user = await requireUser("/account/orders");
  const orders = await getOrdersForUser(user.id);

  return (
    <>
      <Breadcrumbs
        items={[
          { name: "Account", path: "/account" },
          { name: "Orders", path: "/account/orders" },
        ]}
      />
      <h1 className="mt-6 mb-10 text-5xl">Your orders</h1>
      {orders.length > 0 ? (
        <OrderList orders={orders} />
      ) : (
        <EmptyState
          title="No orders yet"
          description="Orders you place while signed in will appear here."
          action={<ButtonLink href="/products">Start shopping</ButtonLink>}
        />
      )}
    </>
  );
}
