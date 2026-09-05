"use client";

// The cart is entirely client-side state (see CartProvider.tsx) — there's
// nothing in the database to read here, so this whole page is a Client
// Component ("use client") rather than the usual Server Component. That's
// a perfectly normal thing to do for a page whose content is 100% derived
// from browser state.

import Link from "next/link";
import { useCart } from "@/components/site/CartProvider";
import { SmartImage } from "@/components/site/SmartImage";
import { Price } from "@/components/site/Price";

export function CartView() {
  const { items, updateQuantity, removeItem, subtotalInMinorUnits } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h1 className="font-display text-3xl text-olive-dark">Your bag is empty</h1>
        <Link
          href="/shop"
          className="mt-6 inline-block bg-olive-dark px-8 py-3 font-heading text-sm uppercase tracking-[0.15em] text-cream hover:bg-olive"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="font-display text-3xl text-olive-dark">Your Bag</h1>

      <div className="mt-8 divide-y divide-olive/10">
        {items.map((item) => (
          <div key={`${item.productId}-${item.size}`} className="flex gap-4 py-5">
            <div className="relative h-28 w-24 shrink-0 overflow-hidden bg-cream-dark">
              <SmartImage
                src={item.imageUrl}
                alt={item.name}
                fill
                sizes="96px"
                className="object-cover"
              />
            </div>

            <div className="flex flex-1 flex-col justify-between">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Link href={`/shop/${item.slug}`} className="font-display text-lg text-olive-dark">
                    {item.name}
                  </Link>
                  <p className="text-sm text-olive-dark/60">Size UK {item.size}</p>
                </div>
                <p className="font-heading text-sm text-olive-dark">
                  <Price amountInMinorUnits={item.priceInMinorUnits * item.quantity} />
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                    className="h-8 w-8 border border-olive/30 text-olive-dark hover:border-olive-dark"
                    aria-label={`Decrease quantity of ${item.name}`}
                  >
                    −
                  </button>
                  <span className="w-5 text-center text-sm">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                    className="h-8 w-8 border border-olive/30 text-olive-dark hover:border-olive-dark"
                    aria-label={`Increase quantity of ${item.name}`}
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.productId, item.size)}
                  className="text-xs uppercase tracking-wide text-olive-dark/50 underline underline-offset-4 hover:text-olive-dark"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex items-center justify-between border-t border-olive/15 pt-6">
        <span className="font-heading text-sm uppercase tracking-[0.15em] text-olive-dark/70">
          Subtotal
        </span>
        <span className="font-display text-xl text-olive-dark">
          <Price amountInMinorUnits={subtotalInMinorUnits} />
        </span>
      </div>
      <p className="mt-1 text-xs text-olive-dark/50">
        Payment is arranged directly with the founder after checkout — nothing is charged online.
      </p>

      <Link
        href="/checkout"
        className="mt-6 block w-full bg-olive-dark py-3 text-center font-heading text-sm uppercase tracking-[0.15em] text-cream hover:bg-olive"
      >
        Proceed to checkout
      </Link>
    </div>
  );
}
