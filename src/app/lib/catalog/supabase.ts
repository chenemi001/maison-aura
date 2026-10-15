import "server-only";
import { createPublicClient } from "@/app/lib/supabase/server";
import { paginate, type CatalogRepository } from "@/app/lib/catalog/types";
import type {
  Product,
  ProductBadge,
  ProductSummary,
  ProductVariant,
  SkinConcern,
  SkinType,
  SortOption,
} from "@/app/types/product";

/** Row shape of `public.products` (see supabase/migrations). */
interface ProductRow {
  id: string;
  slug: string;
  name: string;
  category_slug: string;
  price_cents: number;
  compare_at_cents: number | null;
  rating: number;
  review_count: number;
  image: string;
  badge: ProductBadge | null;
  skin_types: SkinType[];
  concerns: SkinConcern[];
  in_stock: boolean;
  created_at: string;
  description?: string;
  how_to_use?: string;
  ingredients?: string[];
  images?: string[];
  variants?: ProductVariant[];
}

const SUMMARY_COLUMNS =
  "id,slug,name,category_slug,price_cents,compare_at_cents,rating,review_count,image,images,variants,badge,skin_types,concerns,in_stock,created_at";
const DETAIL_COLUMNS = `${SUMMARY_COLUMNS},description,how_to_use,ingredients`;

function mapSummary(row: ProductRow): ProductSummary {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    categorySlug: row.category_slug,
    priceCents: row.price_cents,
    compareAtCents: row.compare_at_cents,
    rating: Number(row.rating),
    reviewCount: row.review_count,
    image: row.image,
    hoverImage: row.images?.find((src) => src !== row.image) ?? null,
    defaultVariant: row.variants?.[0] ? { id: row.variants[0].id, label: row.variants[0].label } : null,
    badge: row.badge,
    skinTypes: row.skin_types ?? [],
    concerns: row.concerns ?? [],
    inStock: row.in_stock,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

function mapProduct(row: ProductRow): Product {
  return {
    ...mapSummary(row),
    description: row.description ?? "",
    howToUse: row.how_to_use ?? "",
    ingredients: row.ingredients ?? [],
    images: row.images?.length ? row.images : [row.image],
    variants: row.variants ?? [],
  };
}

const ORDERING: Record<SortOption, Array<[column: string, ascending: boolean]>> = {
  featured: [["popularity", false]],
  newest: [["created_at", false]],
  "price-asc": [["price_cents", true]],
  "price-desc": [["price_cents", false]],
  rating: [["rating", false], ["review_count", false]],
};

function fail(context: string, error: { message: string }): never {
  throw new Error(`Supabase catalogue error (${context}): ${error.message}`);
}

export const supabaseCatalog: CatalogRepository = {
  async listProducts(query) {
    const supabase = createPublicClient();
    let request = supabase.from("products").select(SUMMARY_COLUMNS, { count: "exact" });

    if (query.category) request = request.eq("category_slug", query.category);
    if (query.inStock) request = request.eq("in_stock", true);
    if (query.minPrice !== undefined) request = request.gte("price_cents", query.minPrice);
    if (query.maxPrice !== undefined) request = request.lte("price_cents", query.maxPrice);
    if (query.skinTypes?.length) request = request.overlaps("skin_types", query.skinTypes);
    if (query.concerns?.length) request = request.overlaps("concerns", query.concerns);
    if (query.q) {
      request = request.textSearch("search", query.q, { type: "websearch", config: "english" });
    }
    for (const [column, ascending] of ORDERING[query.sort]) {
      request = request.order(column, { ascending });
    }
    request = request.order("id", { ascending: true }); // stable pagination

    const from = (query.page - 1) * query.pageSize;
    const { data, count, error } = await request.range(from, from + query.pageSize - 1);
    // PostgREST returns 416 when the offset is beyond the result set.
    if (error && error.code !== "PGRST103") fail("listProducts", error);
    return paginate(
      ((data ?? []) as ProductRow[]).map(mapSummary),
      count ?? 0,
      query.page,
      query.pageSize,
    );
  },

  async getProductBySlug(slug) {
    const { data, error } = await createPublicClient()
      .from("products")
      .select(DETAIL_COLUMNS)
      .eq("slug", slug)
      .maybeSingle();
    if (error) fail("getProductBySlug", error);
    return data ? mapProduct(data as ProductRow) : null;
  },

  async getProductsByIds(ids) {
    if (ids.length === 0) return [];
    const { data, error } = await createPublicClient()
      .from("products")
      .select(DETAIL_COLUMNS)
      .in("id", ids);
    if (error) fail("getProductsByIds", error);
    return ((data ?? []) as ProductRow[]).map(mapProduct);
  },

  async getFeaturedProducts(limit) {
    const { data, error } = await createPublicClient()
      .from("products")
      .select(SUMMARY_COLUMNS)
      .eq("in_stock", true)
      .order("popularity", { ascending: false })
      .order("id", { ascending: true })
      .limit(limit);
    if (error) fail("getFeaturedProducts", error);
    return ((data ?? []) as ProductRow[]).map(mapSummary);
  },

  async getRelatedProducts(product, limit) {
    const { data, error } = await createPublicClient()
      .from("products")
      .select(SUMMARY_COLUMNS)
      .eq("category_slug", product.categorySlug)
      .eq("in_stock", true)
      .neq("id", product.id)
      .overlaps("concerns", product.concerns)
      .order("popularity", { ascending: false })
      .limit(limit);
    if (error) fail("getRelatedProducts", error);
    return ((data ?? []) as ProductRow[]).map(mapSummary);
  },

  async countProducts() {
    const { count, error } = await createPublicClient()
      .from("products")
      .select("id", { count: "exact", head: true });
    if (error) fail("countProducts", error);
    return count ?? 0;
  },

  async listSitemapProducts(offset, limit) {
    const { data, error } = await createPublicClient()
      .from("products")
      .select("slug,updated_at")
      .order("id", { ascending: true })
      .range(offset, offset + limit - 1);
    if (error) fail("listSitemapProducts", error);
    return ((data ?? []) as Array<{ slug: string; updated_at: string }>).map((r) => ({
      slug: r.slug,
      updatedAt: new Date(r.updated_at).toISOString(),
    }));
  },
};
