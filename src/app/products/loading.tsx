import { ListingSkeleton } from "@/app/components/products/ListingSkeleton";
import { Skeleton } from "@/app/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="container-page py-10 md:py-14">
      <Skeleton className="h-3 w-40" />
      <Skeleton className="mt-6 mb-10 h-14 w-80 max-w-full" />
      <ListingSkeleton />
    </div>
  );
}
