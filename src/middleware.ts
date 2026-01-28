import { authMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createLogger } from "@/lib/logger";

const logger = createLogger('MIDDLEWARE');

/**
 * Clerk SDK Middleware (v4 compatible)
 *
 * This middleware handles Clerk authentication for server-side functions like auth() and currentUser().
 * It allows both public and protected routes, with authentication checks handled by:
 * - Server-side: auth() and currentUser() in API routes and server components
 * - Client-side: useAuth() and useUser() hooks in client components
 *
 * CRITICAL: This middleware wrapper does NOT break Clerk's authMiddleware() detection because:
 * 1. We call authMiddleware() (as clerkMiddleware) - Clerk detects it by checking file contents
 * 2. Clerk middleware runs for all routes (including public routes) so auth() works in layout.tsx
 * 3. The wrapper only intercepts 401/redirect responses for Playwright tests, it doesn't prevent Clerk from running
 *
 * This ensures:
 * - ✅ Playwright tests work (public routes don't get 401)
 * - ✅ auth() calls work in layout.tsx (Clerk middleware runs)
 * - ✅ Admin menu appears correctly (admin lookup in layout.tsx works via userRole === 'ADMIN')
 *
 * See: .cursor/rules/clerk_auth_admin_user_lookup.mdc for the complete pattern
 */

// Compute satellite config safely for production to avoid missing domain/proxyUrl
// CRITICAL: Disable satellite config for localhost to prevent 401 errors on public routes
const isLocalhost = process.env.NEXT_PUBLIC_APP_URL?.includes('localhost') ||
                    process.env.NEXT_PUBLIC_APP_URL?.includes('127.0.0.1') ||
                    !process.env.NEXT_PUBLIC_APP_URL;
const isSatEnv = !isLocalhost && (
  process.env.NEXT_PUBLIC_CLERK_IS_SATELLITE === 'true' ||
  process.env.NEXT_PUBLIC_APP_URL?.includes('mosc-temp.com')
);
const satDomain = process.env.NEXT_PUBLIC_CLERK_DOMAIN || (process.env.NEXT_PUBLIC_APP_URL?.includes('mosc-temp.com') ? 'www.mosc-temp.com' : undefined);
const satProxyUrl = process.env.NEXT_PUBLIC_CLERK_PROXY_URL;
const satConfig: any = {};
if (isSatEnv && !isLocalhost) {
  if (satDomain) {
    Object.assign(satConfig, { isSatellite: true, domain: satDomain });
  } else if (satProxyUrl) {
    Object.assign(satConfig, { isSatellite: true, proxyUrl: satProxyUrl });
  }
}

// Define public routes that don't require authentication
// CRITICAL: These routes must be accessible without session cookies (Playwright tests, curl, etc.)
const publicRoutePatterns = [
  /^\/$/,
  /^\/sign-in/,
  /^\/sign-up/,
  /^\/sso-callback/,
  /^\/api\/webhooks/,
  /^\/api\/public/,
  /^\/api\/proxy/,
  /^\/api\/event\/success/,
  /^\/api\/membership\/success/,
  /^\/membership\/success/,
  /^\/membership\/qr/,
  /^\/api\/diagnostic/,
  /^\/api\/logs/,
  /^\/mosc/,
  /^\/events/,
  /^\/sponsors/,
  /^\/team/,
  /^\/gallery/,
  /^\/about/,
  /^\/contact/,
  /^\/polls/,
  /^\/charity-theme/,
  /^\/calendar/,
  /^\/focus-groups/,
  /^\/pricing/,
];

function isPublicRoute(pathname: string): boolean {
  return publicRoutePatterns.some(pattern => pattern.test(pathname));
}

