// Layout for every REAL admin page (dashboard, orders, inventory, etc).
// The "(protected)" folder name is a route group (invisible in the URL —
// see the comment in src/app/(site)/layout.tsx for the full explanation),
// used here specifically to keep /admin/login OUTSIDE of the auth check
// below, while everything else under /admin/* goes through it.

import Link from "next/link";
import { requireAdminSession } from "@/lib/auth";
import { logout } from "./actions";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/inventory", label: "Inventory" },
  { href: "/admin/gallery", label: "Gallery" },
  { href: "/admin/size-charts", label: "Size Charts" },
  { href: "/admin/consultations", label: "Consultations" },
  { href: "/admin/settings", label: "Settings" },
];

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The one line that actually protects every page below this layout: it
  // redirects to /admin/login if there's no valid session. See
  // src/lib/auth.ts for the full explanation of how sessions work.
  const session = await requireAdminSession();

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r border-olive/15 bg-cream p-6">
        <p className="font-heading text-sm uppercase tracking-[0.2em] text-olive-dark">
          TÓLÚ KÍFÀ
        </p>
        <p className="mt-0.5 text-xs text-olive-dark/50">Admin</p>

        <nav className="mt-8 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded px-3 py-2 text-sm text-olive-dark hover:bg-cream-dark"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-10 border-t border-olive/10 pt-4">
          <p className="truncate text-xs text-olive-dark/50">
            {session.adminUser.email}
          </p>
          <form action={logout}>
            <button
              type="submit"
              className="mt-2 text-xs uppercase tracking-wide text-olive-dark/60 underline underline-offset-4 hover:text-olive-dark"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
