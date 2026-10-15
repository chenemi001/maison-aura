import { ProductGridSkeleton, Skeleton } from "@/app/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="container-page py-12">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="mt-4 h-12 w-2/3 max-w-lg" />
      <div className="mt-12">
        <ProductGridSkeleton />
      </div>
    </div>
  );
}
