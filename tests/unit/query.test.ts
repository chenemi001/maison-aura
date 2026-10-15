import { describe, expect, it } from "vitest";
import { getPageWindow } from "@/app/components/ui/Pagination";
import { MAX_PAGE, hasActiveFilters, parseProductQuery, serializeProductQuery } from "@/app/lib/query";

describe("parseProductQuery", () => {
  it("applies safe defaults", () => {
    expect(parseProductQuery({})).toEqual({
      q: undefined,
      category: undefined,
      skinTypes: [],
      concerns: [],
      minPrice: undefined,
      maxPrice: undefined,
      inStock: undefined,
      sort: "featured",
      page: 1,
      pageSize: 24,
    });
  });

  it("parses comma-separated and repeated multi-value params, dropping unknown values", () => {
    const q = parseProductQuery({ skin: ["dry,OILY", "dry", "scaly"], concern: "redness,<script>" });
    expect(q.skinTypes).toEqual(["dry", "oily"]);
    expect(q.concerns).toEqual(["redness"]);
  });

  it("converts pound prices to pence and swaps inverted ranges", () => {
    expect(parseProductQuery({ min: "50", max: "20" })).toMatchObject({ minPrice: 2000, maxPrice: 5000 });
    expect(parseProductQuery({ price: "30-50" })).toMatchObject({ minPrice: 3000, maxPrice: 5000 });
    expect(parseProductQuery({ price: "80-" })).toMatchObject({ minPrice: 8000, maxPrice: undefined });
    expect(parseProductQuery({ min: "-5", max: "abc" })).toMatchObject({ minPrice: undefined, maxPrice: undefined });
  });

  it("sanitises page and sort", () => {
    expect(parseProductQuery({ page: "-3" }).page).toBe(1);
    expect(parseProductQuery({ page: "abc" }).page).toBe(1);
    expect(parseProductQuery({ page: "99999999" }).page).toBe(MAX_PAGE);
    expect(parseProductQuery({ sort: "DROP TABLE" }).sort).toBe("featured");
    expect(parseProductQuery({ sort: "price-asc" }).sort).toBe("price-asc");
  });

  it("trims and bounds the search term", () => {
    expect(parseProductQuery({ q: "   " }).q).toBeUndefined();
    expect(parseProductQuery({ q: "x".repeat(500) }).q).toHaveLength(100);
  });

  it("lets the route override the category", () => {
    expect(parseProductQuery({ category: "body" }, { category: "serums" }).category).toBe("serums");
  });
});

describe("serializeProductQuery", () => {
  it("omits defaults and round-trips through the parser", () => {
    const original = parseProductQuery({
      q: "retinal",
      skin: "dry,sensitive",
      concern: "firmness",
      min: "30",
      max: "80",
      instock: "1",
      sort: "rating",
      page: "3",
    });
    const params = serializeProductQuery(original);
    expect(params.toString()).toBe(
      "q=retinal&skin=dry%2Csensitive&concern=firmness&min=30&max=80&instock=1&sort=rating&page=3",
    );
    expect(parseProductQuery(Object.fromEntries(params))).toEqual(original);
  });

  it("produces an empty string for the default query", () => {
    expect(serializeProductQuery(parseProductQuery({})).toString()).toBe("");
  });

  it("reports active filters", () => {
    expect(hasActiveFilters(parseProductQuery({ sort: "newest", page: "2" }))).toBe(false);
    expect(hasActiveFilters(parseProductQuery({ instock: "1" }))).toBe(true);
  });
});

describe("getPageWindow", () => {
  it("shows every page for short ranges", () => {
    expect(getPageWindow(1, 3)).toEqual([1, 2, 3]);
  });

  it("collapses large ranges with gaps", () => {
    expect(getPageWindow(50, 2084)).toEqual([1, null, 49, 50, 51, null, 2084]);
  });

  it("fills single-page gaps instead of showing an ellipsis", () => {
    expect(getPageWindow(4, 10)).toEqual([1, 2, 3, 4, 5, null, 10]);
  });
});
