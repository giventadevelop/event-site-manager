'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { SignIn, useAuth, useUser } from '@clerk/nextjs';
import { bootstrapUserProfile } from '@/components/ProfileBootstrapperApiServerActions';
import SatelliteAuthBranding from '@/components/auth/SatelliteAuthBranding';

/**
 * Minimal primary-domain landing at `/` (no main Header/Footer — see ConditionalLayout).
 * Satellite flows continue to use `https://<primary>/sign-in?redirect_url=...` (unchanged).
 * Hash routing lets Clerk render sign-in on `/` without conflicting with `/sign-in` path routing.
 */
export default function RootAuthLanding() {
  const searchParams = useSearchParams();
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { isSignedIn, userId, isLoaded } = useAuth();
  const { user } = useUser();
  const redirectUrlFromQuery = searchParams?.get('redirect_url') ?? null;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isLoaded && isSignedIn && userId && user) {
      bootstrapUserProfile({
        userId,
        userData: {
          email: user.emailAddresses?.[0]?.emailAddress || undefined,
          firstName: user.firstName || undefined,
          lastName: user.lastName || undefined,
          imageUrl: user.imageUrl || undefined,
        },
      }).catch(() => {});
    }
  }, [isLoaded, isSignedIn, userId, user]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') return;

    const primaryDomain = process.env.NEXT_PUBLIC_PRIMARY_DOMAIN || 'www.event-site-manager.com';
    const primaryHost = primaryDomain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const isPrimary =
      hostname === primaryHost ||
      hostname === primaryDomain ||
      hostname.includes(primaryHost.replace('www.', '')) ||
      hostname.includes(primaryDomain.replace('www.', ''));
    if (isPrimary) return;

    const isSatellite = hostname.includes('mosc-temp.com');
    if (isSatellite) {
      setShouldRedirect(true);
      const signInUrl = `https://${primaryHost}/sign-in?redirect_url=${encodeURIComponent(window.location.origin)}`;
      window.location.href = signInUrl;
    }
  }, []);

  if (!mounted || !isLoaded) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" aria-hidden />
      </main>
    );
  }

  if (isSignedIn) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-10 gap-4">
        <p className="text-gray-800 text-center">You&apos;re signed in.</p>
        <p className="text-gray-600 text-sm text-center max-w-md">
          Open the marketing site when you&apos;re ready — nothing redirects automatically from here.
        </p>
        <Link
          href="/home"
          className="inline-flex items-center justify-center rounded-xl bg-blue-100 hover:bg-blue-200 px-6 py-3 font-semibold text-blue-800 transition-colors"
        >
          Go to /home
        </Link>
      </main>
    );
  }

  if (shouldRedirect) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Redirecting to sign in…</p>
        </div>
      </main>
    );
  }

  // Stay on `/` after sign-in unless satellite/primary sent an explicit http(s) redirect_url.
  const afterSignInRedirect =
    redirectUrlFromQuery && redirectUrlFromQuery.startsWith('http') ? redirectUrlFromQuery : '/';

  return (
    <main className="min-h-screen flex w-full flex-col bg-gray-50">
      <SatelliteAuthBranding redirectUrl={redirectUrlFromQuery} />
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-10">
        {redirectUrlFromQuery ? (
          <p className="text-sm text-gray-500 text-center mb-6 max-w-md">
            You will be returned to your site after signing in.
          </p>
        ) : null}
        <div className="w-full max-w-md">
          <SignIn
            routing="hash"
            forceRedirectUrl={afterSignInRedirect}
            signUpUrl={
              process.env.NEXT_PUBLIC_PRIMARY_DOMAIN
                ? `https://${process.env.NEXT_PUBLIC_PRIMARY_DOMAIN.replace(/^https?:\/\//, '').replace(/\/$/, '')}/sign-up`
                : '/sign-up'
            }
          />
        </div>
      </div>
    </main>
  );
}
