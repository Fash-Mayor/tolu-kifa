import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Price } from "@/components/site/Price";
import { getDateDaysAgo } from "@/lib/orders";
import { StatCard } from "@/components/admin/StatCard";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin Dashboard" };

export default async function AdminDashboardPage() {
  const oneWeekAgo = getDateDaysAgo(7);

  // Running several independent queries at once with Promise.all is faster
  // than awaiting them one after another, since they don't depend on each
  // other's results.
  const [
    totalOrders,
    newOrders,
    completedOrders,
    revenueAgg,
    newConsultationsThisWeek,
    topProductRows,
    recentOrders,
    recentConsultations,
  ] = await Promise.all([
    prisma.orderRequest.count(),
    prisma.orderRequest.count({ where: { status: "NEW" } }),
    prisma.orderRequest.count({ where: { status: "COMPLETED" } }),
    // Revenue is only counted from COMPLETED orders — anything still "NEW"
    // or "CANCELLED" hasn't actually been paid for.
    prisma.orderItem.aggregate({
      _sum: { priceInMinorUnits: true },
      where: { orderRequest: { status: "COMPLETED" } },
    }),
    prisma.consultationRequest.count({ where: { createdAt: { gte: oneWeekAgo } } }),
    prisma.orderItem.groupBy({
      by: ["productName"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
    prisma.orderRequest.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.consultationRequest.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-2xl text-olive-dark">Dashboard</h1>
        <p className="text-sm text-olive-dark/60">A quick snapshot — no logins required beyond this one.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Total orders" value={totalOrders} />
        <StatCard label="New / needs attention" value={newOrders} />
        <StatCard label="Completed orders" value={completedOrders} />
        <StatCard
          label="Revenue (completed)"
          value={<Price amountInMinorUnits={revenueAgg._sum.priceInMinorUnits ?? 0} />}
        />
        <StatCard label="New consultations (7 days)" value={newConsultationsThisWeek} />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Recent orders */}
        <div className="border border-olive/15 bg-cream p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-heading text-sm uppercase tracking-[0.15em] text-olive-dark">
              Recent orders
            </h2>
            <Link href="/admin/orders" className="text-xs underline underline-offset-4">
              View all
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-olive-dark/50">No orders yet.</p>
          ) : (
            <ul className="divide-y divide-olive/10">
              {recentOrders.map((order) => (
                <li key={order.id} className="flex items-center justify-between py-2 text-sm">
                  <Link href={`/admin/orders/${order.id}`} className="text-olive-dark hover:underline">
                    {order.orderNumber} — {order.customerName}
                  </Link>
                  <span className="text-xs uppercase tracking-wide text-olive-dark/50">
                    {order.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent consultation requests */}
        <div className="border border-olive/15 bg-cream p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-heading text-sm uppercase tracking-[0.15em] text-olive-dark">
              Recent consultation requests
            </h2>
            <Link href="/admin/consultations" className="text-xs underline underline-offset-4">
              View all
            </Link>
          </div>
          {recentConsultations.length === 0 ? (
            <p className="text-sm text-olive-dark/50">No requests yet.</p>
          ) : (
            <ul className="divide-y divide-olive/10">
              {recentConsultations.map((request) => (
                <li key={request.id} className="flex items-center justify-between py-2 text-sm">
                  <Link
                    href={`/admin/consultations/${request.id}`}
                    className="text-olive-dark hover:underline"
                  >
                    {request.name} — {request.projectType}
                  </Link>
                  <span className="text-xs uppercase tracking-wide text-olive-dark/50">
                    {request.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Top-selling products */}
      <div className="border border-olive/15 bg-cream p-5">
        <h2 className="mb-3 font-heading text-sm uppercase tracking-[0.15em] text-olive-dark">
          Best-selling products (all time, by quantity ordered)
        </h2>
        {topProductRows.length === 0 ? (
          <p className="text-sm text-olive-dark/50">No orders yet.</p>
        ) : (
          <ol className="space-y-2">
            {topProductRows.map((row, index) => (
              <li key={row.productName} className="flex justify-between text-sm">
                <span className="text-olive-dark">
                  {index + 1}. {row.productName}
                </span>
                <span className="text-olive-dark/60">{row._sum.quantity} sold</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
