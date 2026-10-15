import { ButtonLink } from "@/app/components/ui/Button";
import { EmptyState } from "@/app/components/ui/EmptyState";

/** Shown when the deployment has no Supabase project configured. */
export function AccountsUnavailable() {
  return (
    <EmptyState
      headingLevel="h1"
      title="Accounts are coming soon"
      description="Customer accounts and order history are not enabled on this deployment. You can still browse the full collection and fill your bag."
      action={<ButtonLink href="/products">Shop the collection</ButtonLink>}
    />
  );
}
