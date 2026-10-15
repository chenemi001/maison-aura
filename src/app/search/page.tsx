import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ListingSkeleton } from "@/app/components/products/ListingSkeleton";
import { ProductListing } from "@/app/components/products/ProductListing";
import { ProductSearch } from "@/app/components/products/ProductSearch";
import { Skeleton } from "@/app/components/ui/Skeleton";
import { CATEGORIES } from "@/app/data/categories";
import { parseProductQuery } from "@/app/lib/query";
import { buildMetadata } from "@/app/lib/seo";

type Props = PageProps<"/search">;

// Internal search results are thin, near-infinite pages: keep them out of the index.
export const metadata: Metadata = buildMetadata({
  title: "Search",
  description: "Search the Maison Aura collection by product, ingredient or skin concern.",
  path: "/search",
  noIndex: true,
});

const SUGGESTIONS = ["Vitamin C", "Retinal", "Hyaluronic", "Ceramide", "Sensitive", "SPF"];

export default function SearchPage({ searchParams }: Props) {
  return (
    <div className="container-page py-10 md:py-14">
      <header className="mx-auto mb-12 max-w-2xl text-center">
        <h1 className="text-5xl md:text-6xl">Search</h1>
        <Suspense fallback={<Skeleton className="mt-8 h-14 w-full" />}>
          <SearchBox searchParams={searchParams} />
        </Suspense>
      </header>
      <Suspense fallback={<ListingSkeleton />}>
        <SearchResults searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function SearchBox({ searchParams }: Pick<Props, "searchParams">) {
  const { q } = parseProductQuery(await searchParams);
  return <ProductSearch key={q} defaultValue={q} autoFocus={!q} className="mt-8" />;
}

async function SearchResults({ searchParams }: Pick<Props, "searchParams">) {
  const query = parseProductQuery(await searchParams);

  if (!query.q) {
    return (
      <div className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">Popular searches</p>
        <ul className="mt-4 flex flex-wrap justify-center gap-2">
          {SUGGESTIONS.map((term) => (
            <li key={term}>
              <Link
                href={`/search?q=${encodeURIComponent(term)}`}
                className="inline-block border border-beige-300 px-4 py-2 text-sm hover:border-burgundy-700 hover:text-burgundy-700"
              >
                {term}
              </Link>
            </li>
          ))}
        </ul>
        <p className="eyebrow mt-12">Or browse by category</p>
        <ul className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
          {CATEGORIES.map((c) => (
            <li key={c.slug}>
              <Link href={`/categories/${c.slug}`} className="text-burgundy-700 underline-offset-4 hover:underline">
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <>
      <h2 className="sr-only">Results for “{query.q}”</h2>
      <ProductListing query={query} basePath="/search" showCategoryFilter />
    </>
  );
}
