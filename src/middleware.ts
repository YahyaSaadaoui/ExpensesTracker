import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC = ["/api/login", "/api/logout", "/api/health"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only protect API routes
  if (!pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  if (PUBLIC.includes(pathname)) {
    return NextResponse.next();
  }

  const token = req.cookies.get("et_session")?.value;

  if (!token) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
