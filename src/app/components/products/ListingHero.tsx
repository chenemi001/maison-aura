import Image from "next/image";
import { Reveal } from "@/app/components/motion/Reveal";
import { Breadcrumbs, type Crumb } from "@/app/components/ui/Breadcrumbs";

interface ListingHeroProps {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  crumbs: Crumb[];
}

/** Editorial banner for catalogue and category pages. */
export function ListingHero({ eyebrow, title, description, image, crumbs }: ListingHeroProps) {
  return (
    <header className="grid border-b border-beige-200 md:grid-cols-[1.15fr_1fr]">
      <div className="container-page flex flex-col justify-end py-10 md:mr-0 md:py-16 lg:pr-16">
        <Breadcrumbs items={crumbs} />
        <Reveal className="mt-10 md:mt-20">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-3 font-display text-6xl leading-[0.95] uppercase md:text-7xl lg:text-8xl">{title}</h1>
          <p className="mt-6 max-w-md leading-relaxed text-taupe">{description}</p>
        </Reveal>
      </div>
      <div className="relative hidden min-h-[22rem] overflow-hidden bg-stone md:block">
        <Image src={image} alt="" fill preload sizes="45vw" className="object-cover" />
      </div>
    </header>
  );
}
