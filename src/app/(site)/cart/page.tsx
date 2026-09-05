import type { Metadata } from "next";
import { CartView } from "./CartView";

// A page.tsx can only export `metadata` from a Server Component — but the
// cart's content is 100% client-side state (see CartProvider.tsx), so we
// keep this file itself as a plain Server Component just to declare the
// page title, and hand off all the actual UI to CartView ("use client").
export const metadata: Metadata = {
  title: "Your Bag",
};

export default function CartPage() {
  return <CartView />;
}
