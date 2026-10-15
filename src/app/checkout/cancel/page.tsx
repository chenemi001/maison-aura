import type { Metadata } from "next";
import { ButtonLink } from "@/app/components/ui/Button";
import { EmptyState } from "@/app/components/ui/EmptyState";

export const metadata: Metadata = {
  title: "Checkout cancelled",
  robots: { index: false, follow: false },
};

export default function CheckoutCancelPage() {
  return (
    <div className="container-page py-16">
      <EmptyState
        headingLevel="h1"
        title="Checkout cancelled"
        description="No payment was taken. Your bag has been saved, so you can pick up right where you left off."
        action={
          <div className="flex flex-wrap justify-center gap-3">
            <ButtonLink href="/checkout">Return to checkout</ButtonLink>
            <ButtonLink href="/products" variant="outline">
              Continue shopping
            </ButtonLink>
          </div>
        }
      />
    </div>
  );
}
