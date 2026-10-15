import type { Metadata } from "next";
import Link from "next/link";
import { PolicyPage } from "@/app/components/layout/PolicyPage";
import { buildMetadata } from "@/app/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Terms of sale",
  description: "The terms that apply when you purchase from Maison Aura.",
  path: "/policies/terms",
});

export default function TermsPage() {
  return (
    <PolicyPage title="Terms of sale" path="/policies/terms" updated="15 October 2026">
      <p>
        These terms apply to orders placed on this website. By placing an order you agree to them. This store
        is a portfolio demonstration and is not currently trading.
      </p>
      <h2>Prices and payment</h2>
      <p>
        All prices are shown in Nigerian Naira (₦) and include 7.5% VAT. Prices are confirmed on our servers at
        the moment you check out; payment is taken securely by our payment provider. Your order is confirmed
        only once payment has been successfully authorised.
      </p>
      <h2>Delivery</h2>
      <p>
        We deliver to all 36 states and the FCT. Delivery is free on orders of ₦100,000 or more; otherwise a
        flat ₦3,500 nationwide delivery fee applies.
      </p>
      <h2>Cancellations and returns</h2>
      <p>
        In line with the Federal Competition and Consumer Protection Act 2018, you may return unopened items
        within 14 days of delivery. See our <Link href="/policies/returns">delivery and returns policy</Link> for
        details.
      </p>
      <h2>Product information</h2>
      <p>
        Our products are cosmetics and are not intended to diagnose, treat or prevent any medical condition.
        Always patch test new skincare and read the packaging before use.
      </p>
    </PolicyPage>
  );
}
