export interface CartItem {
  productId: string;
  variantId: string;
  slug: string;
  name: string;
  variantLabel: string;
  image: string;
  /**
   * Price shown when the item was added. Display only — the server always
   * re-prices the cart from the catalogue before taking payment.
   */
  unitPriceCents: number;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
}

export interface CartTotals {
  itemCount: number;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  freeShippingRemainingCents: number;
}
