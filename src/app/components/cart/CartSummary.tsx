import type { ReactNode } from "react";
import { LockIcon } from "@/app/components/ui/Icons";
import { formatPrice } from "@/app/lib/currency";
import { FREE_SHIPPING_THRESHOLD_CENTS } from "@/app/lib/pricing";
import type { CartTotals } from "@/app/types/cart";

interface CartSummaryProps {
  totals: CartTotals;
  action?: ReactNode;
  title?: string;
}

export function CartSummary({ totals, action, title = "Order summary" }: CartSummaryProps) {
  const progress = Math.min(100, (totals.subtotalCents / FREE_SHIPPING_THRESHOLD_CENTS) * 100);

  return (
    <section aria-labelledby="summary-heading" className="bg-porcelain p-6 shadow-[0_1px_0_rgba(43,33,29,0.06)] ring-1 ring-beige-200 sm:p-8">
      <h2 id="summary-heading" className="text-2xl">
        {title}
      </h2>

      {totals.subtotalCents > 0 && (
        <div className="mt-5">
          <p className="text-sm text-taupe">
            {totals.freeShippingRemainingCents > 0
              ? `You're ${formatPrice(totals.freeShippingRemainingCents)} away from complimentary delivery.`
              : "You've unlocked complimentary delivery."}
          </p>
          <div
            className="mt-2 h-1 overflow-hidden rounded-full bg-beige-200"
            role="progressbar"
            aria-label="Progress towards complimentary delivery"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
          >
            <div className="h-full rounded-full bg-burgundy-700 transition-[width] duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <dl className="mt-6 space-y-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-taupe">Subtotal</dt>
          <dd className="tabular-nums">{formatPrice(totals.subtotalCents)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-taupe">Delivery</dt>
          <dd className="tabular-nums">
            {totals.shippingCents === 0 ? "Complimentary" : formatPrice(totals.shippingCents)}
          </dd>
        </div>
        <div className="flex justify-between border-t border-beige-200 pt-4 text-base font-medium">
          <dt>Total</dt>
          <dd className="tabular-nums" data-testid="cart-total">
            {formatPrice(totals.totalCents)}
          </dd>
        </div>
      </dl>
      <p className="mt-1 text-xs text-taupe">Prices include 7.5% VAT.</p>

      {action && <div className="mt-6">{action}</div>}

      <p className="mt-4 flex items-center justify-center gap-2 text-xs text-taupe">
        <LockIcon className="size-3.5" />
        Secure checkout powered by Stripe
      </p>
    </section>
  );
}
