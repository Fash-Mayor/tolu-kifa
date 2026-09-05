// Shared shell for EVERYTHING under /admin, including the login page.
//
// Deliberately does NOT check who's logged in — that's handled two ways:
//   - src/proxy.ts does a cheap "is there a session cookie at all?" check
//     before any admin page even starts rendering.
//   - src/app/admin/(protected)/layout.tsx does the real, database-backed
//     check for every page EXCEPT /admin/login (login obviously has to be
//     reachable while signed out — that's the whole point of it).
//
// This file just gives the whole admin section a visually distinct shell
// from the public site (a plain, utilitarian look, on purpose — this is a
// tool for the founder, not a customer-facing page).

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-cream-dark">{children}</div>;
}
