import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createLogger } from "@/lib/logger";

const logger = createLogger('MIDDLEWARE');

/**
 * Clerk SDK Middleware (v6 compatible)
 *
 * This middleware handles Clerk authentication for server-side functions like auth() and currentUser().
 * It allows both public and protected routes, with authentication checks handled by:
 * - Server-side: auth() and currentUser() in API routes and server components
 * - Client-side: useAuth() and useUser() hooks in client components
 *
 * In Clerk v5+/v6, clerkMiddleware runs for ALL routes so auth() works everywhere.
 * Public routes simply don't call auth.protect(), so unauthenticated users can access them.
 * Protected routes call auth.protect() which redirects to sign-in if not authenticated.
 *
 * PROXY SETUP:
 * The Clerk publishable key encodes FAPI domain as clerk.event-site-manager.com (no www).
 * But the site runs at www.event-site-manager.com. Without a proxy, Clerk tries to reach
 * clerk.www.event-site-manager.com which doesn't exist in DNS.
 *
 * Fix: NEXT_PUBLIC_CLERK_PROXY_URL env variable tells Clerk to route handshake requests
 * through /__clerk/* path. The rewrite in next.config.mjs forwards /__clerk/* to
 * clerk.event-site-manager.com/*. The /__clerk path is EXCLUDED from the middleware
 * matcher so the auth handler doesn't run on proxy requests (which would cause a loop).
 */

// Public routes that don't require authentication
// CRITICAL: These routes must be accessible without session cookies (Playwright tests, curl, etc.)
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/sso-callback(.*)',
  '/auth/signout-redirect(.*)',
  '/api/webhooks(.*)',
  '/api/public(.*)',
  '/api/proxy(.*)',
  '/api/event/success(.*)',
  '/api/membership/success(.*)',
  '/api/events/donation/success(.*)',
  '/membership/success(.*)',
  '/membership/qr(.*)',
  '/api/diagnostic(.*)',
  '/api/logs(.*)',
  '/api/stripe/payment-intent(.*)',
  '/api/stripe/event-checkout(.*)',
  '/api/stripe/membership-payment-intent(.*)',
  '/api/payment(.*)',
  '/api/billing(.*)',
  '/api/checkout(.*)',
  '/api/health(.*)',
  '/api/liturgy(.*)',
  '/mosc(.*)',
  '/syro(.*)',
  '/events(.*)',
  '/sponsors(.*)',
  '/team(.*)',
  '/gallery(.*)',
  '/about(.*)',
  '/contact(.*)',
  '/polls(.*)',
  '/charity-theme(.*)',
  '/calendar(.*)',
  '/focus-groups(.*)',
  '/pricing(.*)',
  '/member-portal(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  const pathname = req.nextUrl.pathname;
  const isApiRoute = pathname.startsWith('/api/');
  const isApiProxy = pathname.startsWith('/api/proxy');
  const isDiagnostic = pathname.startsWith('/api/diagnostic');
  const userAgent = req.headers.get('user-agent') || 'unknown';

  // Enhanced mobile detection
  const userAgentMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|WhatsApp|Mobile|CriOS|FxiOS/i.test(userAgent);
  const cloudfrontMobile = req.headers.get('cloudfront-is-mobile-viewer') === 'true';
  const cloudfrontAndroid = req.headers.get('cloudfront-is-android-viewer') === 'true';
  const cloudfrontIOS = req.headers.get('cloudfront-is-ios-viewer') === 'true';
  const isMobile = userAgentMobile || cloudfrontMobile || cloudfrontAndroid || cloudfrontIOS;

  // Log API requests
  if (isApiRoute) {
    logger.info('API REQUEST DETECTED', {
      pathname,
      method: req.method,
      isMobile,
      isProxy: isApiProxy,
      isDiagnostic,
      userAgent: userAgent.substring(0, 150),
      timestamp: new Date().toISOString(),
    });
  }

  // For protected routes, require authentication
  // Public routes skip auth.protect() so unauthenticated users can access them
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals, static files, AND /__clerk proxy path
    // CRITICAL: /__clerk MUST be excluded so the middleware auth handler doesn't run on
    // Clerk FAPI proxy requests. The next.config.mjs rewrite handles /__clerk/* instead.
    // If /__clerk is matched, middleware triggers another handshake → infinite redirect loop.
    '/((?!_next|__clerk|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
