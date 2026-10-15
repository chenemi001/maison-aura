"use client";

import { useActionState } from "react";
import { startCheckout, type CheckoutFormState } from "@/app/actions/checkout";
import { OrderSummary } from "@/app/components/checkout/OrderSummary";
import { ShippingForm } from "@/app/components/checkout/ShippingForm";
import { Button, ButtonLink } from "@/app/components/ui/Button";
import { EmptyState } from "@/app/components/ui/EmptyState";
import { ErrorMessage } from "@/app/components/ui/ErrorMessage";
import { LockIcon } from "@/app/components/ui/Icons";
import { ProductGridSkeleton } from "@/app/components/ui/Skeleton";
import { useCart } from "@/app/hooks/use-cart";
import { useHydrated } from "@/app/hooks/use-hydrated";

interface CheckoutFormProps {
  paymentsEnabled: boolean;
}

export function CheckoutForm({ paymentsEnabled }: CheckoutFormProps) {
  const { items, totals } = useCart();
  const hydrated = useHydrated();
  const [state, formAction, pending] = useActionState<CheckoutFormState, FormData>(startCheckout, {});

  if (!hydrated) return <ProductGridSkeleton count={2} />;

  if (items.length === 0) {
    return (
      <EmptyState
        title="Your bag is empty"
        description="Add something you love before checking out."
        action={<ButtonLink href="/products">Explore the collection</ButtonLink>}
      />
    );
  }

  // Only identifiers and quantities are sent; the server prices the order.
  const cartPayload = JSON.stringify(
    items.map(({ productId, variantId, quantity }) => ({ productId, variantId, quantity })),
  );

  return (
    <form action={formAction} noValidate className="grid items-start gap-12 lg:grid-cols-[1fr_26rem] lg:gap-16">
      <div className="space-y-8">
        {!paymentsEnabled && (
          <ErrorMessage tone="info" title="Payments are not enabled on this deployment">
            This store is running without a payment provider configured, so orders cannot be placed and
            no card will be charged. Add Stripe keys (see README) to enable real checkout.
          </ErrorMessage>
        )}
        {state.message && (
          <ErrorMessage title="We couldn't start your checkout">{state.message}</ErrorMessage>
        )}

        <input type="hidden" name="cart" value={cartPayload} />
        <ShippingForm values={state.values} errors={state.fieldErrors} disabled={pending} />

        <div className="space-y-3">
          <Button
            type="submit"
            size="lg"
            className="w-full"
            loading={pending}
            disabled={!paymentsEnabled}
            data-testid="pay-button"
          >
            <LockIcon className="size-4" />
            {pending ? "Redirecting to secure payment…" : "Continue to secure payment"}
          </Button>
          <p className="text-center text-xs text-taupe">
            You&apos;ll be redirected to Stripe to pay. Card details never touch our servers.
          </p>
        </div>
      </div>

      <aside className="lg:sticky lg:top-28" aria-label="Order summary">
        <OrderSummary items={items} totals={totals} />
      </aside>
    </form>
  );
}