// Create Clerk middleware
const clerkMiddleware = authMiddleware({
  // Define public routes that don't require authentication
  // IMPORTANT: Public API routes allow unauthenticated users to fetch public data
  // CRITICAL: Routes must be accessible without session cookies (Playwright tests, curl, etc.)
  // NOTE: Clerk's publicRoutes uses glob patterns - use pattern matches for consistency
  publicRoutes: [
    '/',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/sso-callback(.*)',
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
  ],

  // Satellite domain configuration (only applied when envs are set)
  ...satConfig,

  // For Amplify domains or satellite domains, point to primary domain for sign-in
  signInUrl: process.env.NEXT_PUBLIC_APP_URL?.includes('amplifyapp.com') || process.env.NEXT_PUBLIC_APP_URL?.includes('mosc-temp.com')
    ? `https://${process.env.NEXT_PUBLIC_PRIMARY_DOMAIN || 'www.event-site-manager.com'}/sign-in`
    : '/sign-in',

  // Ignore authentication on prefetch requests for public routes
  ignoredRoutes: [
    // Ignore Next.js RSC prefetch requests for public routes
    '/(.*)?_rsc=(.*)$',
    // CRITICAL: Completely ignore API proxy routes (don't even apply Clerk middleware)
    '/api/webhooks/(.*)',
    '/api/proxy/(.*)',
    '/api/event/success/(.*)',  // CRITICAL: Ignore payment success processing (mobile browser compatibility)
    '/api/membership/success/(.*)',  // CRITICAL: Ignore membership success processing (mobile browser compatibility)
    '/api/events/donation/success/(.*)',  // CRITICAL: Ignore donation success processing (mobile browser compatibility)
    '/api/stripe/payment-intent(.*)',  // Ignore payment intent route (mobile wallet)
    '/api/stripe/event-checkout(.*)',  // Ignore event checkout route
    '/api/stripe/membership-payment-intent(.*)',  // Ignore membership payment intent route (mobile wallet)
    // NOTE: /api/stripe/membership-checkout is NOT ignored - it needs Clerk middleware for auth()
    '/api/payment/(.*)',
    '/api/billing/(.*)',
    '/api/checkout/(.*)',
    '/api/diagnostic(.*)',
    '/api/logs(.*)',
    // CRITICAL: Public page routes that DON'T need auth() calls
    // IMPORTANT: Routes like /events, /gallery, /calendar, /mosc are NOT in ignoredRoutes
    // because layout.tsx calls auth() to check admin status for header menu visibility
    // They remain in publicRoutes so they're accessible without authentication, but middleware must run for auth() to work
    // NOTE: Only routes that truly don't need Clerk middleware at all should be in ignoredRoutes
    // NOTE: Homepage (/), /events, /gallery, /calendar, /mosc, /polls, /pricing are NOT ignored - they need Clerk middleware for auth() calls
  ],

  // Custom logic to add pathname header and handle prefetch requests
  afterAuth(auth, req) {
    // CRITICAL: Log ALL requests to verify they're reaching middleware
    const pathname = req.nextUrl.pathname;
    const isApiRoute = pathname.startsWith('/api/');
    const isApiProxy = pathname.startsWith('/api/proxy');
    const isDiagnostic = pathname.startsWith('/api/diagnostic');
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // DEBUG: Log all requests to see if afterAuth is being called
    console.log('[MIDDLEWARE] afterAuth called for:', pathname);
    console.log('[MIDDLEWARE] Auth state:', { userId: auth?.userId || null, sessionId: auth?.sessionId || null });

    // Enhanced mobile detection: Include WhatsApp, mobile browsers, and CloudFront headers
    const userAgentMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|WhatsApp|Mobile|CriOS|FxiOS/i.test(userAgent);
    const cloudfrontMobile = req.headers.get('cloudfront-is-mobile-viewer') === 'true';
    const cloudfrontAndroid = req.headers.get('cloudfront-is-android-viewer') === 'true';
    const cloudfrontIOS = req.headers.get('cloudfront-is-ios-viewer') === 'true';
    const isMobile = userAgentMobile || cloudfrontMobile || cloudfrontAndroid || cloudfrontIOS;

    // CRITICAL: Log ALL API requests using robust logger (can't be stripped)
    if (isApiRoute) {
      // Use robust logger that can't be stripped by Next.js
      logger.info('API REQUEST DETECTED', {
        pathname,
        method: req.method,
        isMobile,
        isProxy: isApiProxy,
        isDiagnostic,
        userAgent: userAgent.substring(0, 150),
        timestamp: new Date().toISOString(),
      });

      // Also use console.log for backward compatibility
      console.log('[MIDDLEWARE] ===== API REQUEST DETECTED =====');
      console.log('[MIDDLEWARE] Pathname:', pathname);
      console.log('[MIDDLEWARE] Method:', req.method);
      console.log('[MIDDLEWARE] Is Mobile:', isMobile);
      console.log('[MIDDLEWARE] Is Proxy:', isApiProxy);
      console.log('[MIDDLEWARE] Is Diagnostic:', isDiagnostic);
      console.log('[MIDDLEWARE] User-Agent:', userAgent.substring(0, 150));
      console.log('[MIDDLEWARE] Timestamp:', new Date().toISOString());
      console.log('[MIDDLEWARE] ===== END API REQUEST LOG =====');
    }

    // CRITICAL: Explicitly allow public routes even if auth check fails
    // This ensures public routes work even without session cookies (e.g., Playwright tests, curl)
    // Note: pathname is already declared above (line 90), so we reuse it here

    // Define public route patterns (must match publicRoutes array)
    const publicRoutePatterns = [
      /^\/$/,
      /^\/sign-in/,
      /^\/sign-up/,
      /^\/sso-callback/,
      /^\/api\/webhooks/,
      /^\/api\/public/,
      /^\/api\/proxy/,
      /^\/api\/event\/success/,
      /^\/api\/membership\/success/,
      /^\/membership\/success/,
      /^\/membership\/qr/,
      /^\/api\/diagnostic/,
      /^\/api\/logs/,
      /^\/mosc/,
      /^\/events/,
      /^\/sponsors/,
      /^\/team/,
      /^\/gallery/,
      /^\/about/,
      /^\/contact/,
      /^\/polls/,
      /^\/charity-theme/,
      /^\/calendar/,
      /^\/focus-groups/,
      /^\/pricing/,
    ];

    // Check if this is a public route
    const isPublicRoute = publicRoutePatterns.some(pattern => pattern.test(pathname));

    // Add pathname header for layout detection (used by ConditionalLayout)
    const response = NextResponse.next();
    response.headers.set('x-pathname', pathname);

    // For public routes, always allow them through (even without auth)
    // This fixes Playwright/curl tests that don't have session cookies
    if (isPublicRoute) {
      return response;
    }

    // For prefetch requests on public routes, always allow them through
    if (req.nextUrl.searchParams.has('_rsc')) {
      // This is a Next.js prefetch/RSC request, allow it through without auth
      return response;
    }

    return response;
  }
});

