// -----------------------------------------------------------------------------
// Admin authentication — hand-rolled on purpose.
// -----------------------------------------------------------------------------
// There is exactly one admin: the founder. Rather than pull in a full auth
// library (which brings its own concepts — providers, adapters, callbacks —
// to learn), this is a small, plain implementation of the standard
// "session in the database, opaque token in a cookie" pattern:
//
//   1. Founder submits email + password on /admin/login.
//   2. We check the password against the bcrypt hash stored in AdminUser
//      (see prisma/seed.ts for how that hash gets created).
//   3. If it matches, we create a row in the AdminSession table and put
//      ONLY that row's id into an httpOnly cookie. The cookie never holds
//      the password or anything sensitive — just a random reference.
//   4. On every later request to an admin page, we read that cookie, look
//      the session up in the database, and check it hasn't expired.
//
// This is the same pattern Next.js's own authentication guide recommends
// (search "Data Access Layer" in their docs) — see also src/proxy.ts, which
// does a cheap, cookie-only version of this check before a page even starts
// rendering.
// -----------------------------------------------------------------------------

import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  ADMIN_SESSION_COOKIE_NAME,
  ADMIN_SESSION_LENGTH_DAYS,
} from "@/lib/constants";

/** Creates a new session for this admin user and sets the session cookie. Call after verifying the password. */
export async function createAdminSession(adminUserId: string) {
  const expiresAt = new Date(
    Date.now() + ADMIN_SESSION_LENGTH_DAYS * 24 * 60 * 60 * 1000
  );

  const session = await prisma.adminSession.create({
    data: {
      id: randomUUID(),
      adminUserId,
      expiresAt,
    },
  });

  // `cookies()` is async in Next.js 16 (it used to be synchronous in older
  // versions — if you're following an older tutorial, this is why it looks
  // different).
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE_NAME, session.id, {
    httpOnly: true, // JavaScript in the browser can never read this cookie
    secure: process.env.NODE_ENV === "production", // HTTPS-only in production
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

/**
 * The authoritative "who is logged in?" check — looks the session cookie up
 * in the database and confirms it hasn't expired. Returns null if there is
 * no valid session.
 */
export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await prisma.adminSession.findUnique({
    where: { id: token },
    include: { adminUser: true },
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  return session;
}

/**
 * Use this at the top of any admin page/layout that must not be reachable
 * while signed out. It redirects to the login page if there's no valid
 * session, otherwise returns the session so you can use it (e.g. to show
 * the admin's email in the header).
 *
 * src/proxy.ts already redirects out most signed-out visitors before the
 * page even renders, using a cheap cookie-only check — this is the real,
 * database-backed check that actually enforces the rule.
 */
export async function requireAdminSession() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }
  return session;
}

/** Logs the founder out: deletes the session row and clears the cookie. */
export async function destroyAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;

  if (token) {
    // deleteMany (rather than delete) so this never throws if the session
    // row was already gone for some reason (e.g. expired and cleaned up).
    await prisma.adminSession.deleteMany({ where: { id: token } });
  }

  cookieStore.delete(ADMIN_SESSION_COOKIE_NAME);
}
