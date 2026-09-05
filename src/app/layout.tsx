// -----------------------------------------------------------------------------
// Root layout — wraps EVERY page in the app (public site AND admin panel).
// -----------------------------------------------------------------------------
// This is the one place fonts and global CSS get loaded. It deliberately
// does NOT render a nav bar or footer — those differ between the public
// site and the admin panel, so each gets its own layout:
//   - src/app/(site)/layout.tsx   -> public nav + footer + shopping cart
//   - src/app/admin/layout.tsx    -> admin panel shell
// Next.js merges nested layouts automatically based on the folder a page
// lives in — see https://nextjs.org/docs/app/getting-started/layouts-and-pages
// -----------------------------------------------------------------------------

import type { Metadata } from "next";
import { Bodoni_Moda, Syne, Hanken_Grotesk } from "next/font/google";
import "./globals.css";

// next/font/google downloads the font at build time and self-hosts it, so
// there's no request to Google at runtime (better privacy + performance
// than a <link> tag). Each call below defines a CSS variable name that
// globals.css then maps to a Tailwind font family (see the `@theme` block).
const bodoniModa = Bodoni_Moda({
  variable: "--font-bodoni-moda",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
});

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "TÓLÚ KÍFÀ — Stylish · Elegant · Timeless",
    template: "%s | TÓLÚ KÍFÀ",
  },
  description:
    "TÓLÚ KÍFÀ is a fashion design studio — browse the collection, view past work, and request a bespoke consultation.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${bodoniModa.variable} ${syne.variable} ${hankenGrotesk.variable}`}
    >
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
