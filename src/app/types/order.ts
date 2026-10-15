export const ORDER_STATUSES = [
  "pending",
  "paid",
  "fulfilled",
  "failed",
  "cancelled",
  "refunded",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface ShippingAddress {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postcode?: string;
  country: string;
  phone: string;
}

export interface OrderItem {
  productId: string;
  productSlug: string;
  name: string;
  variantLabel: string;
  image: string;
  unitPriceCents: number;
  quantity: number;
}

export interface Order {
  id: string;
  email: string;
  status: OrderStatus;
  currency: string;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  shippingAddress: ShippingAddress | null;
  createdAt: string;
  items: OrderItem[];
}
