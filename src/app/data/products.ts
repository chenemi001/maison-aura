/**
 * Demo catalogue.
 *
 * A small set of hand-written hero products is extended with a deterministic
 * generator so the storefront can be exercised against a realistic catalogue
 * of 50,000 products without shipping a 50k-row JSON file. The same generator
 * seeds Supabase (see `scripts/seed-supabase.ts`), so local and database modes
 * serve identical data.
 *
 * Every value is derived from a seeded PRNG — no `Math.random()` or
 * `Date.now()` — so output is stable across builds, servers and tests.
 */
import { PRODUCT_IMAGES, TEXTURE_IMAGES, imageFor } from "@/app/data/images";
import type {
  Product,
  ProductBadge,
  ProductVariant,
  SkinConcern,
  SkinType,
} from "@/app/types/product";

export const CATALOG_SIZE = 50_000;

/** Packaging format — determines the available sizes. */
type VesselForm = "dropper" | "jar" | "tube" | "pump" | "mist";

interface CategoryBlueprint {
  forms: VesselForm[];
  types: string[];
  /** Typical price of the smallest size, in whole Naira. */
  basePriceNaira: number;
}

const BLUEPRINTS: Record<string, CategoryBlueprint> = {
  cleansers: {
    forms: ["tube", "pump"],
    types: ["Cleansing Balm", "Gel Cleanser", "Cream Cleanser", "Cleansing Oil", "Milk Cleanser"],
    basePriceNaira: 24_000,
  },
  toners: {
    forms: ["mist"],
    types: ["Essence", "Toner", "Facial Mist", "Exfoliating Tonic"],
    basePriceNaira: 26_000,
  },
  serums: {
    forms: ["dropper"],
    types: ["Serum", "Concentrate", "Ampoule", "Booster Drops"],
    basePriceNaira: 48_000,
  },
  moisturisers: {
    forms: ["jar", "pump"],
    types: ["Cream", "Gel Cream", "Night Cream", "Emulsion", "Barrier Balm"],
    basePriceNaira: 42_000,
  },
  masks: {
    forms: ["jar", "tube"],
    types: ["Overnight Mask", "Clay Mask", "Sleeping Mask", "Enzyme Mask"],
    basePriceNaira: 34_000,
  },
  "eye-care": {
    forms: ["tube", "dropper"],
    types: ["Eye Cream", "Eye Serum", "Eye Balm"],
    basePriceNaira: 38_000,
  },
  body: {
    forms: ["pump"],
    types: ["Body Lotion", "Body Oil", "Body Wash", "Hand Cream"],
    basePriceNaira: 28_000,
  },
  suncare: {
    forms: ["tube", "mist"],
    types: ["Daily Fluid SPF 50", "Mineral Shield SPF 30", "Tinted Veil SPF 40"],
    basePriceNaira: 30_000,
  },
};

const SIZES: Record<VesselForm, number[]> = {
  dropper: [15, 30, 50],
  jar: [30, 50, 100],
  tube: [50, 100, 150],
  pump: [100, 200, 400],
  mist: [50, 100, 200],
};

const DESCRIPTORS = [
  "Velvet", "Luminous", "Silk", "Midnight", "Cashmere", "Pearl", "Dew", "Golden",
  "Petal", "Cloud", "Satin", "Ritual", "Botanic", "Amber", "Opal", "Alabaster",
  "Rosewater", "Marine", "Porcelain", "Saffron", "Nectar", "Solstice", "Aurora",
  "Camellia", "Verbena", "Iris", "Orris", "Neroli", "Fig", "Moonlit",
];

interface HeroIngredient {
  name: string;
  inci: string;
  concerns: SkinConcern[];
  skinTypes: SkinType[];
  benefit: string;
}

