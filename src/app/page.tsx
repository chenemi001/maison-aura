import type { Metadata } from "next";
import Image from "next/image";
import { CategoryShowcase } from "@/app/components/home/CategoryShowcase";
import { EditorialSplit } from "@/app/components/home/EditorialSplit";
import { FeaturedProducts } from "@/app/components/home/FeaturedProducts";
import { Hero } from "@/app/components/home/Hero";
import { Marquee } from "@/app/components/home/Marquee";
import { Newsletter } from "@/app/components/home/Newsletter";
import { Reveal } from "@/app/components/motion/Reveal";
import { EDITORIAL } from "@/app/data/images";
import { getCategories, getFeaturedProducts, getNewArrivals } from "@/app/lib/products";
import { SITE_DESCRIPTION, SITE_NAME, absoluteUrl } from "@/app/lib/seo";

export const metadata: Metadata = {
  title: { absolute: `${SITE_NAME} — Luxury Skincare, Considered` },
  description: SITE_DESCRIPTION,
  alternates: { canonical: absoluteUrl("/") },
};

const PILLARS = [
  {
    title: "Clinically considered",
    body: "Every formula is built around actives with published clinical evidence, at effective concentrations.",
  },
  {
    title: "Kind by design",
    body: "Vegan, cruelty-free and free from the fragrance allergens most likely to irritate.",
  },
  {
    title: "Refill, don't replace",
    body: "Heavy glass vessels designed to be kept, with refills that use 70% less packaging.",
  },
];

export default async function HomePage() {
  const [bestsellers, newArrivals, categories] = await Promise.all([
    getFeaturedProducts(8),
    getNewArrivals(4),
    getCategories(),
  ]);

  return (
    <>
      <Hero />
      <Marquee />

      <FeaturedProducts
        id="bestsellers-heading"
        eyebrow="Most loved"
        title="Bestsellers"
        products={bestsellers}
        viewAllHref="/products"
      />

      <EditorialSplit />

      <CategoryShowcase categories={categories} />

      <section aria-labelledby="pillars-heading" className="container-page mt-28">
        <div className="grid items-center gap-12 md:grid-cols-[1fr_1.2fr] lg:gap-20">
          <Reveal className="relative aspect-[4/5] overflow-hidden bg-stone">
            <Image
              src={EDITORIAL.serumApply}
              alt="A woman smoothing moisturiser onto her cheek"
              fill
              sizes="(min-width: 768px) 45vw, 100vw"
              className="object-cover"
            />
          </Reveal>
          <div>
            <Reveal>
              <p className="eyebrow">Our philosophy</p>
              <h2 id="pillars-heading" className="mt-3 font-display text-5xl uppercase md:text-7xl">
                Less, but better.
              </h2>
            </Reveal>
            <ul className="mt-12 space-y-8">
              {PILLARS.map((pillar, i) => (
                <li key={pillar.title}>
                  <Reveal delay={0.1 * i} y={16} className="grid gap-2 border-t border-beige-300 pt-6 sm:grid-cols-[14rem_1fr]">
                    <h3 className="font-serif text-2xl text-burgundy-800">{pillar.title}</h3>
                    <p className="text-sm leading-relaxed text-taupe">{pillar.body}</p>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <FeaturedProducts
        id="new-heading"
        eyebrow="Just arrived"
        title="New in"
        products={newArrivals}
        viewAllHref="/products?sort=newest"
      />

      <Newsletter />
    </>
  );
}
