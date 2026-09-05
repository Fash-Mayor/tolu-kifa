import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Price } from "@/components/site/Price";
import type { OrderStatus } from "@prisma/client";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Orders" };

const ALL_STATUSES: OrderStatus[] = [
  "NEW",
  "CONTACTED",
  "CONFIRMED",
  "IN_PRODUCTION",
  "SHIPPED",
  "COMPLETED",
  "CANCELLED",
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const isValidStatus = (value?: string): value is OrderStatus =>
    ALL_STATUSES.includes(value as OrderStatus);

  const orders = await prisma.orderRequest.findMany({
    where: isValidStatus(status) ? { status } : undefined,
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-display text-2xl text-olive-dark">Orders</h1>

      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          href="/admin/orders"
          className={`text-xs uppercase tracking-wide ${!status ? "font-semibold text-olive-dark underline" : "text-olive-dark/50"}`}
        >
          All
        </Link>
        {ALL_STATUSES.map((value) => (
          <Link
            key={value}
            href={`/admin/orders?status=${value}`}
            className={`text-xs uppercase tracking-wide ${status === value ? "font-semibold text-olive-dark underline" : "text-olive-dark/50"}`}
          >
            {value}
          </Link>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto border border-olive/15 bg-cream">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-olive/15 font-heading uppercase tracking-wide text-olive-dark/60">
              <th className="p-3">Order #</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Items</th>
              <th className="p-3">Total</th>
              <th className="p-3">Status</th>
              <th className="p-3">Placed</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const total = order.items.reduce(
                (sum, item) => sum + item.priceInMinorUnits * item.quantity,
                0
              );
              return (
                <tr key={order.id} className="border-b border-olive/10 last:border-0">
                  <td className="p-3">
                    <Link href={`/admin/orders/${order.id}`} className="text-olive-dark hover:underline">
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="p-3">{order.customerName}</td>
                  <td className="p-3">{order.items.length}</td>
                  <td className="p-3"><Price amountInMinorUnits={total} /></td>
                  <td className="p-3">
                    <span className="text-xs uppercase tracking-wide text-olive-dark/70">
                      {order.status}
                    </span>
                  </td>
                  <td className="p-3 text-olive-dark/60">
                    {order.createdAt.toLocaleDateString()}
                  </td>
                </tr>
              );
            })}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-olive-dark/50">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
