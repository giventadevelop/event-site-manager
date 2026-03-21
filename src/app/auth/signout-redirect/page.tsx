'use client';

/**
 * Sign-out redirect page (primary domain only).
 *
 * Used when a user signs out from a satellite domain (e.g. mosc-temp.com).
 * The satellite redirects here; this page calls Clerk signOut() then redirects
 * the user back to the satellite (redirect_url). Required for satellite/primary
 * Clerk setup so the session is cleared on the primary and the user returns to
 * the satellite as signed out.
 *
 * Satellite domain validation:
 *   1. Fetches allowed domains from /api/public/satellite-domains (backend satellite_domain + cache, JSON fallback)
 *   2. Falls back to a hardcoded list if the fetch fails
 *   This avoids importing server-side config modules in a client component,
 *   which causes "window is not defined" errors during SSR.
 */

import { Suspense, useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useClerk } from '@clerk/nextjs';

/**
 * Hardcoded fallback satellite bare domains.
 * Used ONLY if the /api/public/satellite-domains fetch fails.
 * Must be kept roughly in sync with config/satellites.json.
 */
const FALLBACK_SATELLITES = [
  'mcefee-temp.com',
  'mosc-temp.com',
  'md-strikers.com',
  'event-site-manager.com',
  'localhost',
];

/** Max time (ms) to wait for Clerk JS to load before redirecting anyway */
const CLERK_LOAD_TIMEOUT_MS = 5000;

/**
 * Validate a redirect URL against the list of known satellite domains.
 * Returns the sanitised redirect URL or '/' if the URL is not allowed.
 */
function buildFinalUrl(redirectUrlRaw: string, allowedDomains: string[]): string {
  let decoded = typeof redirectUrlRaw === 'string' ? redirectUrlRaw : '';
  try {
    if (decoded && decoded.includes('%')) decoded = decodeURIComponent(decoded);
  } catch {
    // leave decoded as-is
  }

  // Only allow redirect to known satellite or localhost; otherwise send to /
  const allowedHost =
    decoded.startsWith('http') &&
    allowedDomains.some((host) => decoded.includes(host));
  const baseUrl = allowedHost ? decoded.replace(/\/$/, '') : '';
  return baseUrl
    ? `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}clerk_signout=true`
    : '/';
}

/**
 * Inner component that uses useSearchParams (must be wrapped in Suspense)
 */
function SignOutRedirectInner() {
  const searchParams = useSearchParams();
  const { signOut, loaded } = useClerk();
  const [error, setError] = useState<string | null>(null);
  const [allowedDomains, setAllowedDomains] = useState<string[]>(FALLBACK_SATELLITES);
  const [domainsLoaded, setDomainsLoaded] = useState(false);
  const redirectedRef = useRef(false);

  // Fetch satellite domains from public API on mount
  useEffect(() => {
    let cancelled = false;
    async function loadDomains() {
      try {
        // NOTE: Uses Pages Router endpoint path (not App Router) because Amplify
        // doesn't reliably serve App Router API routes (they 404).
        const res = await fetch('/api/public/satellite-domains', {
          cache: 'force-cache', // Use cached response when available
        });
        if (res.ok) {
          const data = await res.json();
          if (!cancelled && Array.isArray(data?.domains) && data.domains.length > 0) {
            console.log('[signout-redirect] Loaded satellite domains from API:', data.domains);
            setAllowedDomains(data.domains);
          }
        } else {
          console.warn('[signout-redirect] Failed to fetch satellite domains, using fallback. Status:', res.status);
        }
      } catch (err) {
        console.warn('[signout-redirect] Network error fetching satellite domains, using fallback:', err);
      } finally {
        if (!cancelled) setDomainsLoaded(true);
      }
    }
    loadDomains();
    return () => { cancelled = true; };
  }, []);

  // Compute the final redirect URL (re-computes when domains load)
  const redirectUrlRaw = searchParams?.get('redirect_url') ?? '';
  const finalUrl = useMemo(
    () => buildFinalUrl(redirectUrlRaw, allowedDomains),
    [redirectUrlRaw, allowedDomains],
  );

  // Safety-net: if Clerk never loads (e.g. DNS failure for clerk.event-site-manager.com),
  // redirect after timeout so the user isn't stuck on a blank spinner forever.
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!redirectedRef.current) {
        console.warn('[signout-redirect] Clerk did not load within timeout. Redirecting without sign-out.');
        redirectedRef.current = true;
        window.location.href = finalUrl;
      }
    }, CLERK_LOAD_TIMEOUT_MS);

    return () => clearTimeout(timer);
  }, [finalUrl]);

  // Main sign-out logic: runs when Clerk is loaded (or immediately if signOut is unavailable)
  useEffect(() => {
    if (redirectedRef.current) return;

    const runSignOut = () => {
      // If Clerk hasn't loaded yet, wait for the loaded flag or the timeout above
      if (!loaded && signOut) return;

      if (!signOut) {
        // Clerk not available at all; redirect anyway
        console.warn('[signout-redirect] signOut not available. Redirecting to:', finalUrl);
        redirectedRef.current = true;
        window.location.href = finalUrl;
        return;
      }

      console.log('[signout-redirect] Calling signOut, then redirecting to:', finalUrl);
      redirectedRef.current = true;

      // CRITICAL: Fire-and-forget approach for cross-domain sign-out.
      // We call signOut() WITHOUT awaiting — this initiates the session clear on
      // the primary domain. Then we redirect to the satellite MANUALLY after a
      // short delay. This avoids relying on Clerk's redirectUrl which may not
      // handle cross-domain redirects properly (Clerk can redirect to '/' instead
      // of the satellite URL). The satellite's clerk_signout=true handler will
      // call signOut() again on its own domain to fully clear the local session.
      signOut()
        .then(() => {
          console.log('[signout-redirect] signOut() resolved on primary domain');
        })
        .catch((err: unknown) => {
          console.error('[signout-redirect] signOut() error (session may still be cleared):', err);
        });

      // Redirect to satellite after a brief delay to let the signOut API call fire.
      // 500ms is enough for the Clerk client to send the sign-out request to the server.
      // Even if the redirect happens before the promise resolves, the server-side
      // session invalidation will proceed independently.
      setTimeout(() => {
        console.log('[signout-redirect] Redirecting to satellite:', finalUrl);
        window.location.href = finalUrl;
      }, 500);
    };

    runSignOut();
  }, [loaded, signOut, finalUrl]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
        <p className="text-gray-600">Signing out...</p>
      </div>
    </div>
  );
}

/**
 * Page component with Suspense boundary for useSearchParams (Next.js 15+ requirement)
 */
export default function SignOutRedirectPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
            <p className="text-gray-600">Signing out...</p>
          </div>
        </div>
      }
    >
      <SignOutRedirectInner />
    </Suspense>
  );
}
