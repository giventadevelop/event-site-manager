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
 *   1. Fetches allowed domains from /api/public/satellite-domains (backed by config/satellites.json)
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

    const runSignOut = async () => {
      // If Clerk hasn't loaded yet, wait for the loaded flag or the timeout above
      if (!loaded && signOut) return;

      if (!signOut) {
        // Clerk not available at all; redirect anyway
        console.warn('[signout-redirect] signOut not available. Redirecting.');
        redirectedRef.current = true;
        window.location.href = finalUrl;
        return;
      }

      try {
        await signOut();
        if (redirectedRef.current) return;
        redirectedRef.current = true;
        window.location.href = finalUrl;
      } catch (err) {
        if (redirectedRef.current) return;
        console.error('[signout-redirect] Sign out failed:', err);
        setError('Sign out failed. Redirecting...');
        setTimeout(() => {
          if (!redirectedRef.current) {
            redirectedRef.current = true;
            window.location.href = finalUrl;
          }
        }, 2000);
      }
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
