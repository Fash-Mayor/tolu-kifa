// -----------------------------------------------------------------------------
// Proxy (Next.js 16's name for what older tutorials call "middleware").
// -----------------------------------------------------------------------------
// Next.js runs the function below before almost every matching request,
// ahead of any page rendering. We use it for one job: a fast, "optimistic"
// bounce of signed-out visitors away from /admin pages.
//
// This check ONLY looks at whether the session cookie exists — it does not
// query the database (that would run on every single request, including
// ones for pages that don't even need it, which is wasteful). The real,
// authoritative check — is this session actually still valid? — happens in
// src/lib/auth.ts's `requireAdminSession()`, used inside
// src/app/admin/(protected)/layout.tsx. Cheap check here + real check there
// is the pattern Next.js's own docs recommend.
// -----------------------------------------------------------------------------

import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE_NAME } from "@/lib/constants";

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === "/admin/login";
  const hasSessionCookie = request.cookies.has(ADMIN_SESSION_COOKIE_NAME);

  if (!isLoginPage && !hasSessionCookie) {
    // No cookie at all -> definitely not logged in, send to login.
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (isLoginPage && hasSessionCookie) {
    // Already have a cookie and trying to view the login page again ->
    // just go to the dashboard instead.
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

// Restrict this to admin routes only, so public pages (the shop, gallery,
// etc.) are never slowed down by this check.
export const config = {
  matcher: ["/admin/:path*"],
};
