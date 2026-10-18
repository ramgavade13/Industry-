import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ROLES = ["ceo", "admin", "manager", "employee"];

// Which roles may open each shared page (SRS Section 14).
const PAGE_ROLES: Record<string, string[]> = {
  "/productivity": ["ceo", "admin", "manager"],
  "/projects": ["ceo", "admin", "manager"],
  "/tasks": ["ceo", "admin", "manager"],
  "/risk": ["ceo", "admin", "manager"],
  "/forecasting": ["ceo", "admin"],
  "/recommendations": ["ceo", "admin"],
  "/reports": ["ceo", "admin", "manager"],
  "/chat": ROLES,
  "/voice": ROLES,
};

export function proxy(request: NextRequest) {
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

  // Shared pages: only the roles the SRS allows
  for (const [page, allowed] of Object.entries(PAGE_ROLES)) {
    if ((path === page || path.startsWith(`${page}/`)) && !allowed.includes(role)) {
      return NextResponse.redirect(new URL(`/dashboard/${role}`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/productivity/:path*",
    "/projects/:path*",
    "/tasks/:path*",
    "/risk/:path*",
    "/forecasting/:path*",
    "/recommendations/:path*",
    "/reports/:path*",
    "/chat/:path*",
    "/voice/:path*",
  ],
};