const HEROES: HeroIngredient[] = [
  { name: "Peptide", inci: "Palmitoyl Tripeptide-1", concerns: ["firmness", "anti-ageing"], skinTypes: ["dry", "normal", "combination"], benefit: "visibly firms and smooths" },
  { name: "Ceramide", inci: "Ceramide NP", concerns: ["hydration", "redness"], skinTypes: ["dry", "sensitive", "normal"], benefit: "reinforces the moisture barrier" },
  { name: "Niacinamide", inci: "Niacinamide", concerns: ["pores", "blemishes"], skinTypes: ["oily", "combination", "normal"], benefit: "refines pores and evens tone" },
  { name: "Vitamin C", inci: "3-O-Ethyl Ascorbic Acid", concerns: ["brightening", "anti-ageing"], skinTypes: ["normal", "combination", "dry"], benefit: "restores radiance" },
  { name: "Retinal", inci: "Retinal", concerns: ["anti-ageing", "firmness"], skinTypes: ["normal", "oily", "combination"], benefit: "softens the look of fine lines" },
  { name: "Hyaluronic", inci: "Sodium Hyaluronate", concerns: ["hydration"], skinTypes: ["dry", "normal", "sensitive", "combination", "oily"], benefit: "draws in lasting hydration" },
  { name: "Squalane", inci: "Squalane", concerns: ["hydration"], skinTypes: ["dry", "sensitive", "normal"], benefit: "replenishes lipids for a supple feel" },
  { name: "Bakuchiol", inci: "Bakuchiol", concerns: ["anti-ageing", "firmness"], skinTypes: ["sensitive", "dry", "normal"], benefit: "renews gently, without irritation" },
  { name: "Centella", inci: "Centella Asiatica Extract", concerns: ["redness", "blemishes"], skinTypes: ["sensitive", "combination", "oily"], benefit: "calms and comforts reactive skin" },
  { name: "Azelaic", inci: "Azelaic Acid", concerns: ["redness", "blemishes"], skinTypes: ["oily", "combination", "sensitive"], benefit: "clarifies and reduces redness" },
  { name: "Rice Ferment", inci: "Saccharomyces/Rice Ferment Filtrate", concerns: ["brightening", "hydration"], skinTypes: ["normal", "dry", "combination"], benefit: "leaves a translucent glow" },
  { name: "Salicylic", inci: "Salicylic Acid", concerns: ["blemishes", "pores"], skinTypes: ["oily", "combination"], benefit: "decongests pores" },
  { name: "Bio-Collagen", inci: "Hydrolyzed Collagen", concerns: ["firmness", "hydration"], skinTypes: ["dry", "normal"], benefit: "plumps and bounces back" },
  { name: "Rosehip", inci: "Rosa Canina Fruit Oil", concerns: ["brightening", "hydration"], skinTypes: ["dry", "normal"], benefit: "nourishes and revives dull skin" },
  { name: "Oat", inci: "Avena Sativa Kernel Extract", concerns: ["redness", "hydration"], skinTypes: ["sensitive", "dry"], benefit: "soothes tightness and itch" },
  { name: "Glycolic", inci: "Glycolic Acid", concerns: ["brightening", "pores"], skinTypes: ["normal", "oily", "combination"], benefit: "resurfaces for smoother texture" },
  { name: "Tremella", inci: "Tremella Fuciformis Extract", concerns: ["hydration"], skinTypes: ["dry", "sensitive", "normal"], benefit: "delivers weightless moisture" },
  { name: "Copper Peptide", inci: "Copper Tripeptide-1", concerns: ["firmness", "anti-ageing"], skinTypes: ["normal", "dry", "combination"], benefit: "supports skin renewal" },
  { name: "Marula", inci: "Sclerocarya Birrea Seed Oil", concerns: ["hydration", "firmness"], skinTypes: ["dry", "normal"], benefit: "melts in for a velvety finish" },
  { name: "Lactic", inci: "Lactic Acid", concerns: ["brightening", "hydration"], skinTypes: ["dry", "normal", "sensitive"], benefit: "polishes while it hydrates" },
];

const SUPPORTING_INCI = [
  "Aqua", "Glycerin", "Butylene Glycol", "Caprylic/Capric Triglyceride", "Panthenol",
  "Tocopherol", "Allantoin", "Betaine", "Sodium PCA", "Camellia Sinensis Leaf Extract",
  "Rosa Damascena Flower Water", "Ethylhexylglycerin", "Phenoxyethanol",
];

