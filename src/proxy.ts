import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAMES } from "@/lib/constants";

/**
 * Next.js Proxy - Edge-level Route Protection
 * 
 * Provides an instant first layer of security (Defense in Depth) 
 * by checking for session cookies at the edge.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Define protected routes
  // Corrected: /account is the parent for profile
  const isProtectedRoute = pathname.startsWith("/admin") || pathname.startsWith("/account");
  
  // Note: We removed the Guest Guard (redirecting from /login to /) 
  // to prevent redirection loops when a session cookie exists but the 
  // session is invalid or expired at the API level.

  // Check for session signals using centralized constants
  const hasSession = AUTH_COOKIE_NAMES.some(cookieName => request.cookies.has(cookieName));

  // 1. Protection Guard: Unauth user trying to access private route
  if (isProtectedRoute && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    
    // Construct returnUrl including current search params for deep linking
    const currentPath = pathname + search;
    url.searchParams.set("returnUrl", currentPath);
    
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

/**
 * Optimization: Only run proxy on specific paths to minimize overhead.
 */
export const config = {
  matcher: [
    "/admin/:path*",
    "/account/:path*",
    "/login",
    "/register"
  ],
};
