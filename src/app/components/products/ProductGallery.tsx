"use client";

import { AnimatePresence, m } from "motion/react";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/app/lib/utils";

interface ProductGalleryProps {
  images: string[];
  name: string;
}

const ALT_SUFFIX = ["", " — alternate view", " — texture close-up"];

export function ProductGallery({ images, name }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const altFor = (i: number) => `${name}${ALT_SUFFIX[i] ?? ""}`;

  return (
    <div className="flex flex-col-reverse gap-3 lg:flex-row">
      {images.length > 1 && (
        <ul className="flex gap-3 lg:flex-col" aria-label="Product images">
          {images.map((src, i) => (
            <li key={src}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show image ${i + 1} of ${images.length}`}
                aria-pressed={active === i}
                className={cn(
                  "relative block aspect-[4/5] w-18 overflow-hidden bg-stone transition-opacity lg:w-22",
                  active === i ? "opacity-100 ring-1 ring-ink ring-offset-2 ring-offset-cream" : "opacity-60 hover:opacity-100",
                )}
              >
                <Image src={src} alt="" fill sizes="88px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="relative aspect-[4/5] flex-1 overflow-hidden bg-stone">
        {/* The first image stays mounted so it remains the page's LCP element. */}
        <Image
          src={images[0]}
          alt={altFor(0)}
          fill
          preload
          loading="eager"
          quality={90}
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
        <AnimatePresence>
          {active > 0 && (
            <m.div
              key={images[active]}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <Image
                src={images[active]}
                alt={altFor(active)}
                fill
                quality={90}
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
