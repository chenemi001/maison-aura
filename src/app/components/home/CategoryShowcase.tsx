import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/app/components/motion/Reveal";
import { cn } from "@/app/lib/utils";
import type { Category } from "@/app/types/category";

/** Editorial bento grid: two feature tiles followed by smaller tiles. */
const LAYOUT = [
  "md:col-span-2 md:row-span-2 aspect-[4/5] md:aspect-auto",
  "md:col-span-2 aspect-[4/5] md:aspect-[2/1]",
  "aspect-[4/5]",
  "aspect-[4/5]",
  "aspect-[4/5]",
  "aspect-[4/5]",
  "aspect-[4/5]",
  "aspect-[4/5]",
];

export function CategoryShowcase({ categories }: { categories: Category[] }) {
  return (
    <section aria-labelledby="categories-heading" className="container-page mt-28">
      <Reveal className="mb-12 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow">Shop by ritual</p>
          <h2 id="categories-heading" className="mt-3 font-display text-5xl uppercase md:text-6xl">
            Every step, considered
          </h2>
        </div>
        <p className="max-w-sm text-sm leading-relaxed text-taupe">
          From the first cleanse to the final seal — eight families of formulas, each designed to work beautifully
          alone or together.
        </p>
      </Reveal>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:gap-4">
        {categories.map((category, i) => (
          <li key={category.slug} className={cn("relative", LAYOUT[i] ?? "aspect-[4/5]")}>
            <Link
              href={`/categories/${category.slug}`}
              className="group absolute inset-0 block overflow-hidden bg-stone"
            >
              <Image
                src={category.image}
                alt=""
                fill
                sizes={i < 2 ? "(min-width: 768px) 50vw, 50vw" : "(min-width: 768px) 25vw, 50vw"}
                className="object-cover transition-transform duration-[1.4s] ease-[var(--ease-luxe)] group-hover:scale-[1.06]"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent transition-opacity duration-500 group-hover:opacity-90"
              />
              <div className="absolute inset-x-0 bottom-0 p-4 text-porcelain sm:p-6">
                <p className="text-[10px] font-medium tracking-[0.25em] uppercase opacity-80">{category.tagline}</p>
                <h3 className={cn("mt-1 font-display uppercase", i < 2 ? "text-3xl md:text-5xl" : "text-2xl md:text-3xl")}>
                  {category.name}
                </h3>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
