"use client";

import { useRouter } from "next/navigation";
import { useId, useTransition } from "react";
import { SORT_LABELS } from "@/app/components/products/filter-options";
import { serializeProductQuery } from "@/app/lib/query";
import { SORT_OPTIONS, type ProductQuery, type SortOption } from "@/app/types/product";

interface ProductSortProps {
  query: ProductQuery;
  basePath: string;
  includeCategory?: boolean;
}

/** Sort control. A `GET` form with a `<noscript>` submit keeps it usable without JS. */
export function ProductSort({ query, basePath, includeCategory = false }: ProductSortProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const id = useId();

  // Preserve every active filter except sort and page.
  const preserved = serializeProductQuery({ ...query, sort: "featured", page: 1 }, { includeCategory });

  const onChange = (sort: SortOption) => {
    const params = serializeProductQuery({ ...query, sort, page: 1 }, { includeCategory });
    const search = params.toString();
    startTransition(() => router.push(search ? `${basePath}?${search}` : basePath, { scroll: false }));
  };

  return (
    <form method="get" action={basePath} className="flex items-center gap-2" aria-busy={isPending}>
      {Array.from(preserved.entries()).map(([key, value]) => (
        <input key={key} type="hidden" name={key} value={value} />
      ))}
      <label htmlFor={id} className="text-sm whitespace-nowrap text-taupe">
        Sort by
      </label>
      <select
        id={id}
        name="sort"
        defaultValue={query.sort}
        onChange={(event) => onChange(event.target.value as SortOption)}
        className="h-10 border border-beige-300 bg-porcelain pr-8 pl-4 text-sm text-ink focus:border-burgundy-700"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {SORT_LABELS[option]}
          </option>
        ))}
      </select>
      <noscript>
        <button type="submit" className="h-10 border border-beige-300 px-4 text-sm">
          Apply
        </button>
      </noscript>
    </form>
  );
}
