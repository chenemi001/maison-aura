import type { Metadata } from "next";
import { Suspense } from "react";
import { ClearCart } from "@/app/components/cart/ClearCart";
import { ButtonLink } from "@/app/components/ui/Button";
import { EmptyState } from "@/app/components/ui/EmptyState";
import { Skeleton } from "@/app/components/ui/Skeleton";
import { formatPrice } from "@/app/lib/currency";
import { updateOrderStatusBySession } from "@/app/lib/orders";
import { CHECKOUT_SESSION_ID_RE, isPaymentConfigured, retrieveCheckoutSession } from "@/app/lib/payment";
import { isAdminConfigured } from "@/app/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Order confirmation",
  robots: { index: false, follow: false },
};

export default function CheckoutSuccessPage({ searchParams }: PageProps<"/checkout/success">) {
  return (
    <div className="container-page py-16">
      <Suspense
        fallback={
          <div className="mx-auto flex max-w-lg flex-col items-center gap-4" role="status" aria-label="Confirming your payment">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        }
      >
        <Confirmation searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

/**
 * Shows a confirmation only when Stripe itself reports the session as paid.
 * The session is looked up server-side with the secret key, so the page
 * cannot be spoofed by editing the URL.
 */
async function Confirmation({ searchParams }: Pick<PageProps<"/checkout/success">, "searchParams">) {
  const raw = (await searchParams).session_id;
  const sessionId = Array.isArray(raw) ? raw[0] : raw;

  if (!isPaymentConfigured() || !sessionId || !CHECKOUT_SESSION_ID_RE.test(sessionId)) {
    return <NotFoundState />;
  }

  let session;
  try {
    session = await retrieveCheckoutSession(sessionId);
  } catch {
    return <NotFoundState />;
  }

  if (session.payment_status === "paid") {
    // Belt and braces alongside the webhook: idempotently mark the order paid.
    if (isAdminConfigured()) {
      await updateOrderStatusBySession(session.id, "paid", paymentIntentId(session.payment_intent)).catch(
        (error) => console.error("[checkout/success] order sync failed", error),
      );
    }
    // Prefer our order ID; fall back to the tail of Stripe's session ID.
    const reference = (session.client_reference_id?.slice(0, 8) ?? session.id.slice(-8)).toUpperCase();
    return (
      <div className="mx-auto max-w-xl text-center">
        <ClearCart />
        <p className="eyebrow">Order confirmed</p>
        <h1 className="mt-3 text-5xl">Thank you</h1>
        <p className="mt-4 text-taupe">
          Your payment of {formatPrice(session.amount_total ?? 0, session.currency ?? "ngn")} was successful.
          {session.customer_details?.email && <> A confirmation has been sent to {session.customer_details.email}.</>}
        </p>
        <p className="mt-6 bg-beige-100 px-4 py-3 text-sm">
          Order reference: <span className="font-mono">{reference}</span>
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/account/orders">View your orders</ButtonLink>
          <ButtonLink href="/products" variant="outline">
            Continue shopping
          </ButtonLink>
        </div>
      </div>
    );
  }

  if (session.status === "complete") {
    // e.g. bank debits: the checkout is complete but funds have not cleared yet.
    return (
      <EmptyState
        headingLevel="h1"
        title="Payment processing"
        description="Your order has been received and your payment is being processed. We'll email you as soon as it's confirmed."
        action={<ButtonLink href="/products">Continue shopping</ButtonLink>}
      />
    );
  }

  return (
    <EmptyState
      headingLevel="h1"
      title="Payment not completed"
      description="Your payment wasn't completed and you have not been charged. Your bag has been saved."
      action={<ButtonLink href="/cart">Return to your bag</ButtonLink>}
    />
  );
}

function paymentIntentId(value: string | { id: string } | null): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

function NotFoundState() {
  return (
    <EmptyState
      headingLevel="h1"
      title="We couldn't find that checkout"
      description="If you've just paid, please check your email for confirmation. Otherwise, your bag is still saved."
      action={<ButtonLink href="/cart">View your bag</ButtonLink>}
    />
  );
}
