import { ListingSkeleton } from "@/app/components/products/ListingSkeleton";
import { Skeleton } from "@/app/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="container-page py-10 md:py-14">
      <Skeleton className="h-3 w-48" />
      <Skeleton className="mt-6 h-3 w-32" />
      <Skeleton className="mt-3 mb-10 h-14 w-72 max-w-full" />
      <ListingSkeleton />
    </div>
  );
}
