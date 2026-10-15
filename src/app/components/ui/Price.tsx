import { formatPrice } from "@/app/lib/currency";
import { cn } from "@/app/lib/utils";

interface PriceProps {
  amountCents: number;
  compareAtCents?: number | null;
  prefix?: string;
  className?: string;
}

export function Price({ amountCents, compareAtCents, prefix, className }: PriceProps) {
  const onSale = compareAtCents != null && compareAtCents > amountCents;
  return (
    <p className={cn("flex items-baseline gap-2", className)}>
      {onSale && <span className="sr-only">Sale price:</span>}
      <span className={cn(onSale && "text-burgundy-700")} data-testid="price">
        {prefix && <span className="text-taupe">{prefix} </span>}
        {formatPrice(amountCents)}
      </span>
      {onSale && (
        <>
          <span className="sr-only">Original price:</span>
          <s className="text-sm text-taupe">{formatPrice(compareAtCents)}</s>
        </>
      )}
    </p>
  );
}