/** Mulberry32 — tiny, fast, deterministic PRNG. */
function prng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = <T,>(rand: () => number, list: readonly T[]): T =>
  list[Math.floor(rand() * list.length)];

/** Seeded Fisher–Yates shuffle (returns a new array). */
function shuffle<T>(rand: () => number, list: readonly T[]): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Main photo, an alternate angle (shown on hover) and a texture close-up. */
function productImages(categorySlug: string, index: number) {
  const pool = PRODUCT_IMAGES[categorySlug] ?? PRODUCT_IMAGES.serums;
  // Hash the index: categories are assigned by `index % 8`, so using the raw
  // index would give every product in a category the same photograph.
  const hash = Math.imul(index ^ 0x9e3779b9, 2654435761) >>> 0;
  const main = imageFor(pool, hash);
  const alternate = imageFor(pool, hash + 1);
  return { image: main, images: [main, alternate, imageFor(TEXTURE_IMAGES, hash >>> 3)] };
}

/** Rounds kobo to the nearest ₦500 — the price points used across the store. */
const roundToNaira = (kobo: number) => Math.max(50_000, Math.round(kobo / 50_000) * 50_000);
const nairaToKobo = (naira: number) => naira * 100;

function buildVariants(
  productId: string,
  form: VesselForm,
  basePriceCents: number,
  count: number,
): ProductVariant[] {
  const multipliers = [1, 1.6, 2.4];
  return SIZES[form].slice(0, count).map((sizeMl, i) => ({
    id: `${productId}-${sizeMl}ml`,
    label: `${sizeMl} ml`,
    sizeMl,
    priceCents: roundToNaira(basePriceCents * multipliers[i]),
  }));
}

const CATALOG_EPOCH = Date.UTC(2023, 0, 1);
const CATALOG_SPAN_DAYS = 1000;
const DAY_MS = 86_400_000;

// ---------------------------------------------------------------------------
// Hand-written hero products (always the first entries in the catalogue).
// ---------------------------------------------------------------------------

interface CuratedSeed {
  slug: string;
  name: string;
  category: string;
  form: VesselForm;
  /** Price of the smallest size, in whole Naira. */
  priceNaira: number;
  compareAtNaira?: number;
  rating: number;
  reviewCount: number;
  badge?: ProductBadge;
  skinTypes: SkinType[];
  concerns: SkinConcern[];
  description: string;
  howToUse: string;
  keyIngredients: string[];
  daysAgo: number;
}

