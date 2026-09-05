"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/site/CartProvider";
import { Price } from "@/components/site/Price";
import { placeOrderRequest } from "./actions";

const inputClasses =
  "w-full border border-olive/25 bg-cream px-4 py-2.5 text-sm text-olive-dark placeholder:text-olive-dark/40 focus:border-olive-dark focus:outline-none";
const labelClasses =
  "mb-1.5 block font-heading text-xs uppercase tracking-[0.15em] text-olive-dark/70";

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return <p className="mt-1 text-sm text-red-700">{messages[0]}</p>;
}

export function CheckoutForm() {
  const { items, subtotalInMinorUnits, clearCart } = useCart();
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    setFieldErrors({});

    const formData = new FormData(event.currentTarget);

    const result = await placeOrderRequest(
      {
        customerName: String(formData.get("customerName") ?? ""),
        email: String(formData.get("email") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        deliveryAddress: String(formData.get("deliveryAddress") ?? ""),
      },
      items.map((item) => ({
        productId: item.productId,
        size: item.size,
        quantity: item.quantity,
      }))
    );

    if (result.status === "error") {
      setFormError(result.message);
      setFieldErrors(result.fieldErrors ?? {});
      setIsSubmitting(false);
      return;
    }

    // Success: empty the bag and send the customer to their confirmation
    // page, which shows the order number they'll need for order-lookup.
    clearCart();
    router.push(`/order-confirmation/${result.orderNumber}`);
  }

  if (items.length === 0) {
    return (
      <div className="text-center">
        <p className="text-olive-dark/70">Your bag is empty.</p>
        <Link href="/shop" className="mt-4 inline-block underline underline-offset-4">
          Back to shop
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-10 md:grid-cols-[1.3fr_1fr]">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="customerName" className={labelClasses}>Full name</label>
          <input id="customerName" name="customerName" required className={inputClasses} />
          <FieldError messages={fieldErrors.customerName} />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="email" className={labelClasses}>Email</label>
            <input id="email" name="email" type="email" required className={inputClasses} />
            <FieldError messages={fieldErrors.email} />
          </div>
          <div>
            <label htmlFor="phone" className={labelClasses}>Phone number</label>
            <input id="phone" name="phone" type="tel" required className={inputClasses} />
            <FieldError messages={fieldErrors.phone} />
          </div>
        </div>

        <div>
          <label htmlFor="deliveryAddress" className={labelClasses}>Delivery address</label>
          <textarea
            id="deliveryAddress"
            name="deliveryAddress"
            required
            rows={3}
            className={inputClasses}
          />
          <FieldError messages={fieldErrors.deliveryAddress} />
        </div>

        {formError && <p className="text-sm text-red-700">{formError}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-olive-dark py-3 font-heading text-sm uppercase tracking-[0.15em] text-cream transition hover:bg-olive disabled:opacity-60"
        >
          {isSubmitting ? "Submitting..." : "Submit order request"}
        </button>
        <p className="text-xs text-olive-dark/50">
          This submits your order as a request — no payment is taken here.
          We&apos;ll contact you directly to confirm details and arrange payment.
        </p>
      </form>

      {/* Order summary */}
      <div className="h-fit border border-olive/15 p-6">
        <h2 className="font-heading text-sm uppercase tracking-[0.15em] text-olive-dark/70">
          Order summary
        </h2>
        <ul className="mt-4 space-y-3">
          {items.map((item) => (
            <li key={`${item.productId}-${item.size}`} className="flex justify-between text-sm">
              <span className="text-olive-dark/80">
                {item.name} (UK {item.size}) × {item.quantity}
              </span>
              <span className="text-olive-dark">
                <Price amountInMinorUnits={item.priceInMinorUnits * item.quantity} />
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-olive/15 pt-4 font-heading text-sm uppercase tracking-[0.1em]">
          <span>Subtotal</span>
          <span><Price amountInMinorUnits={subtotalInMinorUnits} /></span>
        </div>
      </div>
    </div>
  );
}
