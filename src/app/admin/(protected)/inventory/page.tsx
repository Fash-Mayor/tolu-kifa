import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Price } from "@/components/site/Price";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Inventory" };

export default async function AdminInventoryPage() {
  const products = await prisma.product.findMany({
    include: { sizes: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-olive-dark">Inventory</h1>
        <Link
          href="/admin/inventory/new"
          className="bg-olive-dark px-5 py-2.5 font-heading text-sm uppercase tracking-[0.15em] text-cream hover:bg-olive"
        >
          Add product
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto border border-olive/15 bg-cream">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-olive/15 font-heading uppercase tracking-wide text-olive-dark/60">
              <th className="p-3">Name</th>
              <th className="p-3">Category</th>
              <th className="p-3">Price</th>
              <th className="p-3">Total stock</th>
              <th className="p-3">Visible</th>
              <th className="p-3">Featured</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const totalStock = product.sizes.reduce((sum, size) => sum + size.stock, 0);
              return (
                <tr key={product.id} className="border-b border-olive/10 last:border-0">
                  <td className="p-3">
                    <Link href={`/admin/inventory/${product.id}`} className="text-olive-dark hover:underline">
                      {product.name}
                    </Link>
                  </td>
                  <td className="p-3">{product.category}</td>
                  <td className="p-3"><Price amountInMinorUnits={product.priceInMinorUnits} /></td>
                  <td className="p-3">{totalStock}</td>
                  <td className="p-3">{product.isActive ? "Yes" : "Hidden"}</td>
                  <td className="p-3">{product.isFeatured ? "Yes" : "—"}</td>
                </tr>
              );
            })}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-olive-dark/50">
                  No products yet — click &quot;Add product&quot; to create the first one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
