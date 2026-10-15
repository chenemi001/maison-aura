import { ProductCard } from "@/app/components/products/ProductCard";
import type { ProductSummary } from "@/app/types/product";

interface ProductGridProps {
  products: ProductSummary[];
  /** Number of leading cards whose images are preloaded (LCP candidates). */
  preloadCount?: number;
  label?: string;
}

export function ProductGrid({ products, preloadCount = 0, label = "Products" }: ProductGridProps) {
  return (
    <ul
      aria-label={label}
      className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6"
    >
      {products.map((product, i) => (
        <li key={product.id} className="flex">
          <ProductCard product={product} preload={i < preloadCount} />
        </li>
      ))}
    </ul>
  );
}
