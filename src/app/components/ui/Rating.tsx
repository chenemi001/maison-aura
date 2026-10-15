import { cn } from "@/app/lib/utils";

interface RatingProps {
  value: number;
  count?: number;
  className?: string;
  size?: "sm" | "md";
}

const STAR = "M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9L10 1.5z";

export function Rating({ value, count, className, size = "sm" }: RatingProps) {
  const pct = Math.max(0, Math.min(100, (value / 5) * 100));
  const label = `Rated ${value.toFixed(1)} out of 5${count !== undefined ? ` from ${count.toLocaleString("en-NG")} reviews` : ""}`;
  const starSize = size === "sm" ? "size-3.5" : "size-4.5";

  return (
    <div className={cn("flex items-center gap-1.5 text-xs text-taupe", className)}>
      <span role="img" aria-label={label} className="relative inline-flex">
        <span className="flex text-beige-300" aria-hidden="true">
          {Array.from({ length: 5 }, (_, i) => (
            <svg key={i} viewBox="0 0 20 20" className={starSize} fill="currentColor">
              <path d={STAR} />
            </svg>
          ))}
        </span>
        <span
          className="absolute left-0 top-0 flex h-full overflow-hidden text-gold"
          style={{ width: `${pct}%` }}
          aria-hidden="true"
        >
          {Array.from({ length: 5 }, (_, i) => (
            <svg key={i} viewBox="0 0 20 20" className={cn(starSize, "shrink-0")} fill="currentColor">
              <path d={STAR} />
            </svg>
          ))}
        </span>
      </span>
      {count !== undefined && <span aria-hidden="true">({count.toLocaleString("en-NG")})</span>}
    </div>
  );
}
