"use client";

import {
  createContext,
  useCallback,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createCartStore, type CartStore } from "@/app/cart-store";
import { calculateTotals } from "@/app/lib/pricing";
import type { CartItem, CartTotals } from "@/app/types/cart";

export interface CartContextValue {
  items: CartItem[];
  totals: CartTotals;
  /** Whether the slide-over bag drawer is open. */
  isOpen: boolean;
  openCart(): void;
  closeCart(): void;
  addItem(item: Omit<CartItem, "quantity">, quantity?: number): void;
  removeItem(variantId: string): void;
  updateQuantity(variantId: string, quantity: number): void;
  replaceItems(items: CartItem[]): void;
  clear(): void;
}

export const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [store] = useState<CartStore>(() => createCartStore());
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  const [isOpen, setIsOpen] = useState(false);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const value = useMemo<CartContextValue>(
    () => ({
      items: state.items,
      totals: calculateTotals(state.items),
      isOpen,
      openCart,
      closeCart,
      addItem: (item, quantity) => store.dispatch({ type: "add", item, quantity }),
      removeItem: (variantId) => store.dispatch({ type: "remove", variantId }),
      updateQuantity: (variantId, quantity) =>
        store.dispatch({ type: "setQuantity", variantId, quantity }),
      replaceItems: (items) => store.dispatch({ type: "replace", items }),
      clear: () => store.dispatch({ type: "clear" }),
    }),
    [state, store, isOpen, openCart, closeCart],
  );

  return <CartContext value={value}>{children}</CartContext>;
}
