import Link from "next/link";

// A plain Server Component — no interactivity needed, so no "use client"
// and no useState/useEffect. Rendered once on the server as static HTML.
export function Footer() {
  return (
    <footer className="border-t border-olive/15 bg-olive text-cream">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="font-heading text-lg tracking-[0.2em]">TÓLÚ KÍFÀ</p>
          <p className="mt-1 text-sm text-cream/70">Stylish · Elegant · Timeless</p>
        </div>

        <div className="flex flex-col gap-2 text-sm text-cream/80">
          <Link href="/shop" className="hover:text-cream">Shop</Link>
          <Link href="/gallery" className="hover:text-cream">Archive</Link>
          <Link href="/consult" className="hover:text-cream">Book a consultation</Link>
          <Link href="/order-lookup" className="hover:text-cream">Track an order</Link>
        </div>
      </div>

      <div className="border-t border-cream/10 px-6 py-4 text-center text-xs text-cream/60">
        © {new Date().getFullYear()} TÓLÚ KÍFÀ. All rights reserved.
      </div>
    </footer>
  );
}
