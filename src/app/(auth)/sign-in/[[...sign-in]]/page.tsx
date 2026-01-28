// Satellite domain - redirect to primary domain for authentication
// For localhost - show Clerk component directly for development
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SignIn } from '@clerk/nextjs';
import { useAuth, useUser } from '@clerk/nextjs';
import { bootstrapUserProfile } from '@/components/ProfileBootstrapperApiServerActions';

export default function SignInPage() {
  const router = useRouter();
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [isLocalhost, setIsLocalhost] = useState(false);
  const { isSignedIn, userId, isLoaded } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    // After sign-in completes locally, bootstrap tenant-scoped profile (upsert)
    if (isLoaded && isSignedIn && userId) {
      bootstrapUserProfile({ userId, user }).catch(() => { });
    }

    // Check if we're on a satellite domain
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;

      // Check if localhost - show Clerk component for development
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        setIsLocalhost(true);
        return;
      }

      // If on satellite domain, redirect to primary domain with return URL
      const satelliteDomain = process.env.NEXT_PUBLIC_CLERK_DOMAIN || 'mosc-temp.com';
      if (hostname.includes('mosc-temp.com') || hostname.includes(satelliteDomain.replace('www.', ''))) {
        setShouldRedirect(true);
        // Get the current URL to return to after authentication
        const currentUrl = window.location.origin;

        // Get primary domain from environment variable
        const primaryDomain = process.env.NEXT_PUBLIC_PRIMARY_DOMAIN || 'www.event-site-manager.com';

        // Redirect to primary domain with redirect_url parameter
        // Clerk will redirect back to this URL after successful authentication
        const redirectUrl = `https://${primaryDomain}/sign-in?redirect_url=${encodeURIComponent(currentUrl)}`;
        window.location.href = redirectUrl;
      }
    }
  }, []);

  // Show Clerk component for localhost development
  if (isLocalhost) {
    return (
      <main className="flex flex-col items-center justify-center flex-1 py-2">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-center text-gray-900">Sign In</h1>
          <p className="text-sm text-gray-500 text-center mt-2">(Development Mode)</p>
        </div>
        <SignIn
          routing="path"
          path="/sign-in"
        />
      </main>
    );
  }

  // Show loading state while redirecting (satellite domain)
  if (shouldRedirect) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to sign in...</p>
        </div>
      </main>
    );
  }

  // Default: show nothing (will determine redirect/component in useEffect)
  return null;
}