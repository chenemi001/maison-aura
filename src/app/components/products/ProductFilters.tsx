"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState, useTransition, type FormEvent, type ReactNode } from "react";
import {
  CONCERN_LABELS,
  PRICE_RANGES,
  SKIN_TYPE_LABELS,
  priceRangeValue,
} from "@/app/components/products/filter-options";
import { FilterIcon } from "@/app/components/ui/Icons";
import { cn } from "@/app/lib/utils";
import { parseProductQuery, serializeProductQuery } from "@/app/lib/query";
import type { ProductQuery } from "@/app/types/product";

interface ProductFiltersProps {
  query: ProductQuery;
  /** Path the filters submit to, e.g. `/products` or `/categories/serums`. */
  basePath: string;
  categories?: Array<{ slug: string; name: string }>;
  activeFilterCount: number;
  /**
   * Changes whenever the applied query changes. Used as the form's `key` so
   * uncontrolled inputs reset to the URL state (e.g. after "Clear all") while
   * the mobile drawer's open state is preserved.
   */
  formKey: string;
}

/**
 * Faceted filters.
 *
 * Progressive enhancement: this is a plain `GET` form, so filtering works with
 * JavaScript disabled. When JavaScript is available, each change is applied
 * immediately via a client-side transition that keeps the page interactive.
 */
export function ProductFilters({ query, basePath, categories, activeFilterCount, formKey }: ProductFiltersProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [mobileOpen, setMobileOpen] = useState(false);
  const panelId = useId();

  const apply = (form: HTMLFormElement) => {
    const data = new FormData(form);
    const raw: Record<string, string | string[]> = {};
    for (const key of new Set(data.keys())) raw[key] = data.getAll(key).map(String);
    const next = parseProductQuery(raw);
    const params = serializeProductQuery({ ...next, page: 1 }, { includeCategory: Boolean(categories) });
    const search = params.toString();
    startTransition(() => {
      router.push(search ? `${basePath}?${search}` : basePath, { scroll: false });
    });
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    apply(event.currentTarget);
  };

  const priceValue =
    query.minPrice !== undefined || query.maxPrice !== undefined
      ? priceRangeValue({
          min: query.minPrice !== undefined ? query.minPrice / 100 : undefined,
          max: query.maxPrice !== undefined ? query.maxPrice / 100 : undefined,
        })
      : "";

  const clearHref = query.q ? `${basePath}?q=${encodeURIComponent(query.q)}` : basePath;

  return (
    <div>
      <button
        type="button"
        className="flex h-11 w-full items-center justify-center gap-2 border border-beige-300 text-sm lg:hidden"
        aria-expanded={mobileOpen}
        aria-controls={panelId}
        onClick={() => setMobileOpen((open) => !open)}
      >
        <FilterIcon className="size-4" />
        Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
      </button>

      <form
        key={formKey}
        id={panelId}
        method="get"
        action={basePath}
        onChange={(event) => apply(event.currentTarget)}
        onSubmit={onSubmit}
        aria-label="Filter products"
        aria-busy={isPending}
        className={cn("mt-6 space-y-8 lg:mt-0 lg:block", mobileOpen ? "block" : "hidden")}
      >
        {query.q && <input type="hidden" name="q" value={query.q} />}
        {query.sort !== "featured" && <input type="hidden" name="sort" value={query.sort} />}

        <div className="flex items-center justify-between">
          <h2 className="eyebrow font-sans">Refine</h2>
          <span aria-live="polite" className="text-xs text-taupe">
            {isPending ? "Updating…" : ""}
          </span>
        </div>

        {categories && (
          <FilterGroup legend="Category">
            <Choice type="radio" name="category" value="" label="All categories" defaultChecked={!query.category} />
            {categories.map((c) => (
              <Choice
                key={c.slug}
                type="radio"
                name="category"
                value={c.slug}
                label={c.name}
                defaultChecked={query.category === c.slug}
              />
            ))}
          </FilterGroup>
        )}

        <FilterGroup legend="Skin type">
          {Object.entries(SKIN_TYPE_LABELS).map(([value, label]) => (
            <Choice
              key={value}
              type="checkbox"
              name="skin"
              value={value}
              label={label}
              defaultChecked={query.skinTypes?.includes(value as never)}
            />
          ))}
        </FilterGroup>

        <FilterGroup legend="Concern">
          {Object.entries(CONCERN_LABELS).map(([value, label]) => (
            <Choice
              key={value}
              type="checkbox"
              name="concern"
              value={value}
              label={label}
              defaultChecked={query.concerns?.includes(value as never)}
            />
          ))}
        </FilterGroup>

        <FilterGroup legend="Price">
          <Choice type="radio" name="price" value="" label="Any price" defaultChecked={!priceValue} />
          {PRICE_RANGES.map((range) => (
            <Choice
              key={range.label}
              type="radio"
              name="price"
              value={priceRangeValue(range)}
              label={range.label}
              defaultChecked={priceValue === priceRangeValue(range)}
            />
          ))}
        </FilterGroup>

        <FilterGroup legend="Availability">
          <Choice type="checkbox" name="instock" value="1" label="In stock only" defaultChecked={query.inStock} />
        </FilterGroup>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            className="h-10 bg-burgundy-700 px-5 text-sm text-porcelain hover:bg-burgundy-800 lg:sr-only lg:focus:not-sr-only"
          >
            Apply filters
          </button>
          {activeFilterCount > 0 && (
            <Link href={clearHref} className="text-sm text-burgundy-700 underline underline-offset-4">
              Clear all
            </Link>
          )}
        </div>
      </form>
    </div>
  );
}

function FilterGroup({ legend, children }: { legend: string; children: ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-3 font-serif text-lg text-ink">{legend}</legend>
      <div className="space-y-2">{children}</div>
    </fieldset>
  );
}

function Choice({
  type,
  name,
  value,
  label,
  defaultChecked,
}: {
  type: "checkbox" | "radio";
  name: string;
  value: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm text-ink hover:text-burgundy-700">
      <input
        type={type}
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        className="size-4 accent-burgundy-700"
      />
      {label}
    </label>
  );
}
