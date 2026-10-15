import { ProductGrid } from "@/app/components/products/ProductGrid";
import { getRelatedProducts } from "@/app/lib/products";

export async function RelatedProducts({ slug }: { slug: string }) {
  const products = await getRelatedProducts(slug, 4);
  if (products.length === 0) return null;

  return (
    <section aria-labelledby="related-heading" className="mt-24">
      <p className="eyebrow">Complete the ritual</p>
      <h2 id="related-heading" className="mt-2 mb-10 text-3xl md:text-4xl">
        You may also love
      </h2>
      <ProductGrid products={products} label="Related products" />
    </section>
  );
}
