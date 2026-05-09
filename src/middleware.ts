import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js Middleware - Edge-level Route Protection
 * 
 * Provides an instant first layer of security by checking for the session cookie.
 * This prevents unauthenticated users from even reaching the rendering phase 
 * for protected pages, improving performance and security.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define protected and guest-only routes
  const isProtectedRoute = pathname.startsWith("/profile");
  const isGuestRoute = pathname.startsWith("/login") || pathname.startsWith("/register");

  // Check for session cookie (placeholder name, update if backend uses different name)
  // In a real scenario, this would be the actual auth cookie name
  const hasSession = request.cookies.has("auth-session") || 
                     request.cookies.has(".AspNetCore.Cookies") ||
                     request.cookies.has("session");

  // 1. Protection Guard: Unauth user trying to access private route
  if (isProtectedRoute && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    // Preserve the original destination as a redirect parameter if needed
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // 2. Guest Guard: Auth user trying to access login/register
  if (isGuestRoute && hasSession) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// Optimization: Only run middleware on specific paths
export const config = {
  matcher: [
    "/profile/:path*",
    "/login",
    "/register"
  ],
};
