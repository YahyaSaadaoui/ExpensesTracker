import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login"];
const PUBLIC_API = ["/api/login", "/api/health"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = req.cookies.get("et_session")?.value;
  const isLoggedIn = Boolean(token);

  /* ──────────────────────────────
     API AUTH
     ────────────────────────────── */
  if (pathname.startsWith("/api")) {
    if (PUBLIC_API.includes(pathname)) {
      return NextResponse.next();
    }

    if (!isLoggedIn) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.next();
  }

  /* ──────────────────────────────
     PAGE ROUTES
     ────────────────────────────── */

  // Root → always redirect to /login or /dashboard
  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(isLoggedIn ? "/dashboard" : "/login", req.url)
    );
  }

  // Visiting /login while already logged in → dashboard
  if (pathname === "/login" && isLoggedIn) {
    return NextResponse.redirect(
      new URL("/dashboard", req.url)
    );
  }

  // Visiting protected pages while NOT logged in
  if (!isLoggedIn && !PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.redirect(
      new URL("/login", req.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/dashboard/:path*", "/api/:path*"],
};
