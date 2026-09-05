import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Price } from "@/components/site/Price";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Order Confirmed" };

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;

  const order = await prisma.orderRequest.findUnique({
    where: { orderNumber },
    include: { items: true },
  });

  if (!order) notFound();

  const totalInMinorUnits = order.items.reduce(
    (sum, item) => sum + item.priceInMinorUnits * item.quantity,
    0
  );

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 text-center">
      <h1 className="font-display text-3xl text-olive-dark">Thank you!</h1>
      <p className="mt-3 text-olive-dark/70">
        Your order request has been received. We&apos;ll be in touch at{" "}
        <strong>{order.email}</strong> or <strong>{order.phone}</strong> to confirm
        details and arrange payment.
      </p>

      <div className="mt-8 border border-olive/15 p-6 text-left">
        <p className="font-heading text-xs uppercase tracking-[0.15em] text-olive-dark/60">
          Order reference — keep this to check your order status
        </p>
        <p className="mt-1 font-display text-2xl text-olive-dark">{order.orderNumber}</p>

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
        <div className="mt-4 flex justify-between border-t border-olive/10 pt-4 font-heading text-sm uppercase tracking-[0.1em]">
          <span>Total</span>
          <span><Price amountInMinorUnits={totalInMinorUnits} /></span>
        </div>
      </div>

      <Link
        href="/shop"
        className="mt-8 inline-block bg-olive-dark px-8 py-3 font-heading text-sm uppercase tracking-[0.15em] text-cream hover:bg-olive"
      >
        Continue shopping
      </Link>
    </div>
  );
}
