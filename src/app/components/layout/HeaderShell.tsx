"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Sticky site header wrapper. Flags `data-scrolled` once the page moves so
 * CSS can switch the header from transparent (over a hero) to solid.
 */
export function HeaderShell({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const header = ref.current;
    if (!header) return;
    const update = () => header.setAttribute("data-scrolled", String(window.scrollY > 24));
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <header
      ref={ref}
      className="site-header sticky top-0 z-40 border-b border-beige-200/80 bg-cream/85 text-ink backdrop-blur-md"
    >
      {children}
    </header>
  );
}
