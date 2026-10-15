import Link from "next/link";
import { cn } from "@/app/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  /** Builds the href for a given page number. */
  hrefForPage: (page: number) => string;
}

/** Returns page numbers with `null` gaps, e.g. [1, null, 4, 5, 6, null, 20]. */
export function getPageWindow(page: number, totalPages: number, radius = 1): Array<number | null> {
  const pages = new Set<number>([1, totalPages]);
  for (let p = page - radius; p <= page + radius; p++) {
    if (p >= 1 && p <= totalPages) pages.add(p);
  }
  const sorted = Array.from(pages).sort((a, b) => a - b);
  const out: Array<number | null> = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push(sorted[i - 1] + 2 === p ? sorted[i - 1] + 1 : null);
    out.push(p);
  });
  return out;
}

const itemClass =
  "inline-flex h-10 min-w-10 items-center justify-center px-3 text-sm tabular-nums transition-colors";

/**
 * Crawlable, link-based pagination (no JavaScript required). Deep pages are
 * plain links so search engines can reach every product in large catalogues.
 */
export function Pagination({ page, totalPages, hrefForPage }: PaginationProps) {
  if (totalPages <= 1) return null;
  const window = getPageWindow(page, totalPages);

  return (
    <nav aria-label="Pagination" className="mt-16 flex items-center justify-center gap-1">
      {page > 1 ? (
        <Link href={hrefForPage(page - 1)} rel="prev" className={cn(itemClass, "hover:bg-beige-100")}>
          <span aria-hidden="true">←</span>
          <span className="ml-1 hidden sm:inline">Previous</span>
          <span className="sr-only sm:hidden">Previous page</span>
        </Link>
      ) : null}

      <ol className="flex items-center gap-1">
        {window.map((p, i) =>
          p === null ? (
            <li key={`gap-${i}`} className="px-1 text-taupe" aria-hidden="true">
              …
            </li>
          ) : (
            <li key={p}>
              <Link
                href={hrefForPage(p)}
                aria-current={p === page ? "page" : undefined}
                aria-label={`Page ${p}`}
                className={cn(
                  itemClass,
                  p === page ? "bg-ink text-porcelain" : "hover:bg-beige-100",
                )}
              >
                {p}
              </Link>
            </li>
          ),
        )}
      </ol>

      {page < totalPages ? (
        <Link href={hrefForPage(page + 1)} rel="next" className={cn(itemClass, "hover:bg-beige-100")}>
          <span className="mr-1 hidden sm:inline">Next</span>
          <span className="sr-only sm:hidden">Next page</span>
          <span aria-hidden="true">→</span>
        </Link>
      ) : null}
    </nav>
  );
}
