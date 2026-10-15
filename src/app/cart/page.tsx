import type { Metadata } from "next";
import { CartView } from "@/app/components/cart/CartView";

export const metadata: Metadata = {
  title: "Your bag",
  robots: { index: false, follow: true },
};

export default function CartPage() {
  return (
    <div className="container-page py-10 md:py-14">
      <h1 className="mb-10 text-5xl md:text-6xl">Your bag</h1>
      <CartView />
    </div>
  );
}
