export const SKIN_TYPES = ["dry", "oily", "combination", "sensitive", "normal"] as const;
export type SkinType = (typeof SKIN_TYPES)[number];

export const SKIN_CONCERNS = [
  "hydration",
  "anti-ageing",
  "brightening",
  "blemishes",
  "redness",
  "pores",
  "firmness",
] as const;
export type SkinConcern = (typeof SKIN_CONCERNS)[number];

export const SORT_OPTIONS = [
  "featured",
  "newest",
  "price-asc",
  "price-desc",
  "rating",
] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];

export type ProductBadge = "New" | "Bestseller" | "Limited";

export interface ProductVariant {
  id: string;
  label: string;
  sizeMl: number;
  priceCents: number;
}

/** The lightweight shape used by listings, cards and search results. */
export interface ProductSummary {
  id: string;
  slug: string;
  name: string;
  categorySlug: string;
  /** Lowest variant price, in minor units (pence). */
  priceCents: number;
  compareAtCents: number | null;
  rating: number;
  reviewCount: number;
  image: string;
  /** Alternate photo revealed on hover in listings. */
  hoverImage: string | null;
  /** Smallest size, used by "quick add" in listings. */
  defaultVariant: { id: string; label: string } | null;
  badge: ProductBadge | null;
  skinTypes: SkinType[];
  concerns: SkinConcern[];
  inStock: boolean;
  /** ISO-8601 date the product was added to the catalogue. */
  createdAt: string;
}

/** Full product. Listing-only conveniences are derived from it by `toSummary`. */
export interface Product extends Omit<ProductSummary, "hoverImage" | "defaultVariant"> {
  description: string;
  howToUse: string;
  ingredients: string[];
  images: string[];
  variants: ProductVariant[];
}

export interface ProductQuery {
  q?: string;
  category?: string;
  skinTypes?: SkinType[];
  concerns?: SkinConcern[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sort: SortOption;
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
