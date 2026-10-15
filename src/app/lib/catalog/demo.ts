import { CATEGORY_BY_SLUG } from "@/app/data/categories";
import { CURATED_COUNT, getDemoCatalogue } from "@/app/data/products";
import type { Product, ProductQuery, SortOption } from "@/app/types/product";
import {
  paginate,
  popularityScore,
  toSummary,
  type CatalogRepository,
} from "@/app/lib/catalog/types";

/**
 * In-memory catalogue with pre-computed indexes.
 *
 * Each sort order is computed once (O(n log n)) and cached as an index array;
 * a listing request is then a single linear filter pass that stops collecting
 * once the requested page is filled. 50,000 products filter in a few ms.
 */
interface Indexes {
  products: Product[];
  bySlug: Map<string, Product>;
  byId: Map<string, Product>;
  haystacks: string[];
  sorted: Map<SortOption, Uint32Array>;
}

let indexes: Indexes | null = null;

function getIndexes(): Indexes {
  if (indexes) return indexes;
  const products = getDemoCatalogue();
  indexes = {
    products,
    bySlug: new Map(products.map((p) => [p.slug, p])),
    byId: new Map(products.map((p) => [p.id, p])),
    haystacks: products.map((p) =>
      [
        p.name,
        CATEGORY_BY_SLUG.get(p.categorySlug)?.name ?? p.categorySlug,
        p.concerns.join(" "),
        p.skinTypes.join(" "),
        p.ingredients.slice(0, 3).join(" "),
      ]
        .join(" ")
        .toLowerCase(),
    ),
    sorted: new Map(),
  };
  return indexes;
}

const comparators: Record<SortOption, (a: Product, b: Product, ia: number, ib: number) => number> = {
  featured: (a, b, ia, ib) =>
    popularityScore(b, ib < CURATED_COUNT) - popularityScore(a, ia < CURATED_COUNT) || ia - ib,
  newest: (a, b, ia, ib) => b.createdAt.localeCompare(a.createdAt) || ia - ib,
  "price-asc": (a, b, ia, ib) => a.priceCents - b.priceCents || ia - ib,
  "price-desc": (a, b, ia, ib) => b.priceCents - a.priceCents || ia - ib,
  rating: (a, b, ia, ib) => b.rating - a.rating || b.reviewCount - a.reviewCount || ia - ib,
};

function sortedOrder(sort: SortOption): Uint32Array {
  const idx = getIndexes();
  let order = idx.sorted.get(sort);
  if (!order) {
    const compare = comparators[sort];
    const positions = Array.from(idx.products.keys());
    positions.sort((ia, ib) => compare(idx.products[ia], idx.products[ib], ia, ib));
    order = Uint32Array.from(positions);
    idx.sorted.set(sort, order);
  }
  return order;
}

function tokenize(q: string): string[] {
  return q
    .toLowerCase()
    .split(/[^a-z0-9-]+/)
    .filter((t) => t.length > 1);
}

export function buildPredicate(query: ProductQuery) {
  const tokens = query.q ? tokenize(query.q) : [];
  const skin = query.skinTypes?.length ? new Set(query.skinTypes) : null;
  const concerns = query.concerns?.length ? new Set(query.concerns) : null;
  const { haystacks } = getIndexes();

  return (p: Product, position: number): boolean => {
    if (query.category && p.categorySlug !== query.category) return false;
    if (query.inStock && !p.inStock) return false;
    if (query.minPrice !== undefined && p.priceCents < query.minPrice) return false;
    if (query.maxPrice !== undefined && p.priceCents > query.maxPrice) return false;
    if (skin && !p.skinTypes.some((s) => skin.has(s))) return false;
    if (concerns && !p.concerns.some((c) => concerns.has(c))) return false;
    if (tokens.length) {
      const hay = haystacks[position];
      for (const token of tokens) if (!hay.includes(token)) return false;
    }
    return true;
  };
}

export const demoCatalog: CatalogRepository = {
  async listProducts(query) {
    const { products } = getIndexes();
    const order = sortedOrder(query.sort);
    const matches = buildPredicate(query);
    const start = (query.page - 1) * query.pageSize;
    const end = start + query.pageSize;
    const items = [];
    let total = 0;
    for (const position of order) {
      const product = products[position];
      if (!matches(product, position)) continue;
      if (total >= start && total < end) items.push(toSummary(product));
      total++;
    }
    return paginate(items, total, query.page, query.pageSize);
  },

  async getProductBySlug(slug) {
    return getIndexes().bySlug.get(slug) ?? null;
  },

  async getProductsByIds(ids) {
    const { byId } = getIndexes();
    return ids.map((id) => byId.get(id)).filter((p): p is Product => Boolean(p));
  },

  async getFeaturedProducts(limit) {
    const { products } = getIndexes();
    const order = sortedOrder("featured");
    const out = [];
    for (const position of order) {
      const product = products[position];
      if (product.inStock) out.push(toSummary(product));
      if (out.length === limit) break;
    }
    return out;
  },

  async getRelatedProducts(product, limit) {
    const { products } = getIndexes();
    const order = sortedOrder("featured");
    const concerns = new Set(product.concerns);
    const out = [];
    for (const position of order) {
      const candidate = products[position];
      if (
        candidate.id !== product.id &&
        candidate.categorySlug === product.categorySlug &&
        candidate.inStock &&
        candidate.concerns.some((c) => concerns.has(c))
      ) {
        out.push(toSummary(candidate));
        if (out.length === limit) break;
      }
    }
    return out;
  },

  async countProducts() {
    return getIndexes().products.length;
  },

  async listSitemapProducts(offset, limit) {
    return getIndexes()
      .products.slice(offset, offset + limit)
      .map((p) => ({ slug: p.slug, updatedAt: p.createdAt }));
  },
};
