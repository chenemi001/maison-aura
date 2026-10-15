import { MAX_QUANTITY_PER_LINE } from "@/app/lib/pricing";
import type { CartItem, CartState } from "@/app/types/cart";

/**
 * Framework-agnostic cart store.
 *
 * - `cartReducer` is a pure function (fully unit-tested).
 * - `createCartStore` wraps it in a tiny external store compatible with
 *   React's `useSyncExternalStore`, persisting to `localStorage` and syncing
 *   across browser tabs via the `storage` event.
 */

export const CART_STORAGE_KEY = "maison-aura:cart:v1";
export const MAX_CART_LINES = 50;
export const EMPTY_CART: CartState = Object.freeze({ items: [] }) as CartState;

export type CartAction =
  | { type: "add"; item: Omit<CartItem, "quantity">; quantity?: number }
  | { type: "remove"; variantId: string }
  | { type: "setQuantity"; variantId: string; quantity: number }
  | { type: "replace"; items: CartItem[] }
  | { type: "clear" };

const clampQuantity = (n: number) =>
  Math.max(1, Math.min(MAX_QUANTITY_PER_LINE, Math.floor(Number.isFinite(n) ? n : 1)));

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "add": {
      const quantity = clampQuantity(action.quantity ?? 1);
      const existing = state.items.find((i) => i.variantId === action.item.variantId);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.variantId === action.item.variantId
              ? { ...i, ...action.item, quantity: clampQuantity(i.quantity + quantity) }
              : i,
          ),
        };
      }
      if (state.items.length >= MAX_CART_LINES) return state;
      return { items: [...state.items, { ...action.item, quantity }] };
    }
    case "remove":
      return { items: state.items.filter((i) => i.variantId !== action.variantId) };
    case "setQuantity":
      if (action.quantity <= 0) {
        return { items: state.items.filter((i) => i.variantId !== action.variantId) };
      }
      return {
        items: state.items.map((i) =>
          i.variantId === action.variantId ? { ...i, quantity: clampQuantity(action.quantity) } : i,
        ),
      };
    case "replace":
      return { items: action.items.slice(0, MAX_CART_LINES) };
    case "clear":
      return EMPTY_CART;
  }
}

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.productId === "string" &&
    typeof v.variantId === "string" &&
    typeof v.slug === "string" &&
    typeof v.name === "string" &&
    typeof v.variantLabel === "string" &&
    typeof v.image === "string" &&
    typeof v.unitPriceCents === "number" &&
    Number.isInteger(v.unitPriceCents) &&
    v.unitPriceCents >= 0 &&
    typeof v.quantity === "number"
  );
}

/** Parses persisted cart JSON defensively — corrupt or tampered data yields an empty cart. */
export function parseStoredCart(raw: string | null): CartState {
  if (!raw) return EMPTY_CART;
  try {
    const parsed = JSON.parse(raw) as { items?: unknown };
    if (!Array.isArray(parsed.items)) return EMPTY_CART;
    const items = parsed.items
      .filter(isCartItem)
      .slice(0, MAX_CART_LINES)
      .map((i) => ({ ...i, quantity: clampQuantity(i.quantity) }));
    return items.length ? { items } : EMPTY_CART;
  } catch {
    return EMPTY_CART;
  }
}

export interface CartStore {
  getSnapshot(): CartState;
  getServerSnapshot(): CartState;
  subscribe(listener: () => void): () => void;
  dispatch(action: CartAction): void;
}

export function createCartStore(
  storage: Pick<Storage, "getItem" | "setItem" | "removeItem"> | null = safeLocalStorage(),
): CartStore {
  let state: CartState | null = null;
  const listeners = new Set<() => void>();

  const read = () => {
    try {
      return parseStoredCart(storage?.getItem(CART_STORAGE_KEY) ?? null);
    } catch {
      return EMPTY_CART;
    }
  };

  const emit = () => listeners.forEach((l) => l());

  const getSnapshot = () => {
    state ??= read();
    return state;
  };

  const onStorage = (event: StorageEvent) => {
    if (event.key !== CART_STORAGE_KEY) return;
    state = read();
    emit();
  };

  return {
    getSnapshot,
    getServerSnapshot() {
      return EMPTY_CART;
    },
    subscribe(listener) {
      listeners.add(listener);
      if (listeners.size === 1 && typeof window !== "undefined") {
        window.addEventListener("storage", onStorage);
      }
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0 && typeof window !== "undefined") {
          window.removeEventListener("storage", onStorage);
        }
      };
    },
    dispatch(action) {
      const next = cartReducer(getSnapshot(), action);
      if (next === state) return;
      state = next;
      try {
        if (next.items.length) storage?.setItem(CART_STORAGE_KEY, JSON.stringify(next));
        else storage?.removeItem(CART_STORAGE_KEY);
      } catch {
        // Storage may be full or disabled (private mode); keep in-memory state.
      }
      emit();
    },
  };
}

function safeLocalStorage(): Storage | null {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
}
