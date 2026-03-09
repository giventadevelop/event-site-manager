'use client';

/**
 * Sign-out redirect page (primary domain only).
 *
 * Used when a user signs out from a satellite domain (e.g. mosc-temp.com).
 * The satellite redirects here; this page calls Clerk signOut() then redirects
 * the user back to the satellite (redirect_url). Required for satellite/primary
 * Clerk setup so the session is cleared on the primary and the user returns to
 * the satellite as signed out.
 */

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useClerk } from '@clerk/nextjs';
import { getSatelliteBareDomains } from '@/lib/satelliteConfig';

/** All known satellite bare domains + localhost, loaded from config/satellites.json */
const ALLOWED_SATELLITES = [...getSatelliteBareDomains(), 'localhost'];

/** Max time (ms) to wait for Clerk JS to load before redirecting anyway */
const CLERK_LOAD_TIMEOUT_MS = 5000;

function buildFinalUrl(redirectUrlRaw: string): string {
  let decoded = typeof redirectUrlRaw === 'string' ? redirectUrlRaw : '';
  try {
    if (decoded && decoded.includes('%')) decoded = decodeURIComponent(decoded);
  } catch {
    // leave decoded as-is
  }

  // Only allow redirect to known satellite or localhost; otherwise send to /
  const allowedHost =
    decoded.startsWith('http') &&
    ALLOWED_SATELLITES.some((host) => decoded.includes(host));
  const baseUrl = allowedHost ? decoded.replace(/\/$/, '') : '';
  return baseUrl
    ? `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}clerk_signout=true`
    : '/';
}

export default function SignOutRedirectPage() {
  const searchParams = useSearchParams();
  const { signOut, loaded } = useClerk();
  const [error, setError] = useState<string | null>(null);
  const redirectedRef = useRef(false);

  // Compute the final redirect URL once
  const redirectUrlRaw = searchParams?.get('redirect_url') ?? '';
  const finalUrl = buildFinalUrl(redirectUrlRaw);

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
