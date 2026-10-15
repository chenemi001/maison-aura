/**
 * URL search params <-> typed catalogue query.
 *
 * Deliberately dependency-free (no zod) because it is shared by Server
 * Components and client-side filter controls, so it ships in the browser.
 */
import {
  SKIN_CONCERNS,
  SKIN_TYPES,
  SORT_OPTIONS,
  type ProductQuery,
  type SkinConcern,
  type SkinType,
  type SortOption,
} from "@/app/types/product";

export type RawSearchParams = Record<string, string | string[] | undefined>;

export const DEFAULT_PAGE_SIZE = 24;
/** Hard cap on deep pagination to protect the database from huge offsets. */
export const MAX_PAGE = 2500;
const MAX_QUERY_LENGTH = 100;

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const list = (value: string | string[] | undefined): string[] =>
  (Array.isArray(value) ? value : value ? [value] : [])
    .flatMap((v) => v.split(","))
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);

const unique = <T,>(values: T[]): T[] => Array.from(new Set(values));

const isSkinType = (v: string): v is SkinType => (SKIN_TYPES as readonly string[]).includes(v);
const isConcern = (v: string): v is SkinConcern =>
  (SKIN_CONCERNS as readonly string[]).includes(v);
const isSort = (v: string): v is SortOption => (SORT_OPTIONS as readonly string[]).includes(v);

/** Parses a whole-currency amount (e.g. Naira) from the URL into minor units. */
function parseMajorUnits(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0 || n > 100_000_000) return undefined;
  return Math.round(n * 100);
}

function parsePage(value: string | undefined): number {
  const n = Number.parseInt(value ?? "1", 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(n, MAX_PAGE);
}

export function parseProductQuery(
  raw: RawSearchParams,
  overrides: Partial<Pick<ProductQuery, "category">> = {},
): ProductQuery {
  const q = first(raw.q)?.trim().slice(0, MAX_QUERY_LENGTH);
  const sortParam = first(raw.sort);
  // Price may arrive as `min`/`max` or as a combined `price=min-max` range
  // (the format submitted by the filter radio buttons without JavaScript).
  const [rangeMin, rangeMax] = (first(raw.price) ?? "").split("-");
  let minPrice = parseMajorUnits(first(raw.min) ?? rangeMin);
  let maxPrice = parseMajorUnits(first(raw.max) ?? rangeMax);
  if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
    [minPrice, maxPrice] = [maxPrice, minPrice];
  }

  const category = overrides.category ?? first(raw.category)?.trim().toLowerCase();

  return {
    q: q || undefined,
    category: category || undefined,
    skinTypes: unique(list(raw.skin).filter(isSkinType)),
    concerns: unique(list(raw.concern).filter(isConcern)),
    minPrice,
    maxPrice,
    inStock: first(raw.instock) === "1" || undefined,
    sort: sortParam && isSort(sortParam) ? sortParam : "featured",
    page: parsePage(first(raw.page)),
    pageSize: DEFAULT_PAGE_SIZE,
  };
}

/** Serialises a query back to URL params (omitting defaults) for links. */
export function serializeProductQuery(
  query: Partial<ProductQuery>,
  options: { includeCategory?: boolean } = {},
): URLSearchParams {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (options.includeCategory && query.category) params.set("category", query.category);
  if (query.skinTypes?.length) params.set("skin", query.skinTypes.join(","));
  if (query.concerns?.length) params.set("concern", query.concerns.join(","));
  if (query.minPrice !== undefined) params.set("min", String(query.minPrice / 100));
  if (query.maxPrice !== undefined) params.set("max", String(query.maxPrice / 100));
  if (query.inStock) params.set("instock", "1");
  if (query.sort && query.sort !== "featured") params.set("sort", query.sort);
  if (query.page && query.page > 1) params.set("page", String(query.page));
  return params;
}

/** True when any narrowing filter (other than pagination/sort) is applied. */
export function hasActiveFilters(query: ProductQuery): boolean {
  return Boolean(
    query.skinTypes?.length ||
      query.concerns?.length ||
      query.minPrice !== undefined ||
      query.maxPrice !== undefined ||
      query.inStock,
  );
}
