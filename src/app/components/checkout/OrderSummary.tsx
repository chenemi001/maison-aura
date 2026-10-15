import Image from "next/image";
import { CartSummary } from "@/app/components/cart/CartSummary";
import { formatPrice } from "@/app/lib/currency";
import type { CartItem, CartTotals } from "@/app/types/cart";

interface OrderSummaryProps {
  items: CartItem[];
  totals: CartTotals;
}

export function OrderSummary({ items, totals }: OrderSummaryProps) {
  return (
    <div className="space-y-6">
      <ul className="space-y-4" aria-label="Items in your order">
        {items.map((item) => (
          <li key={item.variantId} className="flex items-center gap-4">
            <div className="relative aspect-[4/5] w-16 shrink-0 overflow-hidden bg-beige-100">
              <Image src={item.image} alt="" fill sizes="64px" className="object-cover" />
              <span className="absolute -top-0 -right-0 flex size-5 items-center justify-center bg-ink text-[10px] text-porcelain">
                <span className="sr-only">Quantity </span>
                {item.quantity}
              </span>
            </div>
            <div className="flex-1 text-sm">
              <p className="font-medium">{item.name}</p>
              <p className="text-taupe">{item.variantLabel}</p>
            </div>
            <p className="text-sm tabular-nums">{formatPrice(item.unitPriceCents * item.quantity)}</p>
          </li>
        ))}
      </ul>
      <CartSummary totals={totals} title="Your order" />
    </div>
  );
}
