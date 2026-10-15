import { ORDER_STATUS_LABELS } from "@/app/lib/order-status";
import { cn } from "@/app/lib/utils";
import type { OrderStatus } from "@/app/types/order";

const TONES: Record<OrderStatus, string> = {
  pending: "bg-beige-200 text-ink",
  paid: "bg-burgundy-50 text-burgundy-700",
  fulfilled: "bg-success/10 text-success",
  failed: "bg-danger/10 text-danger",
  cancelled: "bg-beige-200 text-taupe",
  refunded: "bg-beige-200 text-taupe",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={cn("rounded-full px-3 py-1 text-xs font-medium", TONES[status])}>
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}
