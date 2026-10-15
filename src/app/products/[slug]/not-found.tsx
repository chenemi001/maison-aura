import { ButtonLink } from "@/app/components/ui/Button";
import { EmptyState } from "@/app/components/ui/EmptyState";

export default function ProductNotFound() {
  return (
    <div className="container-page py-16">
      <EmptyState
        headingLevel="h1"
        title="This product is no longer available"
        description="It may have been discontinued or the link may be incorrect. Discover similar formulas in our collection."
        action={<ButtonLink href="/products">Browse all products</ButtonLink>}
      />
    </div>
  );
}
