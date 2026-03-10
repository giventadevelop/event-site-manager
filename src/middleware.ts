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
 * This ensures:
 * - Playwright tests work (public routes don't get 401)
 * - auth() calls work in layout.tsx (Clerk middleware runs for all routes)
 * - Admin menu appears correctly (admin lookup in layout.tsx works via userRole === 'ADMIN')
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

export default clerkMiddleware({
  // CRITICAL: Enable Frontend API proxy to route Clerk handshake requests through /__clerk
  // Without this, clerkMiddleware issues a 307 redirect to clerk.<hostname> (e.g., clerk.www.event-site-manager.com)
  // which may not exist in DNS. With frontendApiProxy, the handshake goes through /__clerk/* instead.
  frontendApiProxy: { enabled: true },
}, async (auth, req) => {
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
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes and Clerk proxy path
    '/(api|trpc|__clerk)(.*)',
  ],
};
