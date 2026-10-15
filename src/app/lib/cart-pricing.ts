import "server-only";
import { getProductsForCheckout } from "@/app/lib/products";
import { calculateTotals, MAX_QUANTITY_PER_LINE } from "@/app/lib/pricing";
import type { CartLineInput } from "@/app/lib/validations";
import type { CartTotals } from "@/app/types/cart";
import type { Product, ProductVariant } from "@/app/types/product";

export interface PricedLine {
  product: Product;
  variant: ProductVariant;
  quantity: number;
  unitPriceCents: number;
}

export interface CartIssue {
  productId: string;
  variantId: string;
  reason: "unavailable" | "out_of_stock";
}

export interface RepricedCart {
  lines: PricedLine[];
  issues: CartIssue[];
  totals: CartTotals;
}

/**
 * Re-prices a cart against the catalogue (the source of truth). Client-sent
 * prices are ignored entirely; only product/variant IDs and quantities are
 * trusted, and those have already been validated by `cartLinesSchema`.
 */
export async function repriceCart(input: CartLineInput[]): Promise<RepricedCart> {
  // Merge duplicate lines so quantity limits can't be bypassed by splitting.
  const merged = new Map<string, CartLineInput>();
  for (const line of input) {
    const key = line.variantId;
    const existing = merged.get(key);
    merged.set(key, existing ? { ...line, quantity: existing.quantity + line.quantity } : line);
  }

  const ids = Array.from(new Set(input.map((l) => l.productId)));
  const products = new Map((await getProductsForCheckout(ids)).map((p) => [p.id, p]));

  const lines: PricedLine[] = [];
  const issues: CartIssue[] = [];
  for (const line of merged.values()) {
    const product = products.get(line.productId);
    const variant = product?.variants.find((v) => v.id === line.variantId);
    if (!product || !variant) {
      issues.push({ productId: line.productId, variantId: line.variantId, reason: "unavailable" });
      continue;
    }
    if (!product.inStock) {
      issues.push({ productId: line.productId, variantId: line.variantId, reason: "out_of_stock" });
      continue;
    }
    lines.push({
      product,
      variant,
      quantity: Math.min(line.quantity, MAX_QUANTITY_PER_LINE),
      unitPriceCents: variant.priceCents,
    });
  }

  return { lines, issues, totals: calculateTotals(lines) };
}
