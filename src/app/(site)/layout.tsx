// Layout for every PUBLIC page — anything under src/app/(site)/. The
// "(site)" folder name is a Next.js "route group": the parentheses mean it
// is NOT part of the URL (this layout applies to "/", "/shop", "/gallery",
// etc, not "/site/shop"). It exists purely to give these pages a shared
// nav/footer/cart without also applying them to the admin panel.
// See https://nextjs.org/docs/app/api-reference/file-conventions/route-groups

import { CartProvider } from "@/components/site/CartProvider";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    // CartProvider is a Client Component (see its file for why), but the
    // Server Component pages passed in as `children` still render on the
    // server as normal — wrapping them in a client component here doesn't
    // change that. This is a common and fully-supported pattern in the
    // App Router.
    <CartProvider>
      <div className="flex min-h-screen flex-col">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </CartProvider>
  );
}
