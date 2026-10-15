"use client";

import { use } from "react";
import { CartContext, type CartContextValue } from "@/app/providers/CartProvider";

export function useCart(): CartContextValue {
  const context = use(CartContext);
  if (!context) throw new Error("useCart must be used within <CartProvider>");
  return context;
}