const CURATED: CuratedSeed[] = [
  {
    slug: "aura-renewal-serum",
    name: "Aura Renewal Serum",
    category: "serums",
    form: "dropper",
    priceNaira: 68_000,
    rating: 4.9,
    reviewCount: 2814,
    badge: "Bestseller",
    skinTypes: ["normal", "dry", "combination"],
    concerns: ["anti-ageing", "firmness", "brightening"],
    description:
      "Our signature serum pairs encapsulated retinal with a peptide complex and fermented rose to visibly refine texture and restore a lit-from-within radiance — without the irritation associated with traditional retinoids.",
    howToUse:
      "Each evening, warm 3–4 drops between fingertips and press into clean skin. Follow with moisturiser. Introduce every other night for the first two weeks.",
    keyIngredients: ["Retinal", "Palmitoyl Tripeptide-1", "Rosa Damascena Ferment", "Squalane"],
    daysAgo: 420,
  },
  {
    slug: "cashmere-cloud-cream",
    name: "Cashmere Cloud Cream",
    category: "moisturisers",
    form: "jar",
    priceNaira: 58_000,
    rating: 4.8,
    reviewCount: 1932,
    badge: "Bestseller",
    skinTypes: ["dry", "normal", "sensitive"],
    concerns: ["hydration", "firmness"],
    description:
      "A whipped, weightless cream that melts on contact, layering five ceramides with bio-collagen for 72-hour hydration and a soft-focus finish.",
    howToUse: "Morning and evening, smooth a pearl-sized amount over face and neck.",
    keyIngredients: ["Ceramide NP", "Hydrolyzed Collagen", "Shea Butter", "Sodium Hyaluronate"],
    daysAgo: 610,
  },
  {
    slug: "rose-velvet-cleansing-balm",
    name: "Rose Velvet Cleansing Balm",
    category: "cleansers",
    form: "tube",
    priceNaira: 36_000,
    rating: 4.8,
    reviewCount: 1645,
    badge: "Bestseller",
    skinTypes: ["dry", "normal", "sensitive", "combination"],
    concerns: ["hydration", "redness"],
    description:
      "A silken balm that transforms into a milky oil, dissolving SPF and long-wear make-up while rosehip and oat leave skin cushioned, never stripped.",
    howToUse:
      "Massage onto dry skin, add a splash of warm water to emulsify, then rinse or remove with a warm cloth.",
    keyIngredients: ["Rosa Canina Fruit Oil", "Avena Sativa Kernel Extract", "Squalane"],
    daysAgo: 700,
  },
  {
    slug: "luminous-vitamin-c-concentrate",
    name: "Luminous Vitamin C Concentrate",
    category: "serums",
    form: "dropper",
    priceNaira: 54_000,
    rating: 4.7,
    reviewCount: 1210,
    skinTypes: ["normal", "combination", "oily"],
    concerns: ["brightening", "anti-ageing"],
    description:
      "A stable 15% vitamin C derivative with ferulic acid and vitamin E to fade the look of dark spots and defend against daily environmental stress.",
    howToUse: "Each morning, apply 3 drops to clean skin before moisturiser and SPF.",
    keyIngredients: ["3-O-Ethyl Ascorbic Acid", "Ferulic Acid", "Tocopherol"],
    daysAgo: 300,
  },
  {
    slug: "midnight-ceramide-night-cream",
    name: "Midnight Ceramide Night Cream",
    category: "moisturisers",
    form: "jar",
    priceNaira: 62_000,
    rating: 4.8,
    reviewCount: 988,
    skinTypes: ["dry", "normal", "sensitive"],
    concerns: ["hydration", "firmness", "anti-ageing"],
    description:
      "A rich, restorative night cream that works with skin's overnight repair cycle, combining ceramides, bakuchiol and marula oil for a rested, plumped morning complexion.",
    howToUse: "In the evening, warm a small amount between palms and press over face and neck.",
    keyIngredients: ["Ceramide NP", "Bakuchiol", "Sclerocarya Birrea Seed Oil"],
    daysAgo: 250,
  },
  {
    slug: "petal-dew-essence",
    name: "Petal Dew Essence",
    category: "toners",
    form: "mist",
    priceNaira: 38_000,
    rating: 4.7,
    reviewCount: 842,
    skinTypes: ["dry", "normal", "sensitive", "combination"],
    concerns: ["hydration", "brightening"],
    description:
      "A featherlight rice-ferment essence that floods skin with moisture and preps it to absorb everything that follows.",
    howToUse: "After cleansing, mist or pat 3–4 drops into skin. Layer twice on drier days.",
    keyIngredients: ["Saccharomyces/Rice Ferment Filtrate", "Rosa Damascena Flower Water", "Panthenol"],
    daysAgo: 180,
  },
  {
    slug: "porcelain-niacinamide-serum",
    name: "Porcelain Niacinamide Serum",
    category: "serums",
    form: "dropper",
    priceNaira: 42_000,
    rating: 4.6,
    reviewCount: 1504,
    skinTypes: ["oily", "combination", "normal"],
    concerns: ["pores", "blemishes", "brightening"],
    description:
      "10% niacinamide with zinc PCA to visibly refine pores, balance shine and even skin tone in four weeks.",
    howToUse: "Morning and evening, apply 2–3 drops before heavier creams.",
    keyIngredients: ["Niacinamide", "Zinc PCA", "Sodium Hyaluronate"],
    daysAgo: 520,
  },
  {
    slug: "silk-mineral-shield-spf-50",
    name: "Silk Mineral Shield SPF 50",
    category: "suncare",
    form: "tube",
    priceNaira: 38_000,
    rating: 4.6,
    reviewCount: 733,
    badge: "New",
    skinTypes: ["sensitive", "normal", "dry", "combination", "oily"],
    concerns: ["redness", "anti-ageing"],
    description:
      "A sheer mineral sunscreen with a soft-matte, no-white-cast finish and broad-spectrum UVA/UVB protection for every skin tone.",
    howToUse:
      "Apply generously as the last step of your morning routine. Reapply every two hours in direct sun.",
    keyIngredients: ["Zinc Oxide", "Niacinamide", "Centella Asiatica Extract"],
    daysAgo: 20,
  },
  {
    slug: "opal-eye-revival-cream",
    name: "Opal Eye Revival Cream",
    category: "eye-care",
    form: "tube",
    priceNaira: 48_000,
    rating: 4.7,
    reviewCount: 611,
    skinTypes: ["dry", "normal", "sensitive"],
    concerns: ["firmness", "anti-ageing", "hydration"],
    description:
      "A cooling eye cream with caffeine, copper peptides and light-reflecting pearl to depuff, smooth and brighten the delicate eye contour.",
    howToUse: "Tap a rice-grain amount along the orbital bone, morning and evening.",
    keyIngredients: ["Copper Tripeptide-1", "Caffeine", "Pearl Powder"],
    daysAgo: 360,
  },
  {
    slug: "amber-overnight-renewal-mask",
    name: "Amber Overnight Renewal Mask",
    category: "masks",
    form: "jar",
    priceNaira: 46_000,
    rating: 4.7,
    reviewCount: 527,
    skinTypes: ["normal", "dry", "combination"],
    concerns: ["brightening", "hydration"],
    description:
      "A gentle lactic-acid sleeping mask that resurfaces overnight, revealing smoother, more luminous skin by morning.",
    howToUse: "Two to three evenings a week, apply a thin layer as the final step. Rinse in the morning.",
    keyIngredients: ["Lactic Acid", "Tremella Fuciformis Extract", "Squalane"],
    daysAgo: 140,
  },
  {
    slug: "botanic-clarifying-clay-mask",
    name: "Botanic Clarifying Clay Mask",
    category: "masks",
    form: "jar",
    priceNaira: 36_000,
    rating: 4.5,
    reviewCount: 402,
    skinTypes: ["oily", "combination"],
    concerns: ["pores", "blemishes"],
    description:
      "French pink clay and salicylic acid draw out impurities while centella keeps skin calm and comfortable.",
    howToUse: "Apply an even layer to clean skin, leave for 10 minutes, then rinse with warm water.",
    keyIngredients: ["Kaolin", "Salicylic Acid", "Centella Asiatica Extract"],
    daysAgo: 410,
  },
  {
    slug: "neroli-body-oil",
    name: "Neroli Dry Body Oil",
    category: "body",
    form: "pump",
    priceNaira: 44_000,
    rating: 4.8,
    reviewCount: 689,
    skinTypes: ["dry", "normal", "sensitive"],
    concerns: ["hydration", "firmness"],
    description:
      "A fast-absorbing dry oil scented with Tunisian neroli that leaves skin satin-soft with a subtle sheen.",
    howToUse: "Massage into damp skin after bathing, paying attention to drier areas.",
    keyIngredients: ["Sclerocarya Birrea Seed Oil", "Citrus Aurantium Flower Oil", "Tocopherol"],
    daysAgo: 230,
  },
  {
    slug: "cloud-gel-cleanser",
    name: "Cloud Gel Cleanser",
    category: "cleansers",
    form: "pump",
    priceNaira: 28_000,
    rating: 4.6,
    reviewCount: 1120,
    skinTypes: ["oily", "combination", "normal"],
    concerns: ["pores", "blemishes"],
    description:
      "A low-foam, pH-balanced gel that clears excess oil and impurities while respecting the skin barrier.",
    howToUse: "Massage over damp skin morning and evening, then rinse thoroughly.",
    keyIngredients: ["Salicylic Acid", "Niacinamide", "Glycerin"],
    daysAgo: 560,
  },
  {
    slug: "camellia-barrier-balm",
    name: "Camellia Barrier Balm",
    category: "moisturisers",
    form: "jar",
    priceNaira: 52_000,
    rating: 4.7,
    reviewCount: 455,
    badge: "New",
    skinTypes: ["sensitive", "dry"],
    concerns: ["redness", "hydration"],
    description:
      "A cocooning balm for compromised skin, blending camellia oil, oat and ceramides to soothe redness and restore comfort.",
    howToUse: "Apply to areas of dryness or irritation as often as needed.",
    keyIngredients: ["Camellia Japonica Seed Oil", "Avena Sativa Kernel Extract", "Ceramide NP"],
    daysAgo: 35,
  },
  {
    slug: "solstice-glow-drops",
    name: "Solstice Glow Drops",
    category: "serums",
    form: "dropper",
    priceNaira: 46_000,
    rating: 4.6,
    reviewCount: 388,
    badge: "Limited",
    skinTypes: ["normal", "dry", "combination"],
    concerns: ["brightening", "hydration"],
    description:
      "Liquid light: a sheer, tinted serum infused with rosehip and vitamin C for a sun-kissed glow without the sun.",
    howToUse: "Mix 1–2 drops into moisturiser or press onto high points of the face.",
    keyIngredients: ["Rosa Canina Fruit Oil", "3-O-Ethyl Ascorbic Acid", "Mica"],
    daysAgo: 60,
  },
  {
    slug: "iris-exfoliating-tonic",
    name: "Iris Exfoliating Tonic",
    category: "toners",
    form: "mist",
    priceNaira: 34_000,
    rating: 4.6,
    reviewCount: 710,
    skinTypes: ["normal", "oily", "combination"],
    concerns: ["pores", "brightening"],
    description:
      "A balanced 5% glycolic acid tonic with soothing iris root that gently resurfaces for a smoother, clearer complexion.",
    howToUse: "In the evening, sweep over clean skin with a cotton pad. Avoid the eye area.",
    keyIngredients: ["Glycolic Acid", "Iris Florentina Root Extract", "Aloe Barbadensis Leaf Juice"],
    daysAgo: 480,
  },
  {
    slug: "velvet-hand-cream",
    name: "Velvet Hand Cream",
    category: "body",
    form: "tube",
    priceNaira: 22_000,
    rating: 4.7,
    reviewCount: 940,
    skinTypes: ["dry", "normal", "sensitive"],
    concerns: ["hydration"],
    description:
      "A non-greasy, rapidly absorbed hand cream with shea and squalane, scented with our signature rose and oud accord.",
    howToUse: "Massage into hands and cuticles whenever they need comfort.",
    keyIngredients: ["Shea Butter", "Squalane", "Glycerin"],
    daysAgo: 330,
  },
  {
    slug: "pearl-hyaluronic-serum",
    name: "Pearl Hyaluronic Serum",
    category: "serums",
    form: "dropper",
    priceNaira: 44_000,
    rating: 4.8,
    reviewCount: 1388,
    skinTypes: ["dry", "normal", "sensitive", "combination", "oily"],
    concerns: ["hydration"],
    description:
      "Five weights of hyaluronic acid deliver multi-depth hydration for instantly plumper, dewier skin.",
    howToUse: "Apply to damp skin morning and evening, then seal with moisturiser.",
    keyIngredients: ["Sodium Hyaluronate", "Hydrolyzed Hyaluronic Acid", "Panthenol"],
    daysAgo: 640,
  },
  {
    slug: "aurora-tinted-veil-spf-40",
    name: "Aurora Tinted Veil SPF 40",
    category: "suncare",
    form: "tube",
    priceNaira: 36_000,
    rating: 4.5,
    reviewCount: 318,
    skinTypes: ["normal", "dry", "combination"],
    concerns: ["brightening", "redness"],
    description:
      "A sheer, skin-tone-adaptive tint with SPF 40 that blurs redness and leaves a healthy, luminous finish.",
    howToUse: "Smooth over skin as the final step of your morning routine. Reapply as needed.",
    keyIngredients: ["Zinc Oxide", "Iron Oxides", "Sodium Hyaluronate"],
    daysAgo: 90,
  },
  {
    slug: "dew-eye-serum",
    name: "Dew Eye Serum",
    category: "eye-care",
    form: "dropper",
    priceNaira: 42_000,
    rating: 4.5,
    reviewCount: 274,
    skinTypes: ["normal", "dry", "sensitive", "combination"],
    concerns: ["hydration", "firmness"],
    description:
      "A cooling, weightless eye serum with peptides and tremella to smooth the look of crepiness.",
    howToUse: "Tap one drop around each eye, morning and evening.",
    keyIngredients: ["Palmitoyl Tripeptide-1", "Tremella Fuciformis Extract", "Caffeine"],
    daysAgo: 150,
  },
  {
    slug: "fig-milk-cleanser",
    name: "Fig Milk Cleanser",
    category: "cleansers",
    form: "pump",
    priceNaira: 30_000,
    compareAtNaira: 36_000,
    rating: 4.5,
    reviewCount: 506,
    skinTypes: ["dry", "sensitive", "normal"],
    concerns: ["hydration", "redness"],
    description:
      "A creamy, non-foaming milk that cleanses with fig extract and oat lipids for skin that feels soft and calm.",
    howToUse: "Massage over dry or damp skin and remove with a warm cloth.",
    keyIngredients: ["Ficus Carica Fruit Extract", "Avena Sativa Kernel Extract", "Glycerin"],
    daysAgo: 390,
  },
  {
    slug: "saffron-firming-body-lotion",
    name: "Saffron Firming Body Lotion",
    category: "body",
    form: "pump",
    priceNaira: 38_000,
    rating: 4.6,
    reviewCount: 299,
    skinTypes: ["dry", "normal"],
    concerns: ["firmness", "hydration"],
    description:
      "A silky lotion with saffron and caffeine that visibly firms and tones while delivering all-day moisture.",
    howToUse: "Apply morning or evening, massaging upwards in circular motions.",
    keyIngredients: ["Crocus Sativus Flower Extract", "Caffeine", "Shea Butter"],
    daysAgo: 270,
  },
  {
    slug: "marine-hydra-gel-cream",
    name: "Marine Hydra Gel Cream",
    category: "moisturisers",
    form: "pump",
    priceNaira: 46_000,
    rating: 4.6,
    reviewCount: 615,
    skinTypes: ["oily", "combination", "normal"],
    concerns: ["hydration", "pores"],
    description:
      "An oil-free gel cream with marine algae and niacinamide that hydrates intensely with a fresh, matte finish.",
    howToUse: "Smooth over face and neck after serum, morning and evening.",
    keyIngredients: ["Algae Extract", "Niacinamide", "Sodium Hyaluronate"],
    daysAgo: 200,
  },
  {
    slug: "orris-sleeping-mask",
    name: "Orris Sleeping Mask",
    category: "masks",
    form: "jar",
    priceNaira: 42_000,
    rating: 4.7,
    reviewCount: 361,
    badge: "New",
    skinTypes: ["dry", "normal", "sensitive"],
    concerns: ["hydration", "firmness"],
    description:
      "A jelly-cream overnight mask that locks in moisture with orris root and ceramides for a plump, rested look.",
    howToUse: "Apply a generous layer as your final evening step two or three times a week.",
    keyIngredients: ["Iris Florentina Root Extract", "Ceramide NP", "Squalane"],
    daysAgo: 45,
  },
];

