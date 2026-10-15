"use client";

import { m } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { buttonClasses } from "@/app/components/ui/Button";
import { EDITORIAL } from "@/app/data/images";

const ease = [0.22, 1, 0.36, 1] as const;

/** Masked line reveal: each line rises out of an overflow-hidden slot. */
function Line({ children, delay }: { children: ReactNode; delay: number }) {
  return (
    <span className="block overflow-hidden pb-[0.06em]">
      <m.span
        className="block"
        initial={{ y: "105%" }}
        animate={{ y: 0 }}
        transition={{ duration: 1.2, delay, ease }}
      >
        {children}
      </m.span>
    </span>
  );
}

/**
 * Full-bleed editorial hero. `data-hero` tells the header (via CSS `:has`) to
 * sit transparently over the photograph until the visitor scrolls.
 */
export function Hero() {
  return (
    <section
      data-hero
      aria-labelledby="hero-heading"
      className="relative -mt-16 grid min-h-[100svh] bg-ink md:grid-cols-[1.65fr_1fr] lg:-mt-[4.5rem]"
    >
      <div className="relative min-h-[100svh] overflow-hidden md:min-h-0">
        <m.div
          className="absolute inset-0"
          initial={{ scale: 1.12 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.6, ease }}
        >
          <Image
            src={EDITORIAL.heroPortrait}
            alt="A woman with luminous, glowing skin resting her hand against her face"
            fill
            preload
            loading="eager"
            quality={90}
            sizes="(min-width: 768px) 62vw, 100vw"
            className="object-cover object-[50%_30%]"
          />
        </m.div>
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(20,10,8,.5)_0%,transparent_24%,transparent_40%,rgba(20,10,8,.78)_100%)]"
        />

        <div className="absolute inset-x-0 bottom-0 px-5 pb-10 text-porcelain sm:px-8 md:px-12 md:pb-14">
          <m.p
            className="mb-4 text-[11px] font-medium tracking-[0.3em] uppercase"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.9, ease }}
          >
            Rituals born from science &amp; botanicals
          </m.p>
          <h1
            id="hero-heading"
            className="font-display text-[clamp(4.2rem,15vw,12.5rem)] leading-[0.82] font-normal tracking-[0.03em] uppercase"
          >
            <Line delay={0.2}>Maison</Line>{" "}
            <Line delay={0.38}>
              <span className="pl-[0.9em]">Aura</span>
            </Line>
            <span className="sr-only"> — luxury skincare, considered</span>
          </h1>
          <m.div
            className="mt-8 flex flex-wrap items-center gap-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.1, ease }}
          >
            <Link href="/products" className={buttonClasses("light", "lg")}>
              Shop the collection
            </Link>
            <Link
              href="/categories/serums"
              className={buttonClasses(
                "outline",
                "lg",
                "border-porcelain/70 text-porcelain hover:border-porcelain hover:bg-porcelain hover:text-ink",
              )}
            >
              Discover serums
            </Link>
          </m.div>
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-sand md:block">
        <m.div
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.8, delay: 0.3, ease }}
        >
          <Image
            src={EDITORIAL.heroProduct}
            alt="Maison Aura cream cleanser in a soft tube"
            fill
            sizes="38vw"
            className="object-cover"
          />
        </m.div>
        {/* Keeps the overlaid header icons legible against the pale photograph. */}
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/35 to-transparent" />
        <m.div
          className="absolute inset-x-8 bottom-12 flex flex-col items-start gap-4 lg:inset-x-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.3, ease }}
        >
          <p className="text-[11px] font-medium tracking-[0.3em] text-ink/70 uppercase">The cleansing ritual</p>
          <p className="max-w-[16rem] font-serif text-2xl leading-tight text-ink">
            Soft-focus cleansers that respect your barrier.
          </p>
          <Link href="/categories/cleansers" className={buttonClasses("secondary", "md", "bg-[#8b7764] hover:bg-ink")}>
            Shop now
          </Link>
        </m.div>
      </div>
    </section>
  );
}
