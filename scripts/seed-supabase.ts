/**
 * Seeds Supabase with the categories and the 50,000-product demo catalogue.
 *
 *   npm run db:seed
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in `.env.local`
 * (or the environment). Idempotent: rows are upserted by primary key.
 * Afterwards set CATALOG_SOURCE=supabase to serve products from the database.
 */
import { existsSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { CATEGORIES } from "../src/app/data/categories";
import { CURATED_COUNT, getDemoCatalogue } from "../src/app/data/products";
import { popularityScore } from "../src/app/lib/catalog/types";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY.");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });
const BATCH_SIZE = 1000;

async function main() {
  const { error: categoryError } = await supabase.from("categories").upsert(
    CATEGORIES.map((c, position) => ({ ...c, position })),
    { onConflict: "slug" },
  );
  if (categoryError) throw categoryError;
  console.log(`✓ ${CATEGORIES.length} categories`);

  const products = getDemoCatalogue();
  for (let start = 0; start < products.length; start += BATCH_SIZE) {
    const rows = products.slice(start, start + BATCH_SIZE).map((p, i) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      category_slug: p.categorySlug,
      description: p.description,
      how_to_use: p.howToUse,
      ingredients: p.ingredients,
      skin_types: p.skinTypes,
      concerns: p.concerns,
      price_cents: p.priceCents,
      compare_at_cents: p.compareAtCents,
      rating: p.rating,
      review_count: p.reviewCount,
      image: p.image,
      images: p.images,
      badge: p.badge,
      in_stock: p.inStock,
      popularity: popularityScore(p, start + i < CURATED_COUNT),
      variants: p.variants,
      search_terms: [...p.concerns, ...p.skinTypes, ...p.ingredients.slice(0, 3)].join(" "),
      created_at: p.createdAt,
      updated_at: p.createdAt,
    }));
    const { error } = await supabase.from("products").upsert(rows, { onConflict: "id" });
    if (error) throw error;
    process.stdout.write(`\r✓ ${Math.min(start + BATCH_SIZE, products.length).toLocaleString()} / ${products.length.toLocaleString()} products`);
  }
  console.log("\nDone. Set CATALOG_SOURCE=supabase to serve the catalogue from the database.");
}

main().catch((error) => {
  console.error("\nSeeding failed:", error.message ?? error);
  process.exit(1);
});
