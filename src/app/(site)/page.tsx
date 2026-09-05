import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/site/ProductCard";
import { SmartImage } from "@/components/site/SmartImage";

// -----------------------------------------------------------------------------
// `force-dynamic` tells Next.js: "always render this page fresh on the
// server for every request, never try to pre-build a static HTML version
// of it." We add this to every page that reads from the database, because:
//   1. The data (products, orders, etc.) genuinely changes over time and
//      should always be current.
//   2. `next build` runs without a live database connection available in
//      some environments — trying to pre-render a database query at build
//      time would make the build fail.
// You'll see this same line at the top of most page.tsx files in this app.
// -----------------------------------------------------------------------------
export const dynamic = "force-dynamic";

export default async function LandingPage() {
  // Show a handful of hand-picked products (toggled from Admin -> Inventory)
  const featuredProducts = await prisma.product.findMany({
    where: { isActive: true, isFeatured: true },
    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
    orderBy: { createdAt: "desc" },
    take: 4,
  });

  return (
    <div>
      {/* ---------------------------------------------------------------- */}
      {/* HERO                                                             */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative flex h-[70vh] min-h-[420px] items-end overflow-hidden">
        <SmartImage
          src="/placeholders/hero.svg"
          alt="TÓLÚ KÍFÀ"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-olive-dark/30" />
        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-14 text-cream">
          <p className="font-heading text-sm uppercase tracking-[0.3em]">
            Stylish · Elegant · Timeless
          </p>
          <h1 className="mt-3 max-w-xl font-display text-4xl leading-tight md:text-6xl">
            TÓLÚ KÍFÀ
          </h1>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              href="/shop"
              className="bg-cream px-6 py-3 font-heading text-sm uppercase tracking-[0.15em] text-olive-dark transition hover:bg-cream-dark"
            >
              Shop the collection
            </Link>
            <Link
              href="/consult"
              className="border border-cream px-6 py-3 font-heading text-sm uppercase tracking-[0.15em] text-cream transition hover:bg-cream/10"
            >
              Book a consultation
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* FEATURED PRODUCTS                                                */}
      {/* ---------------------------------------------------------------- */}
      {featuredProducts.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="font-display text-2xl text-olive-dark md:text-3xl">
              New Arrivals
            </h2>
            <Link
              href="/shop"
              className="font-heading text-sm uppercase tracking-[0.15em] text-olive-dark underline underline-offset-4"
            >
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {featuredProducts.map((product) => (
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
        </section>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* ARCHIVE / CONSULT TEASER                                         */}
      {/* ---------------------------------------------------------------- */}
      <section className="grid gap-px bg-olive/15 md:grid-cols-2">
        <Link
          href="/gallery"
          className="group flex flex-col justify-end bg-cream p-10 transition hover:bg-cream-dark"
        >
          <h3 className="font-display text-2xl text-olive-dark">The Archive</h3>
          <p className="mt-2 max-w-sm text-sm text-olive-dark/70">
            Browse past collections and bespoke pieces we&apos;ve brought to life.
          </p>
          <span className="mt-4 font-heading text-sm uppercase tracking-[0.15em] text-olive-dark underline underline-offset-4">
            View the archive
          </span>
        </Link>
        <Link
          href="/consult"
          className="group flex flex-col justify-end bg-cream p-10 transition hover:bg-cream-dark"
        >
          <h3 className="font-display text-2xl text-olive-dark">Bespoke Consultations</h3>
          <p className="mt-2 max-w-sm text-sm text-olive-dark/70">
            Have something specific in mind? Tell us about it and we&apos;ll be in touch.
          </p>
          <span className="mt-4 font-heading text-sm uppercase tracking-[0.15em] text-olive-dark underline underline-offset-4">
            Start a consultation
          </span>
        </Link>
      </section>
    </div>
  );
}