function curatedToProduct(seed: CuratedSeed, index: number): Product {
  const id = `ma-${String(index + 1).padStart(5, "0")}`;
  const variantCount = seed.category === "body" || seed.category === "eye-care" ? 2 : 3;
  const variants = buildVariants(id, seed.form, nairaToKobo(seed.priceNaira), variantCount);
  const createdAt = new Date(
    CATALOG_EPOCH + (CATALOG_SPAN_DAYS - seed.daysAgo) * DAY_MS,
  ).toISOString();
  return {
    id,
    slug: seed.slug,
    name: seed.name,
    categorySlug: seed.category,
    priceCents: variants[0].priceCents,
    compareAtCents: seed.compareAtNaira ? nairaToKobo(seed.compareAtNaira) : null,
    rating: seed.rating,
    reviewCount: seed.reviewCount,
    ...productImages(seed.category, index),
    badge: seed.badge ?? null,
    skinTypes: seed.skinTypes,
    concerns: seed.concerns,
    inStock: true,
    createdAt,
    description: seed.description,
    howToUse: seed.howToUse,
    ingredients: [...seed.keyIngredients, ...SUPPORTING_INCI.slice(0, 6)],
    variants,
  };
}

// ---------------------------------------------------------------------------
// Deterministic generator for the long tail of the catalogue.
// ---------------------------------------------------------------------------

