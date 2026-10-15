import type { Metadata } from "next";
import { PolicyPage } from "@/app/components/layout/PolicyPage";
import { buildMetadata } from "@/app/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Delivery & returns",
  description: "Delivery times, costs and how to return a Maison Aura order.",
  path: "/policies/returns",
});

export default function ReturnsPage() {
  return (
    <PolicyPage title="Delivery & returns" path="/policies/returns" updated="15 October 2026">
      <h2>Delivery</h2>
      <ul>
        <li>Lagos: 1–2 working days.</li>
        <li>Abuja, Port Harcourt and other major cities: 2–3 working days.</li>
        <li>Elsewhere in Nigeria: 3–5 working days.</li>
        <li>Free delivery on orders over ₦100,000; otherwise a flat ₦3,500 nationwide fee.</li>
        <li>Orders placed before 12pm on a working day are dispatched the same day. Our courier will call you before delivery.</li>
      </ul>
      <h2>Returns</h2>
      <p>
        If you are not completely happy, you may return unopened items within 14 days of delivery for a full
        refund. For reasons of hygiene, opened products can only be returned if they are faulty.
      </p>
      <h2>Refunds</h2>
      <p>
        Refunds are issued to the original payment method within 5–7 working days of your return being
        received. You will receive an email once it has been processed.
      </p>
    </PolicyPage>
  );
}
