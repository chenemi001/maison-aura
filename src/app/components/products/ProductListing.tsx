import { notFound } from "next/navigation";
import { ProductFilters } from "@/app/components/products/ProductFilters";
import { ProductGrid } from "@/app/components/products/ProductGrid";
import { ProductSort } from "@/app/components/products/ProductSort";
import { ButtonLink } from "@/app/components/ui/Button";
import { EmptyState } from "@/app/components/ui/EmptyState";
import { Pagination } from "@/app/components/ui/Pagination";
import { CATEGORIES } from "@/app/data/categories";
import { getProducts } from "@/app/lib/products";
import { hasActiveFilters, serializeProductQuery } from "@/app/lib/query";
import { itemListJsonLd, serializeJsonLd } from "@/app/lib/seo";
import { pluralize } from "@/app/lib/utils";
import type { ProductQuery } from "@/app/types/product";

interface ProductListingProps {
  query: ProductQuery;
  basePath: string;
  showCategoryFilter?: boolean;
}

function countActiveFilters(query: ProductQuery, includeCategory: boolean): number {
  return (
    (query.skinTypes?.length ?? 0) +
    (query.concerns?.length ?? 0) +
    (query.minPrice !== undefined || query.maxPrice !== undefined ? 1 : 0) +
    (query.inStock ? 1 : 0) +
    (includeCategory && query.category ? 1 : 0)
  );
}

/**
 * Filterable, sortable, paginated product listing shared by the catalogue,
 * category and search pages. Data comes from the cached catalogue facade, so
 * repeat visits to the same filter combination are served from cache.
 */
export async function ProductListing({ query, basePath, showCategoryFilter = false }: ProductListingProps) {
  const result = await getProducts(query);
  if (result.total > 0 && query.page > result.totalPages) notFound();

  const stateKey = serializeProductQuery(query, { includeCategory: true }).toString();
  const filtersActive = hasActiveFilters(query) || (showCategoryFilter && Boolean(query.category));
  const hrefForPage = (page: number) => {
    const search = serializeProductQuery({ ...query, page }, { includeCategory: showCategoryFilter }).toString();
    return search ? `${basePath}?${search}` : basePath;
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[14rem_1fr] lg:gap-12">
      <aside aria-label="Product filters">
        <ProductFilters
          formKey={stateKey}
          query={query}
          basePath={basePath}
          categories={showCategoryFilter ? CATEGORIES.map(({ slug, name }) => ({ slug, name })) : undefined}
          activeFilterCount={countActiveFilters(query, showCategoryFilter)}
        />
      </aside>

      <section aria-labelledby="results-count">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-beige-200 pb-4">
          <p id="results-count" className="text-sm text-taupe" role="status">
            {pluralize(result.total, "product")}
            {result.totalPages > 1 && ` · Page ${result.page} of ${result.totalPages.toLocaleString("en-NG")}`}
          </p>
          <ProductSort key={stateKey} query={query} basePath={basePath} includeCategory={showCategoryFilter} />
        </div>

        {result.items.length > 0 ? (
          <>
            <ProductGrid products={result.items} preloadCount={query.page === 1 ? 4 : 0} />
            <Pagination page={result.page} totalPages={result.totalPages} hrefForPage={hrefForPage} />
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: serializeJsonLd(
                  itemListJsonLd(result.items, (result.page - 1) * result.pageSize + 1),
                ),
              }}
            />
          </>
        ) : (
          <EmptyState
            title="Nothing matches just yet"
            description={
              filtersActive
                ? "Try removing a filter or two to see more of the collection."
                : "We couldn't find any products for this search. Try a different term."
            }
            action={
              <ButtonLink href={query.q ? `/search` : basePath} variant="outline">
                {filtersActive ? "Clear filters" : "Browse all products"}
              </ButtonLink>
            }
          />
        )}
      </section>
    </div>
  );
}
