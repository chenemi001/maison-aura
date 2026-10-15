/**
 * Photography used across the storefront.
 *
 * All images are from Unsplash (https://unsplash.com/license — free for
 * commercial use) and stored locally under /public/images so they are served
 * and optimised (AVIF/WebP, responsive sizes) by `next/image`. Branded
 * third-party products were deliberately excluded. See public/images/CREDITS.md.
 */

const p = (name: string) => `/images/products/${name}.jpg`;
const e = (name: string) => `/images/editorial/${name}.jpg`;

/** Product photography pools, keyed by category slug. */
export const PRODUCT_IMAGES: Record<string, string[]> = {
  serums: ["serum-1", "serum-2", "serum-3", "serum-4", "serum-5", "serum-6", "serum-7", "serum-8"].map(p),
  moisturisers: ["cream-1", "cream-2", "cream-3", "cream-4", "cream-5", "cream-6", "cream-7"].map(p),
  cleansers: ["cleanser-1", "cleanser-4", "cleanser-3", "body-1"].map(p),
  toners: ["toner-1", "toner-2", "toner-3", "serum-5"].map(p),
  masks: ["mask-1", "mask-4", "mask-3", "cream-3"].map(p),
  "eye-care": ["serum-2", "cream-4", "serum-5", "cream-2"].map(p),
  body: ["body-1", "body-2", "body-5", "body-4"].map(p),
  suncare: ["cleanser-3", "texture-2", "cleanser-4"].map(p),
};

/** Close-up texture shots used as the secondary gallery image. */
export const TEXTURE_IMAGES = ["texture-1", "texture-2", "texture-3"].map(p);

export const EDITORIAL = {
  heroPortrait: e("hero-glow"),
  heroProduct: e("hero-product"),
  ritual: e("ritual"),
  profile: e("profile-braids"),
  serumApply: e("cream-apply"),
  glow: e("warm-glow"),
  clayMask: e("mask-apply"),
  natural: e("curls"),
} as const;

/** Picks a stable image from a pool for a given index. */
export function imageFor(pool: string[], index: number): string {
  return pool[((index % pool.length) + pool.length) % pool.length];
}
