import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Price } from "@/components/site/Price";
import { updateOrder } from "./actions";

export const dynamic = "force-dynamic";

const ALL_STATUSES = [
  "NEW",
  "CONTACTED",
  "CONFIRMED",
  "IN_PRODUCTION",
  "SHIPPED",
  "COMPLETED",
  "CANCELLED",
] as const;

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await prisma.orderRequest.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) notFound();

  const total = order.items.reduce(
    (sum, item) => sum + item.priceInMinorUnits * item.quantity,
    0
  );

  // `.bind(null, order.id)` creates a new function that already has
  // `orderId` filled in, so the <form> below only needs to supply the
  // FormData — this is how you pass extra, fixed arguments to a Server
  // Action from a form. See updateOrder's signature in ./actions.ts.
  const updateOrderWithId = updateOrder.bind(null, order.id);

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl text-olive-dark">Order {order.orderNumber}</h1>

      <div className="mt-6 grid gap-8 md:grid-cols-2">
        <div className="border border-olive/15 bg-cream p-5">
          <h2 className="font-heading text-sm uppercase tracking-[0.15em] text-olive-dark/60">
            Customer
          </h2>
          <dl className="mt-3 space-y-1 text-sm">
            <div className="flex justify-between"><dt className="text-olive-dark/60">Name</dt><dd>{order.customerName}</dd></div>
            <div className="flex justify-between"><dt className="text-olive-dark/60">Email</dt><dd>{order.email}</dd></div>
            <div className="flex justify-between"><dt className="text-olive-dark/60">Phone</dt><dd>{order.phone}</dd></div>
          </dl>
          <p className="mt-3 text-sm text-olive-dark/60">Delivery address</p>
          <p className="text-sm">{order.deliveryAddress}</p>
        </div>

        <div className="border border-olive/15 bg-cream p-5">
          <h2 className="font-heading text-sm uppercase tracking-[0.15em] text-olive-dark/60">
            Items
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between">
                <span>{item.productName} (UK {item.size}) × {item.quantity}</span>
                <span><Price amountInMinorUnits={item.priceInMinorUnits * item.quantity} /></span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex justify-between border-t border-olive/10 pt-3 font-heading text-sm uppercase">
            <span>Total</span>
            <span><Price amountInMinorUnits={total} /></span>
          </div>
        </div>
      </div>

      <form action={updateOrderWithId} className="mt-8 space-y-4 border border-olive/15 bg-cream p-5">
        <h2 className="font-heading text-sm uppercase tracking-[0.15em] text-olive-dark/60">
          Update status
        </h2>

        <div>
          <label htmlFor="status" className="mb-1.5 block text-sm text-olive-dark/70">Status</label>
          <select
            id="status"
            name="status"
            defaultValue={order.status}
            className="w-full border border-olive/25 bg-cream px-4 py-2.5 text-sm text-olive-dark focus:border-olive-dark focus:outline-none"
          >
            {ALL_STATUSES.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="notes" className="mb-1.5 block text-sm text-olive-dark/70">
            Internal notes (never shown to the customer)
          </label>
          <textarea
            id="notes"
            name="notes"
            defaultValue={order.notes ?? ""}
            rows={4}
            className="w-full border border-olive/25 bg-cream px-4 py-2.5 text-sm text-olive-dark focus:border-olive-dark focus:outline-none"
          />
        </div>

        <button
          type="submit"
          className="bg-olive-dark px-6 py-2.5 font-heading text-sm uppercase tracking-[0.15em] text-cream hover:bg-olive"
        >
          Save
        </button>
      </form>
    </div>
  );
}
