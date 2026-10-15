import type { Metadata } from "next";
import { ProductSearch } from "@/app/components/products/ProductSearch";
import { ButtonLink } from "@/app/components/ui/Button";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <div className="container-page flex flex-col items-center py-24 text-center">
      <p className="eyebrow">Error 404</p>
      <h1 className="mt-3 text-4xl md:text-6xl">This page has drifted away</h1>
      <p className="mt-4 max-w-md text-taupe">
        The page you were looking for may have moved or no longer exists. Try a search, or continue
        exploring the collection.
      </p>
      <ProductSearch className="mt-10 w-full max-w-lg" />
      <ButtonLink href="/products" variant="outline" className="mt-6">
        Shop all products
      </ButtonLink>
    </div>
  );
}
