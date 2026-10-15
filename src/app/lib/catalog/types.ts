import type {
  PaginatedResult,
  Product,
  ProductQuery,
  ProductSummary,
} from "@/app/types/product";

export interface SitemapProduct {
  slug: string;
  updatedAt: string;
}

/**
 * Storage-agnostic catalogue contract. The storefront depends only on this
 * interface, so swapping the in-memory demo catalogue for Supabase (or any
 * other backend) requires no UI changes.
 */
export interface CatalogRepository {
  listProducts(query: ProductQuery): Promise<PaginatedResult<ProductSummary>>;
  getProductBySlug(slug: string): Promise<Product | null>;
  getProductsByIds(ids: string[]): Promise<Product[]>;
  getFeaturedProducts(limit: number): Promise<ProductSummary[]>;
  getRelatedProducts(product: Product, limit: number): Promise<ProductSummary[]>;
  countProducts(): Promise<number>;
  listSitemapProducts(offset: number, limit: number): Promise<SitemapProduct[]>;
}

export function toSummary(p: Product): ProductSummary {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    categorySlug: p.categorySlug,
    priceCents: p.priceCents,
    compareAtCents: p.compareAtCents,
    rating: p.rating,
    reviewCount: p.reviewCount,
    image: p.image,
    hoverImage: p.images.find((src) => src !== p.image) ?? null,
    defaultVariant: p.variants[0] ? { id: p.variants[0].id, label: p.variants[0].label } : null,
    badge: p.badge,
    skinTypes: p.skinTypes,
    concerns: p.concerns,
    inStock: p.inStock,
    createdAt: p.createdAt,
  };
}

/**
 * Popularity score used for the default "featured" ordering. Shared by the
 * demo catalogue and the Supabase seeder so both orderings match.
 */
export function popularityScore(p: Pick<Product, "rating" | "reviewCount">, isCurated: boolean) {
  const base = p.rating * Math.log10(p.reviewCount + 10);
  return Math.round((isCurated ? 1000 + base : base) * 1000);
}

export function paginate<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number,
): PaginatedResult<T> {
  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}
