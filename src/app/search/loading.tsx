import { ListingSkeleton } from "@/app/components/products/ListingSkeleton";
import { Skeleton } from "@/app/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="container-page py-10 md:py-14">
      <div className="mx-auto mb-12 flex max-w-2xl flex-col items-center">
        <Skeleton className="h-14 w-48" />
        <Skeleton className="mt-8 h-14 w-full" />
      </div>
      <ListingSkeleton />
    </div>
  );
}
