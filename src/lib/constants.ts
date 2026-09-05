// -----------------------------------------------------------------------------
// Small values shared across the app that don't belong to any one feature.
// -----------------------------------------------------------------------------
// This file deliberately has NO imports of its own (no Prisma, no Node APIs).
// That matters because it's imported by src/proxy.ts, which Next.js runs on
// almost every request in a lightweight runtime — keeping this file tiny and
// dependency-free keeps that fast.
// -----------------------------------------------------------------------------

// Name of the httpOnly cookie that holds the founder's admin session token.
// Used by both src/lib/auth.ts (which sets/reads/deletes it) and
// src/proxy.ts (which only checks whether it's present, to fast-redirect
// signed-out visitors away from /admin pages).
export const ADMIN_SESSION_COOKIE_NAME = "tk_admin_session";

// How long an admin login stays valid before requiring signing in again.
export const ADMIN_SESSION_LENGTH_DAYS = 7;

// The UK sizes every product can be stocked in, matching the rows in both
// size charts (see prisma/seed.ts and SizeChartRow in schema.prisma). Kept
// as one fixed list — rather than letting the founder type arbitrary size
// labels per product — so a size always means the same thing everywhere in
// the shop, and always matches a row in the size guide.
export const STANDARD_SIZE_LABELS = [
  "6",
  "8",
  "10",
  "12",
  "14",
  "16",
  "18",
  "20",
  "22",
] as const;
