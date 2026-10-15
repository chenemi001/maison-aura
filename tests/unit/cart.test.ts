import { describe, expect, it, vi } from "vitest";
import {
  CART_STORAGE_KEY,
  EMPTY_CART,
  MAX_CART_LINES,
  cartReducer,
  createCartStore,
  parseStoredCart,
} from "@/app/cart-store";
import {
  FREE_SHIPPING_THRESHOLD_CENTS,
  MAX_QUANTITY_PER_LINE,
  STANDARD_SHIPPING_CENTS,
  calculateTotals,
} from "@/app/lib/pricing";
import type { CartItem } from "@/app/types/cart";

const item = (overrides: Partial<CartItem> = {}): Omit<CartItem, "quantity"> => ({
  productId: "ma-00001",
  variantId: "ma-00001-30ml",
  slug: "aura-renewal-serum",
  name: "Aura Renewal Serum",
  variantLabel: "30 ml",
  image: "/images/products/dropper-claret.svg",
  unitPriceCents: 6800,
  ...overrides,
});

describe("cartReducer", () => {
  it("adds a new line with the requested quantity", () => {
    const state = cartReducer(EMPTY_CART, { type: "add", item: item(), quantity: 2 });
    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(2);
  });

  it("merges repeated adds of the same variant", () => {
    let state = cartReducer(EMPTY_CART, { type: "add", item: item() });
    state = cartReducer(state, { type: "add", item: item(), quantity: 3 });
    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(4);
  });

  it("keeps different variants of the same product as separate lines", () => {
    let state = cartReducer(EMPTY_CART, { type: "add", item: item() });
    state = cartReducer(state, { type: "add", item: item({ variantId: "ma-00001-50ml" }) });
    expect(state.items).toHaveLength(2);
  });

  it("clamps quantity to the per-line maximum", () => {
    let state = cartReducer(EMPTY_CART, { type: "add", item: item(), quantity: 8 });
    state = cartReducer(state, { type: "add", item: item(), quantity: 8 });
    expect(state.items[0].quantity).toBe(MAX_QUANTITY_PER_LINE);
    state = cartReducer(state, { type: "setQuantity", variantId: item().variantId, quantity: 999 });
    expect(state.items[0].quantity).toBe(MAX_QUANTITY_PER_LINE);
  });

  it("never stores fractional, zero or invalid quantities", () => {
    const state = cartReducer(EMPTY_CART, { type: "add", item: item(), quantity: Number.NaN });
    expect(state.items[0].quantity).toBe(1);
    const fractional = cartReducer(EMPTY_CART, { type: "add", item: item(), quantity: 2.7 });
    expect(fractional.items[0].quantity).toBe(2);
  });

  it("removes a line when its quantity is set to zero", () => {
    const state = cartReducer(
      cartReducer(EMPTY_CART, { type: "add", item: item() }),
      { type: "setQuantity", variantId: item().variantId, quantity: 0 },
    );
    expect(state.items).toHaveLength(0);
  });

  it("removes and clears lines", () => {
    let state = cartReducer(EMPTY_CART, { type: "add", item: item() });
    state = cartReducer(state, { type: "add", item: item({ variantId: "other" }) });
    state = cartReducer(state, { type: "remove", variantId: "other" });
    expect(state.items.map((i) => i.variantId)).toEqual([item().variantId]);
    expect(cartReducer(state, { type: "clear" })).toBe(EMPTY_CART);
  });

  it("caps the number of distinct lines", () => {
    let state = EMPTY_CART;
    for (let i = 0; i < MAX_CART_LINES + 5; i++) {
      state = cartReducer(state, { type: "add", item: item({ variantId: `v-${i}` }) });
    }
    expect(state.items).toHaveLength(MAX_CART_LINES);
  });
});

describe("parseStoredCart", () => {
  it("returns an empty cart for missing or corrupt data", () => {
    expect(parseStoredCart(null)).toBe(EMPTY_CART);
    expect(parseStoredCart("{not json")).toBe(EMPTY_CART);
    expect(parseStoredCart(JSON.stringify({ items: "nope" }))).toBe(EMPTY_CART);
  });

  it("drops malformed lines and sanitises quantities", () => {
    const raw = JSON.stringify({
      items: [
        { ...item(), quantity: 500 },
        { ...item({ variantId: "bad" }), unitPriceCents: -1, quantity: 1 },
        { productId: 42 },
      ],
    });
    const cart = parseStoredCart(raw);
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].quantity).toBe(MAX_QUANTITY_PER_LINE);
  });
});

describe("createCartStore", () => {
  const memoryStorage = () => {
    const data = new Map<string, string>();
    return {
      data,
      getItem: (k: string) => data.get(k) ?? null,
      setItem: (k: string, v: string) => void data.set(k, v),
      removeItem: (k: string) => void data.delete(k),
    };
  };

  it("hydrates from storage, persists changes and notifies subscribers", () => {
    const storage = memoryStorage();
    storage.setItem(CART_STORAGE_KEY, JSON.stringify({ items: [{ ...item(), quantity: 1 }] }));
    const store = createCartStore(storage);
    const listener = vi.fn();
    store.subscribe(listener);

    expect(store.getSnapshot().items).toHaveLength(1);
    store.dispatch({ type: "add", item: item(), quantity: 2 });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(JSON.parse(storage.data.get(CART_STORAGE_KEY)!).items[0].quantity).toBe(3);

    store.dispatch({ type: "clear" });
    expect(storage.data.has(CART_STORAGE_KEY)).toBe(false);
  });

  it("uses an empty server snapshot to avoid hydration mismatches", () => {
    const store = createCartStore(memoryStorage());
    expect(store.getServerSnapshot()).toBe(EMPTY_CART);
  });

  it("returns a stable snapshot between changes (required by useSyncExternalStore)", () => {
    const store = createCartStore(memoryStorage());
    expect(store.getSnapshot()).toBe(store.getSnapshot());
  });

  it("keeps working when storage throws (e.g. Safari private mode)", () => {
    const store = createCartStore({
      getItem: () => {
        throw new Error("denied");
      },
      setItem: () => {
        throw new Error("quota");
      },
      removeItem: () => {},
    });
    store.dispatch({ type: "add", item: item() });
    expect(store.getSnapshot().items).toHaveLength(1);
  });
});

describe("calculateTotals", () => {
  it("charges standard delivery below the free-shipping threshold", () => {
    const totals = calculateTotals([{ unitPriceCents: 2200, quantity: 1 }]);
    expect(totals).toMatchObject({
      itemCount: 1,
      subtotalCents: 2200,
      shippingCents: STANDARD_SHIPPING_CENTS,
      totalCents: 2200 + STANDARD_SHIPPING_CENTS,
      freeShippingRemainingCents: FREE_SHIPPING_THRESHOLD_CENTS - 2200,
    });
  });

  it("ships free at or above the threshold", () => {
    const totals = calculateTotals([{ unitPriceCents: FREE_SHIPPING_THRESHOLD_CENTS / 2, quantity: 2 }]);
    expect(totals.shippingCents).toBe(0);
    expect(totals.freeShippingRemainingCents).toBe(0);
  });

  it("charges nothing for an empty bag", () => {
    expect(calculateTotals([])).toMatchObject({ subtotalCents: 0, shippingCents: 0, totalCents: 0 });
  });
});
