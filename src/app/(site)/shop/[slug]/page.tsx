import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SmartImage } from "@/components/site/SmartImage";
import { AddToCartForm } from "@/components/site/AddToCartForm";
import { SizeGuideModal } from "@/components/site/SizeGuideModal";
import { Price } from "@/components/site/Price";

export const dynamic = "force-dynamic";

// Unlike the static `export const metadata = {...}` used on most other
// pages, a page whose title depends on data (here: the product's name) uses
// an async `generateMetadata` function instead, with the same `params`
// Promise the page component itself receives.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug }, select: { name: true } });
  return { title: product?.name ?? "Product not found" };
}

export default async function ProductPage({
  params,
}: {
  // Dynamic route params are also a Promise in Next.js 16 — see the note in
  // src/app/(site)/shop/page.tsx about searchParams for the same change.
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug, isActive: true },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      sizes: { orderBy: { label: "asc" } },
    },
  });

  // notFound() renders the nearest not-found.tsx (or Next's default 404)
  // and stops the rest of this component from running.
  if (!product) notFound();

  const sizeChartRows = await prisma.sizeChartRow.findMany({
    where: { category: product.sizeChartCategory },
    orderBy: { sortOrder: "asc" },
  });

  const mainImage = product.images[0]?.url ?? "/placeholders/product-1.svg";

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="grid gap-10 md:grid-cols-2">
        {/* Photos */}
        <div className="space-y-4">
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-cream-dark">
            <SmartImage
              src={mainImage}
              alt={product.name}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {product.images.slice(1).map((image) => (
                <div key={image.id} className="relative aspect-[4/5] overflow-hidden bg-cream-dark">
                  <SmartImage
                    src={image.url}
                    alt={product.name}
                    fill
                    sizes="25vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details + purchase */}
        <div>
          <p className="font-heading text-xs uppercase tracking-[0.15em] text-olive/70">
            {product.category}
          </p>
          <h1 className="mt-2 font-display text-3xl text-olive-dark">{product.name}</h1>
          <p className="mt-2 text-xl text-olive-dark/80">
            <Price amountInMinorUnits={product.priceInMinorUnits} />
          </p>

          <p className="mt-6 max-w-md text-sm leading-relaxed text-olive-dark/80">
            {product.description}
          </p>

          <div className="mt-6 flex items-center justify-between">
            <span className="font-heading text-xs uppercase tracking-[0.15em] text-olive-dark/70">
              Select a size
            </span>
            <SizeGuideModal
              rows={sizeChartRows}
              hasBustColumn={product.sizeChartCategory === "TOPS"}
            />
          </div>

          <div className="mt-3">
            <AddToCartForm
              productId={product.id}
              slug={product.slug}
              name={product.name}
              priceInMinorUnits={product.priceInMinorUnits}
              imageUrl={mainImage}
              availableSizes={product.sizes.map((size) => ({
                label: size.label,
                stock: size.stock,
              }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