// CRITICAL: Custom middleware wrapper that intercepts Clerk's 401 responses for public routes
// This prevents Clerk from returning 401 for public routes when there's no session cookie
//
// IMPORTANT: This wrapper does NOT break Clerk's authMiddleware() detection because:
// 1. We still call authMiddleware() (as clerkMiddleware) - Clerk detects it by checking file contents
// 2. Clerk middleware runs for all routes (including public routes) so auth() works in layout.tsx
// 3. The wrapper only intercepts 401/redirect responses, it doesn't prevent Clerk from running
//
// This ensures:
// - ✅ Playwright tests work (public routes don't get 401)
// - ✅ auth() calls work in layout.tsx (Clerk middleware runs)
// - ✅ Admin menu appears correctly (admin lookup in layout.tsx works)
export default async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const isPublic = isPublicRoute(pathname);

  if (isPublic) {
    console.log('[MIDDLEWARE] Public route detected:', pathname);
  }

  // Always call Clerk middleware (even for public routes) so auth() works in layout.tsx
  // Clerk middleware may return a Promise, so we await it
  let response = clerkMiddleware(req);

  // Handle both sync and async responses
  if (response instanceof Promise) {
    response = await response;
  }

  // CRITICAL: If Clerk returned 401 or redirected to sign-in for a public route, override it to allow access
  // This fixes Playwright/curl tests that don't have session cookies
  if (isPublic) {
    if (response instanceof NextResponse) {
      const location = response.headers.get('location');
      const isRedirectToSignIn = location && (location.includes('/sign-in') || location.includes('sign-in'));
      const isUnauthorized = response.status === 401 || response.status === 307 || response.status === 308;

      console.log('[MIDDLEWARE] Response for public route', pathname, ':', {
        status: response.status,
        location,
        isRedirectToSignIn,
        isUnauthorized
      });

      if (isUnauthorized || isRedirectToSignIn) {
        console.log('[MIDDLEWARE] ⚠️ Clerk returned', response.status, 'for public route', pathname, isRedirectToSignIn ? '(redirect to sign-in)' : '', '- overriding to 200');
        const publicResponse = NextResponse.next();
        publicResponse.headers.set('x-pathname', pathname);
        // Copy any headers from Clerk's response that we need (except location header)
        response.headers.forEach((value, key) => {
          if ((key.startsWith('x-') || key === 'set-cookie') && key !== 'location') {
            publicResponse.headers.set(key, value);
          }
        });
        return publicResponse;
      } else {
        console.log('[MIDDLEWARE] ✅ Public route', pathname, 'allowed through with status', response.status);
      }
    } else {
      console.log('[MIDDLEWARE] ⚠️ Unexpected response type for public route', pathname, ':', typeof response);
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.[\\w]+$).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};