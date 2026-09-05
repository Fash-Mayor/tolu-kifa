import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/site/ProductCard";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Shop" };

export default async function ShopPage({
  searchParams,
}: {
  // In Next.js 16, `searchParams` (and `params`) are Promises rather than
  // plain objects — you have to `await` them before reading anything off.
  // This changed in Next 15/16; older Next.js tutorials show it without
  // the `await`.
  searchParams: Promise<{ category?: string }>;
}) {
  const { category: selectedCategory } = await searchParams;

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: {
        isActive: true,
        ...(selectedCategory ? { category: selectedCategory } : {}),
      },
      include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
      orderBy: { createdAt: "desc" },
    }),
    // Distinct category names, for the filter row below.
    prisma.product
      .findMany({
        where: { isActive: true },
        select: { category: true },
        distinct: ["category"],
        orderBy: { category: "asc" },
      })
      .then((rows) => rows.map((row) => row.category)),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="font-display text-3xl text-olive-dark">Shop</h1>

      {/* Category filter row */}
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/shop"
          className={`font-heading text-xs uppercase tracking-[0.15em] ${
            !selectedCategory ? "text-olive-dark underline" : "text-olive-dark/50"
          }`}
        >
          All
        </Link>
        {categories.map((category) => (
          <Link
            key={category}
            href={`/shop?category=${encodeURIComponent(category)}`}
            className={`font-heading text-xs uppercase tracking-[0.15em] ${
              selectedCategory === category
                ? "text-olive-dark underline"
                : "text-olive-dark/50"
            }`}
          >
            {category}
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <p className="mt-16 text-center text-olive-dark/60">
          No products found{selectedCategory ? ` in "${selectedCategory}"` : ""}.
        </p>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={{
                slug: product.slug,
                name: product.name,
                category: product.category,
                priceInMinorUnits: product.priceInMinorUnits,
                imageUrl: product.images[0]?.url ?? "/placeholders/product-1.svg",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
