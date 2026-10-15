import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductListing } from "@/app/components/products/ProductListing";
import { ListingHero } from "@/app/components/products/ListingHero";
import { EDITORIAL } from "@/app/data/images";
import { ListingSkeleton } from "@/app/components/products/ListingSkeleton";
import { parseProductQuery } from "@/app/lib/query";
import { buildMetadata } from "@/app/lib/seo";

export async function generateMetadata({ searchParams }: PageProps<"/products">): Promise<Metadata> {
  const { page } = parseProductQuery(await searchParams);
  // Paginated pages are self-canonical; filter/sort variants consolidate to the base listing.
  return buildMetadata({
    title: page > 1 ? `All skincare — page ${page}` : "All skincare",
    description:
      "Explore the complete Maison Aura collection: serums, moisturisers, cleansers, masks and more, filtered by skin type and concern.",
    path: page > 1 ? `/products?page=${page}` : "/products",
  });
}

export default function ProductsPage({ searchParams }: PageProps<"/products">) {
  return (
    <>
      <ListingHero
        eyebrow="Shop all"
        title="The collection"
        description="Every Maison Aura formula, in one place. Refine by skin type, concern or price to find your ritual."
        image={EDITORIAL.glow}
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Shop all", path: "/products" },
        ]}
      />
      <div className="container-page py-10 md:py-14">
        <Suspense fallback={<ListingSkeleton />}>
          <Listing searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}

async function Listing({ searchParams }: Pick<PageProps<"/products">, "searchParams">) {
  const query = parseProductQuery(await searchParams);
  return <ProductListing query={query} basePath="/products" showCategoryFilter />;
}
