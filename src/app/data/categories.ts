import type { Category } from "@/app/types/category";

export const CATEGORIES: Category[] = [
  {
    slug: "cleansers",
    name: "Cleansers",
    tagline: "The first, quiet step",
    description:
      "Balms, gels and milks that lift away the day without disturbing your skin barrier.",
    image: "/images/products/cleanser-1.jpg",
  },
  {
    slug: "toners",
    name: "Toners & Essences",
    tagline: "Prepare and replenish",
    description:
      "Fine essences and mists that rebalance, hydrate and prime skin for what follows.",
    image: "/images/products/toner-3.jpg",
  },
  {
    slug: "serums",
    name: "Serums",
    tagline: "Concentrated actives",
    description:
      "Targeted concentrates with clinically studied actives for radiance, firmness and clarity.",
    image: "/images/products/serum-3.jpg",
  },
  {
    slug: "moisturisers",
    name: "Moisturisers",
    tagline: "Comfort that lasts",
    description:
      "Creams and emulsions that seal in hydration and support a resilient, supple complexion.",
    image: "/images/products/cream-3.jpg",
  },
  {
    slug: "masks",
    name: "Masks",
    tagline: "A weekly ritual",
    description:
      "Restorative masks for deep hydration, refined pores and an overnight glow.",
    image: "/images/editorial/mask-apply.jpg",
  },
  {
    slug: "eye-care",
    name: "Eye Care",
    tagline: "Delicate by design",
    description:
      "Gentle formulas for the thin skin around the eyes — depuffing, brightening, smoothing.",
    image: "/images/editorial/cream-apply.jpg",
  },
  {
    slug: "body",
    name: "Body",
    tagline: "Head-to-toe luxury",
    description:
      "Oils, lotions and washes that bring the Maison Aura ritual beyond the face.",
    image: "/images/products/body-1.jpg",
  },
  {
    slug: "suncare",
    name: "Suncare",
    tagline: "Everyday protection",
    description:
      "Weightless, invisible broad-spectrum protection designed to be worn every day.",
    image: "/images/products/texture-2.jpg",
  },
];

export const CATEGORY_BY_SLUG = new Map(CATEGORIES.map((c) => [c.slug, c]));