const CATEGORY_SLUGS = Object.keys(BLUEPRINTS);

function generateProduct(index: number): Product {
  const rand = prng(index * 2654435761);
  const id = `ma-${String(index + 1).padStart(5, "0")}`;
  const categorySlug = CATEGORY_SLUGS[index % CATEGORY_SLUGS.length];
  const blueprint = BLUEPRINTS[categorySlug];

  const descriptor = pick(rand, DESCRIPTORS);
  const hero = pick(rand, HEROES);
  const type = pick(rand, blueprint.types);
  const form = pick(rand, blueprint.forms);
  const name = `${descriptor} ${hero.name} ${type}`;

  const basePrice = roundToNaira(nairaToKobo(blueprint.basePriceNaira) * (0.75 + rand() * 0.9));
  const variants = buildVariants(id, form, basePrice, 1 + Math.floor(rand() * 3));
  const onSale = rand() < 0.08;
  const reviewCount = Math.floor(rand() ** 2.2 * 2400);
  const rating = Math.round((3.8 + rand() * 1.2) * 10) / 10;
  const daysSinceEpoch = Math.floor(rand() * CATALOG_SPAN_DAYS);
  const badgeRoll = rand();
  const badge: ProductBadge | null =
    daysSinceEpoch > CATALOG_SPAN_DAYS - 45
      ? "New"
      : reviewCount > 1800
        ? "Bestseller"
        : badgeRoll < 0.015
          ? "Limited"
          : null;

  const supporting = shuffle(rand, SUPPORTING_INCI).slice(0, 5 + Math.floor(rand() * 4));

  return {
    id,
    slug: `${slugify(name)}-${index + 1}`,
    name,
    categorySlug,
    priceCents: variants[0].priceCents,
    compareAtCents: onSale ? roundToNaira(variants[0].priceCents * 1.25) : null,
    rating: Math.min(5, rating),
    reviewCount,
    ...productImages(categorySlug, index),
    badge,
    skinTypes: hero.skinTypes,
    concerns: hero.concerns,
    inStock: rand() > 0.04,
    createdAt: new Date(CATALOG_EPOCH + daysSinceEpoch * DAY_MS).toISOString(),
    description: `A ${type.toLowerCase()} built around ${hero.name.toLowerCase()} that ${hero.benefit}. Formulated without fragrance allergens, tested under dermatological supervision and suitable for ${hero.skinTypes.join(", ")} skin.`,
    howToUse: `Use as part of your morning and/or evening routine. Apply to clean skin and follow with SPF during the day.`,
    ingredients: [hero.inci, ...supporting],
    variants,
  };
}

let catalogue: Product[] | null = null;

/** Returns the full demo catalogue. Built once per server instance (~50 ms). */
export function getDemoCatalogue(): Product[] {
  if (!catalogue) {
    const curated = CURATED.map(curatedToProduct);
    const generated = Array.from({ length: CATALOG_SIZE - curated.length }, (_, i) =>
      generateProduct(i + curated.length),
    );
    catalogue = [...curated, ...generated];
  }
  return catalogue;
}

/** Number of hand-written hero products at the start of the catalogue. */
export const CURATED_COUNT = CURATED.length;
