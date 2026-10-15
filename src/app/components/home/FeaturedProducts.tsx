import Link from "next/link";
import { Reveal } from "@/app/components/motion/Reveal";
import { ProductCard } from "@/app/components/products/ProductCard";
import type { ProductSummary } from "@/app/types/product";

interface FeaturedProductsProps {
  id: string;
  eyebrow: string;
  title: string;
  products: ProductSummary[];
  viewAllHref: string;
}

export function FeaturedProducts({ id, eyebrow, title, products, viewAllHref }: FeaturedProductsProps) {
  if (products.length === 0) return null;
  return (
    <section aria-labelledby={id} className="container-page mt-28">
      <Reveal className="mb-12 flex items-end justify-between gap-6">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2 id={id} className="mt-3 font-display text-5xl uppercase md:text-6xl">
            {title}
          </h2>
        </div>
        <Link
          href={viewAllHref}
          className="shrink-0 border-b border-ink pb-1 text-[11px] font-medium tracking-[0.2em] uppercase transition-colors hover:border-burgundy-700 hover:text-burgundy-700"
        >
          View all<span className="sr-only"> {title.toLowerCase()}</span>
        </Link>
      </Reveal>
      <ul aria-label={title} className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-4 lg:gap-x-6">
        {products.map((product, i) => (
          <li key={product.id} className="flex">
            <Reveal delay={(i % 4) * 0.08} className="flex w-full">
              <ProductCard product={product} />
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
