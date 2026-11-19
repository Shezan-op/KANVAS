import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const { pathname } = request.nextUrl;

  // Check if request is hitting an app subdomain (e.g. app.kanvas.com or app.localhost:3000)
  const isAppSubdomain = hostname.startsWith("app.");

  if (isAppSubdomain) {
    // If user accesses app root on app subdomain (e.g. app.domain.com/), rewrite to /app
    if (pathname === "/") {
      return NextResponse.rewrite(new URL("/app", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (.svg, .png, .jpg, etc)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
