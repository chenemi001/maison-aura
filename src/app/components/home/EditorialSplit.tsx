import Image from "next/image";
import { Reveal } from "@/app/components/motion/Reveal";
import { ButtonLink } from "@/app/components/ui/Button";
import { EDITORIAL } from "@/app/data/images";

const STEPS = [
  { n: "01", title: "Cleanse", body: "Melt away the day without stripping." },
  { n: "02", title: "Treat", body: "Three drops of concentrated actives." },
  { n: "03", title: "Seal", body: "Lock in comfort with a barrier cream." },
];

/** Burgundy editorial band introducing the three-step ritual. */
export function EditorialSplit() {
  return (
    <section aria-labelledby="ritual-heading" className="mt-28 grid bg-burgundy-800 text-porcelain md:grid-cols-2">
      <div className="relative min-h-[28rem] overflow-hidden md:min-h-[44rem]">
        <Image
          src={EDITORIAL.ritual}
          alt="A woman with radiant skin against a dark backdrop, hand resting on her cheek"
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover object-top"
        />
      </div>
      <div className="flex flex-col justify-center px-6 py-16 sm:px-12 lg:px-20">
        <Reveal>
          <p className="text-[11px] font-medium tracking-[0.3em] text-burgundy-100 uppercase">The Maison ritual</p>
          <h2 id="ritual-heading" className="mt-5 font-display text-5xl leading-[1.02] uppercase md:text-7xl">
            Three steps.
            <br />
            Nothing more.
          </h2>
          <p className="mt-6 max-w-md leading-relaxed text-burgundy-100">
            Fewer, better formulas — each one doing its work so beautifully that your routine becomes a moment
            you look forward to.
          </p>
        </Reveal>
        <ol className="mt-12 divide-y divide-porcelain/15 border-y border-porcelain/15">
          {STEPS.map((step, i) => (
            <li key={step.n}>
              <Reveal delay={0.1 * i} y={16} className="flex items-baseline gap-6 py-5">
                <span className="font-display text-sm tracking-[0.2em] text-burgundy-100">{step.n}</span>
                <span className="font-serif text-2xl">{step.title}</span>
                <span className="ml-auto hidden text-sm text-burgundy-100 sm:block">{step.body}</span>
              </Reveal>
            </li>
          ))}
        </ol>
        <Reveal delay={0.3} className="mt-10">
          <ButtonLink href="/categories/serums" variant="light" size="lg">
            Begin your ritual
          </ButtonLink>
        </Reveal>
      </div>
    </section>
  );
}
