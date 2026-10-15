import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ListingSkeleton } from "@/app/components/products/ListingSkeleton";
import { ProductListing } from "@/app/components/products/ProductListing";
import { ListingHero } from "@/app/components/products/ListingHero";
import { Skeleton } from "@/app/components/ui/Skeleton";
import { getCategories, getCategory } from "@/app/lib/products";
import { parseProductQuery } from "@/app/lib/query";
import { buildMetadata } from "@/app/lib/seo";

type Props = PageProps<"/categories/[slug]">;

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) notFound();
  const { page } = parseProductQuery(await searchParams);
  const path = `/categories/${slug}`;
  return buildMetadata({
    title: page > 1 ? `${category.name} — page ${page}` : category.name,
    description: category.description,
    path: page > 1 ? `${path}?page=${page}` : path,
    image: category.image,
  });
}

export default function CategoryPage({ params, searchParams }: Props) {
  return (
    <>
      <Suspense fallback={<HeaderSkeleton />}>
        <CategoryHeader params={params} />
      </Suspense>
      <div className="container-page py-10 md:py-14">
        <Suspense fallback={<ListingSkeleton />}>
          <CategoryListing params={params} searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}

async function CategoryHeader({ params }: Pick<Props, "params">) {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) notFound();

  return (
    <ListingHero
      eyebrow={category.tagline}
      title={category.name}
      description={category.description}
      image={category.image}
      crumbs={[
        { name: "Home", path: "/" },
        { name: "Shop all", path: "/products" },
        { name: category.name, path: `/categories/${category.slug}` },
      ]}
    />
  );
}

async function CategoryListing({ params, searchParams }: Props) {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) notFound();
  const query = parseProductQuery(await searchParams, { category: category.slug });
  return <ProductListing query={query} basePath={`/categories/${category.slug}`} />;
}

function HeaderSkeleton() {
  return (
    <div className="container-page py-16">
      <Skeleton className="h-3 w-48" />
      <Skeleton className="mt-6 h-3 w-32" />
      <Skeleton className="mt-3 h-14 w-72 max-w-full" />
      <Skeleton className="mt-4 h-4 w-full max-w-xl" />
    </div>
  );
}
