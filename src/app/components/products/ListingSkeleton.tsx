import { ProductGridSkeleton, Skeleton } from "@/app/components/ui/Skeleton";

/** Placeholder matching the filters + grid layout of `ProductListing` (prevents layout shift). */
export function ListingSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[14rem_1fr] lg:gap-12">
      <div className="hidden space-y-6 lg:block" aria-hidden="true">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
      <Skeleton className="h-11 lg:hidden" />
      <div>
        <div className="mb-8 flex items-center justify-between border-b border-beige-200 pb-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-48" />
        </div>
        <ProductGridSkeleton />
      </div>
    </div>
  );
}
