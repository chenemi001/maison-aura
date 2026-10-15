import type { Metadata } from "next";
import Link from "next/link";
import { CheckoutForm } from "@/app/components/checkout/CheckoutForm";
import { isPaymentConfigured } from "@/app/lib/payment";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <div className="container-page py-10 md:py-14">
      <nav aria-label="Checkout progress" className="text-xs text-taupe">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/cart" className="hover:text-burgundy-700 hover:underline">
              Bag
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="step" className="text-ink">
            Details
          </li>
          <li aria-hidden="true">/</li>
          <li>Payment</li>
        </ol>
      </nav>
      <h1 className="mt-6 mb-10 text-5xl md:text-6xl">Checkout</h1>
      <CheckoutForm paymentsEnabled={isPaymentConfigured()} />
    </div>
  );
}
