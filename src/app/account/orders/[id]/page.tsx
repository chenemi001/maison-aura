import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { OrderStatusBadge } from "@/app/components/account/OrderStatusBadge";
import { Breadcrumbs } from "@/app/components/ui/Breadcrumbs";
import { Skeleton } from "@/app/components/ui/Skeleton";
import { requireUser } from "@/app/lib/auth";
import { formatPrice } from "@/app/lib/currency";
import { getOrderForUser } from "@/app/lib/orders";
import { SHIPPING_COUNTRIES } from "@/app/lib/shipping";
import { formatDate } from "@/app/lib/utils";

export const metadata: Metadata = {
  title: "Order details",
  robots: { index: false, follow: false },
};

type Props = PageProps<"/account/orders/[id]">;

export default function OrderDetailPage({ params }: Props) {
  return (
    <div className="container-page py-10 md:py-14">
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <OrderDetail params={params} />
      </Suspense>
    </div>
  );
}

async function OrderDetail({ params }: Pick<Props, "params">) {
  const { id } = await params;
  const user = await requireUser(`/account/orders/${id}`);
  const order = await getOrderForUser(user.id, id);
  if (!order) notFound();

  const reference = order.id.slice(0, 8).toUpperCase();
  const address = order.shippingAddress;
  const country = SHIPPING_COUNTRIES.find((c) => c.code === address?.country)?.name ?? address?.country;

  return (
    <>
      <Breadcrumbs
        items={[
          { name: "Account", path: "/account" },
          { name: "Orders", path: "/account/orders" },
          { name: `#${reference}`, path: `/account/orders/${order.id}` },
        ]}
      />
      <header className="mt-6 mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-5xl">Order #{reference}</h1>
          <p className="mt-2 text-taupe">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </header>

      <div className="grid gap-12 lg:grid-cols-[1fr_22rem]">
        <section aria-labelledby="items-heading">
          <h2 id="items-heading" className="sr-only">
            Items
          </h2>
          <ul className="divide-y divide-beige-200 border-y border-beige-200">
            {order.items.map((item) => (
              <li key={`${item.productId}-${item.variantLabel}`} className="flex items-center gap-5 py-5">
                <div className="relative aspect-[4/5] w-20 shrink-0 overflow-hidden bg-beige-100">
                  <Image src={item.image} alt="" fill sizes="80px" className="object-cover" />
                </div>
                <div className="flex-1">
                  <Link href={`/products/${item.productSlug}`} className="font-serif text-lg hover:text-burgundy-700">
                    {item.name}
                  </Link>
                  <p className="text-sm text-taupe">
                    {item.variantLabel} · Qty {item.quantity}
                  </p>
                </div>
                <p className="tabular-nums">{formatPrice(item.unitPriceCents * item.quantity, order.currency)}</p>
              </li>
            ))}
          </ul>
        </section>

        <aside className="space-y-8">
          <dl className="space-y-3 bg-porcelain p-6 text-sm ring-1 ring-beige-200">
            <div className="flex justify-between">
              <dt className="text-taupe">Subtotal</dt>
              <dd className="tabular-nums">{formatPrice(order.subtotalCents, order.currency)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-taupe">Delivery</dt>
              <dd className="tabular-nums">
                {order.shippingCents === 0 ? "Complimentary" : formatPrice(order.shippingCents, order.currency)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-beige-200 pt-3 text-base font-medium">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatPrice(order.totalCents, order.currency)}</dd>
            </div>
          </dl>
          {address && (
            <div className="text-sm">
              <h2 className="eyebrow font-sans">Delivery address</h2>
              <address className="mt-3 leading-relaxed not-italic">
                {address.fullName}
                <br />
                {address.line1}
                {address.line2 && (
                  <>
                    <br />
                    {address.line2}
                  </>
                )}
                <br />
                {address.city}, {address.state} {address.postcode}
                <br />
                {country}
              </address>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
