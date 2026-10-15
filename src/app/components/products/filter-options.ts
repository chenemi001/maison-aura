import type { SkinConcern, SkinType, SortOption } from "@/app/types/product";

export const SORT_LABELS: Record<SortOption, string> = {
  featured: "Featured",
  newest: "Newest",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  rating: "Top rated",
};

export const SKIN_TYPE_LABELS: Record<SkinType, string> = {
  dry: "Dry",
  oily: "Oily",
  combination: "Combination",
  sensitive: "Sensitive",
  normal: "Normal",
};

export const CONCERN_LABELS: Record<SkinConcern, string> = {
  hydration: "Hydration",
  "anti-ageing": "Anti-ageing",
  brightening: "Brightening",
  blemishes: "Blemishes",
  redness: "Redness",
  pores: "Pores",
  firmness: "Firmness",
};

/** Price bands in whole Naira; `undefined` means unbounded. */
export const PRICE_RANGES: Array<{ label: string; min?: number; max?: number }> = [
  { label: "Under ₦30,000", max: 30_000 },
  { label: "₦30,000 – ₦60,000", min: 30_000, max: 60_000 },
  { label: "₦60,000 – ₦100,000", min: 60_000, max: 100_000 },
  { label: "₦100,000 and above", min: 100_000 },
];

export const priceRangeValue = (r: { min?: number; max?: number }) => `${r.min ?? ""}-${r.max ?? ""}`;
