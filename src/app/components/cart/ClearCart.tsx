"use client";

import { useEffect, useRef } from "react";
import { useCart } from "@/app/hooks/use-cart";

/** Empties the bag once the server has confirmed a paid order. Renders nothing. */
export function ClearCart() {
  const { clear } = useCart();
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    clear();
  }, [clear]);
  return null;
}
