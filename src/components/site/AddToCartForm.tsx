"use client";

// The interactive "pick a size, pick a quantity, add to cart" widget on a
// product page. Needs "use client" because it holds form state and calls
// useCart() (see CartProvider.tsx).

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "./CartProvider";

type AvailableSize = { label: string; stock: number };

export function AddToCartForm({
  productId,
  slug,
  name,
  priceInMinorUnits,
  imageUrl,
  availableSizes,
}: {
  productId: string;
  slug: string;
  name: string;
  priceInMinorUnits: number;
  imageUrl: string;
  availableSizes: AvailableSize[];
}) {
  const { addItem } = useCart();
  const router = useRouter();

  const inStockSizes = availableSizes.filter((size) => size.stock > 0);
  const [selectedSize, setSelectedSize] = useState(inStockSizes[0]?.label ?? "");
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  if (availableSizes.length === 0) {
    return <p className="text-sm text-olive-dark/60">This piece is currently unavailable.</p>;
  }

  if (inStockSizes.length === 0) {
    return <p className="text-sm text-olive-dark/60">Out of stock in every size right now.</p>;
  }

  function handleAddToCart() {
    addItem({
      productId,
      slug,
      name,
      size: selectedSize,
      priceInMinorUnits,
      quantity,
      imageUrl,
    });
    setJustAdded(true);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 font-heading text-xs uppercase tracking-[0.15em] text-olive-dark/70">
          Size
        </p>
        <div className="flex flex-wrap gap-2">
          {availableSizes.map((size) => {
            const isOutOfStock = size.stock === 0;
            const isSelected = size.label === selectedSize;
            return (
              <button
                key={size.label}
                type="button"
                disabled={isOutOfStock}
                onClick={() => setSelectedSize(size.label)}
                className={`border px-4 py-2 text-sm transition ${
                  isOutOfStock
                    ? "cursor-not-allowed border-olive/15 text-olive-dark/30 line-through"
                    : isSelected
                      ? "border-olive-dark bg-olive-dark text-cream"
                      : "border-olive/30 text-olive-dark hover:border-olive-dark"
                }`}
              >
                UK {size.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-2 font-heading text-xs uppercase tracking-[0.15em] text-olive-dark/70">
          Quantity
        </p>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setQuantity((current) => Math.max(1, current - 1))}
            className="h-9 w-9 border border-olive/30 text-olive-dark hover:border-olive-dark"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="w-6 text-center">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((current) => current + 1)}
            className="h-9 w-9 border border-olive/30 text-olive-dark hover:border-olive-dark"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={handleAddToCart}
        className="w-full bg-olive-dark py-3 font-heading text-sm uppercase tracking-[0.15em] text-cream transition hover:bg-olive"
      >
        Add to bag
      </button>

      {justAdded && (
        <div className="flex items-center justify-between border border-olive/20 bg-cream-dark px-4 py-3 text-sm text-olive-dark">
          <span>Added to your bag.</span>
          <button
            type="button"
            onClick={() => router.push("/cart")}
            className="underline underline-offset-4"
          >
            View bag
          </button>
        </div>
      )}
    </div>
  );
}
