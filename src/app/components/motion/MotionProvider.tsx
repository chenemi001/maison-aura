"use client";

import { LazyMotion, MotionConfig, domAnimation } from "motion/react";
import type { ReactNode } from "react";

/**
 * Framer Motion setup.
 *
 * - `LazyMotion` + `m` components keep the initial bundle small: only the
 *   DOM animation features are loaded, not the full `motion` component.
 * - `reducedMotion="user"` honours the OS "reduce motion" setting by
 *   disabling transform/layout animations automatically.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user" transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}
