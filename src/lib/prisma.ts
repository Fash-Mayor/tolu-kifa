// -----------------------------------------------------------------------------
// A single, shared Prisma Client instance.
// -----------------------------------------------------------------------------
// Every file in the app that needs to talk to the database does:
//
//   import { prisma } from "@/lib/prisma"
//   const products = await prisma.product.findMany()
//
// Why not just `new PrismaClient()` wherever it's needed? In development,
// Next.js reloads your server code on every file save ("Fast Refresh"). If
// each reload created a brand new PrismaClient, you'd quickly open way more
// database connections than your database allows, and the dev server would
// start throwing connection errors.
//
// The fix: stash the client on Node's global object, which *survives* Fast
// Refresh reloads (unlike a normal module-level variable in dev mode), and
// reuse it if it's already there. In production this file only ever runs
// once anyway, so it makes no difference there.
// -----------------------------------------------------------------------------

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
