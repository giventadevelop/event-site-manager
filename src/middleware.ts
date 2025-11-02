import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { getSatelliteDomains } from "@/lib/env";

export default authMiddleware({
  // Public routes that don't require authentication
  publicRoutes: [
    "/",
    "/event",
    "/event/success",
    "/event/success/(.*)",
    "/event/ticket-qr",
    "/test-mobile",
    "/pricing",
    "/events",
    "/events/(.*)/tickets",
    "/events/(.*)/tickets/(.*)",
    "/events/(.*)/register",
    "/events/(.*)/register/(.*)",
    "/events/(.*)/checkout",
    "/events/(.*)/checkout/(.*)",
    "/events/(.*)/payment",
    "/events/(.*)/payment/(.*)",
    "/events/(.*)/success",
    "/events/(.*)/success/(.*)",
    "/events/(.*)",
    "/auth/signout-redirect",  // Sign-out redirect page for satellite domains
    "/api/proxy/(.*)",
    "/api/webhooks/(.*)",
    "/api/event/success/process",
    "/api/debug/(.*)",
    "/api/test-mobile",
    "/api/tasks",
    "/api/billing/(.*)",
    "/api/stripe/(.*)",
    "/api/payment/(.*)",
    "/api/checkout/(.*)",
    "/images/(.*)",
    "/_next/(.*)",
    "/favicon.ico",
    "/manifest.json",
    "/robots.txt",
    "/sitemap.xml"
  ],

  // Routes that can be accessed while signed out, but also show user info if signed in
  ignoredRoutes: [
    "/api/webhooks/(.*)",
    "/api/proxy/(.*)",
    "/api/stripe/event-checkout",
    "/api/stripe/get-session",
    "/api/payment/(.*)",
    "/api/checkout/(.*)",
    "/api/billing/(.*)"
  ],

  // Debug mode for development
  debug: true,

  // After authentication, redirect to this path if the user is not signed in
  afterAuth(auth, req) {
    // Add CORS headers for Clerk proxy requests from satellite domains
    if (req.nextUrl.pathname.startsWith('/__clerk')) {
      const origin = req.headers.get('origin');

      // Get allowed origins from environment variable
      // Read from NEXT_PUBLIC_SATELLITE_DOMAINS: "https://www.mosc-temp.com,https://www.md-strikers.com,..."
      const allowedOrigins = getSatelliteDomains();

      // Handle preflight OPTIONS requests
      if (req.method === 'OPTIONS') {
        const response = new NextResponse(null, { status: 200 });
        if (origin && allowedOrigins.includes(origin)) {
          response.headers.set('Access-Control-Allow-Origin', origin);
        }
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        response.headers.set('Access-Control-Allow-Credentials', 'true');
        return response;
      }

      // For actual requests, add CORS headers and continue
      const response = NextResponse.next();
      if (origin && allowedOrigins.includes(origin)) {
        response.headers.set('Access-Control-Allow-Origin', origin);
      }
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      return response;
    }

    // Handle users who aren't authenticated
    if (!auth.userId && !auth.isPublicRoute) {
      return Response.redirect(new URL('/sign-in', req.url));
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.[\\w]+$|_next).*)',
    // Optional: Protect API routes
    '/(api|trpc)(.*)',
  ],
};