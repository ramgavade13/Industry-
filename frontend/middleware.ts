import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ROLES = ["ceo", "admin", "manager", "employee"];

export function middleware(request: NextRequest) {
  const role = request.cookies.get("role")?.value;
  const path = request.nextUrl.pathname;

  // Not logged in at all — send to login, remember where they were headed
  if (!role) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", path);
    return NextResponse.redirect(loginUrl);
  }

  // Logged in, but the role cookie isn't one we recognise — treat as logged out
  if (!ROLES.includes(role)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Stop a Manager from opening /dashboard/ceo (or any other role's page) by URL
  if (path.startsWith("/dashboard/")) {
    const requestedRole = path.split("/")[2];
    if (requestedRole && ROLES.includes(requestedRole) && requestedRole !== role) {
      return NextResponse.redirect(new URL(`/dashboard/${role}`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/productivity/:path*",
    "/forecasting/:path*",
    "/recommendations/:path*",
    "/reports/:path*",
    "/chat/:path*",
  ],
};
