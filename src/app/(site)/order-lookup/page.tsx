import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Price } from "@/components/site/Price";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Track an Order" };

// A human-readable label for each OrderStatus value from prisma/schema.prisma.
const STATUS_LABELS: Record<string, string> = {
  NEW: "Received — awaiting contact",
  CONTACTED: "We've been in touch",
  CONFIRMED: "Confirmed",
  IN_PRODUCTION: "In production",
  SHIPPED: "Shipped",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export default async function OrderLookupPage({
  searchParams,
}: {
  searchParams: Promise<{ orderNumber?: string; email?: string }>;
}) {
  const { orderNumber, email } = await searchParams;
  const hasSubmitted = Boolean(orderNumber && email);

  // Notice there's no "action" on the <form> below and no onSubmit handler
  // — a plain HTML form with no JavaScript at all submits as a GET request
  // to the current page with its fields turned into a query string (e.g.
  // ?orderNumber=TK-...&email=...). That's exactly what we want here, and
  // it means this whole feature works even with JavaScript disabled.
  const order = hasSubmitted
    ? await prisma.orderRequest.findFirst({
        where: {
          orderNumber: orderNumber,
          // Match the email case-insensitively — customers won't always
          // type it back exactly as they first entered it.
          email: { equals: email, mode: "insensitive" },
        },
        include: { items: true },
      })
    : null;

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="font-display text-3xl text-olive-dark">Track an Order</h1>
      <p className="mt-2 text-sm text-olive-dark/70">
        Enter your order reference and the email you used at checkout.
      </p>

      <form className="mt-8 grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
        <input
          name="orderNumber"
          defaultValue={orderNumber}
          placeholder="Order reference (e.g. TK-20260905-4821)"
          required
          className="border border-olive/25 bg-cream px-4 py-2.5 text-sm text-olive-dark placeholder:text-olive-dark/40 focus:border-olive-dark focus:outline-none"
        />
        <input
          name="email"
          type="email"
          defaultValue={email}
          placeholder="Email used at checkout"
          required
          className="border border-olive/25 bg-cream px-4 py-2.5 text-sm text-olive-dark placeholder:text-olive-dark/40 focus:border-olive-dark focus:outline-none"
        />
        <button
          type="submit"
          className="bg-olive-dark px-6 py-2.5 font-heading text-sm uppercase tracking-[0.15em] text-cream hover:bg-olive"
        >
          Track
        </button>
      </form>

      {hasSubmitted && !order && (
        <p className="mt-8 text-sm text-red-700">
          We couldn&apos;t find an order matching that reference and email.
          Double-check both and try again.
        </p>
      )}

      {order && (
        <div className="mt-8 border border-olive/15 p-6">
          <p className="font-heading text-xs uppercase tracking-[0.15em] text-olive-dark/60">
            Status
          </p>
          <p className="mt-1 font-display text-2xl text-olive-dark">
            {STATUS_LABELS[order.status] ?? order.status}
          </p>

          <ul className="mt-6 space-y-2 border-t border-olive/10 pt-4">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between text-sm">
                <span className="text-olive-dark/80">
                  {item.productName} (UK {item.size}) × {item.quantity}
                </span>
                <span className="text-olive-dark">
                  <Price amountInMinorUnits={item.priceInMinorUnits * item.quantity} />
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
