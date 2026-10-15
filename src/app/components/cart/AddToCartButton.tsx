"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/app/components/ui/Button";
import { CheckIcon } from "@/app/components/ui/Icons";
import { useCart } from "@/app/hooks/use-cart";
import type { CartItem } from "@/app/types/cart";

interface AddToCartButtonProps {
  item: Omit<CartItem, "quantity">;
  quantity?: number;
  disabled?: boolean;
  className?: string;
}

export function AddToCartButton({ item, quantity = 1, disabled, className }: AddToCartButtonProps) {
  const { addItem, openCart } = useCart();
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const onClick = () => {
    addItem(item, quantity);
    openCart();
    setAdded(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 3000);
  };

  return (
    <div className={className}>
      <Button size="lg" className="w-full" onClick={onClick} disabled={disabled} data-testid="add-to-cart">
        {disabled ? (
          "Sold out"
        ) : added ? (
          <>
            <CheckIcon className="size-5" /> Added to bag
          </>
        ) : (
          "Add to bag"
        )}
      </Button>
      <p aria-live="polite" className="mt-3 min-h-5 text-center text-sm text-taupe">
        {added && (
          <>
            {item.name} ({item.variantLabel}) added.{" "}
            <Link href="/cart" className="text-burgundy-700 underline underline-offset-4">
              View bag
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
