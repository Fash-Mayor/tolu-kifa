"use client";

// Public site navigation bar. A Client Component because it shows a live
// cart item count via useCart() — everything else here is static markup.

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useCart } from "./CartProvider";

const NAV_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/gallery", label: "Archive" },
  { href: "/consult", label: "Consult" },
];

export function Nav() {
  const { itemCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-olive/15 bg-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3" onClick={() => setIsMenuOpen(false)}>
          <Image
            src="/brand/logo.jpeg"
            alt="TÓLÚ KÍFÀ"
            width={40}
            height={40}
            // This logo is in the nav on every page, so it's almost always
            // the first meaningful thing painted (what Next/the browser
            // calls the "Largest Contentful Paint"). `priority` tells
            // next/image to load it immediately instead of lazily, which
            // is what you want for anything visible without scrolling.
            priority
            className="rounded-full object-cover"
          />
          <span className="font-heading text-lg tracking-[0.2em] text-olive-dark">
            TÓLÚ KÍFÀ
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-heading text-sm uppercase tracking-[0.15em] text-olive-dark transition hover:text-olive"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/cart"
            className="font-heading text-sm uppercase tracking-[0.15em] text-olive-dark transition hover:text-olive"
          >
            Cart{itemCount > 0 ? ` (${itemCount})` : ""}
          </Link>
        </nav>

        {/* Mobile menu toggle — shown below the md breakpoint only */}
        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          className="font-heading text-sm uppercase tracking-[0.15em] text-olive-dark md:hidden"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-nav"
        >
          Menu{itemCount > 0 ? ` (${itemCount})` : ""}
        </button>
      </div>

      {isMenuOpen && (
        <nav id="mobile-nav" className="flex flex-col gap-1 border-t border-olive/15 px-6 py-4 md:hidden">
          {[...NAV_LINKS, { href: "/cart", label: `Cart${itemCount > 0 ? ` (${itemCount})` : ""}` }].map(
            (link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="py-2 font-heading text-sm uppercase tracking-[0.15em] text-olive-dark"
              >
                {link.label}
              </Link>
            )
          )}
        </nav>
      )}
    </header>
  );
}
