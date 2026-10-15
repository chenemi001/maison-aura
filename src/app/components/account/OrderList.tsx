import Link from "next/link";
import { OrderStatusBadge } from "@/app/components/account/OrderStatusBadge";
import { formatPrice } from "@/app/lib/currency";
import { formatDate, pluralize } from "@/app/lib/utils";
import type { Order } from "@/app/types/order";

export function OrderList({ orders }: { orders: Order[] }) {
  return (
    <ul className="divide-y divide-beige-200 border-y border-beige-200">
      {orders.map((order) => {
        const count = order.items.reduce((n, i) => n + i.quantity, 0);
        return (
          <li key={order.id}>
            <Link
              href={`/account/orders/${order.id}`}
              className="flex flex-wrap items-center justify-between gap-4 py-5 hover:bg-beige-100/60 sm:px-2"
            >
              <div>
                <p className="font-medium">
                  Order <span className="font-mono text-sm">#{order.id.slice(0, 8).toUpperCase()}</span>
                </p>
                <p className="text-sm text-taupe">
                  {formatDate(order.createdAt)} · {pluralize(count, "item")}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <OrderStatusBadge status={order.status} />
                <span className="tabular-nums">{formatPrice(order.totalCents, order.currency)}</span>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
