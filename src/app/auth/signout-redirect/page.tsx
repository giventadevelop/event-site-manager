'use client';

import { useEffect, useState } from 'react';
import { useClerk } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';

/**
 * Dedicated sign-out page for handling satellite domain sign-outs
 *
 * This page should ONLY be accessed on the PRIMARY domain (www.event-site-manager.com)
 * Flow:
 * 1. Satellite domain redirects here with ?redirect_url=satellite-url
 * 2. This page calls Clerk's signOut() on primary domain (clears cookies)
 * 3. Redirects back to satellite domain with clerk_signout=true flag
 */
export default function SignOutRedirect() {
  const { signOut } = useClerk();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'error'>('processing');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const performSignOut = async () => {
      try {
        console.log('[SignOut Redirect] Starting sign-out process...');

        // Get redirect URL from query params
        const redirectUrl = searchParams.get('redirect_url') || '/';
        console.log('[SignOut Redirect] Redirect URL:', redirectUrl);

        // Validate redirect URL (security check)
        if (redirectUrl && !redirectUrl.startsWith('http')) {
          // Relative URL, use as-is
        } else if (redirectUrl) {
          // Absolute URL - validate it's one of our domains
          const allowedDomains = ['mcefee-temp.com', 'event-site-manager.com'];
          const url = new URL(redirectUrl);
          const isAllowed = allowedDomains.some(domain => url.hostname.includes(domain));

          if (!isAllowed) {
            console.error('[SignOut Redirect] Invalid redirect URL:', redirectUrl);
            setError('Invalid redirect URL');
            setStatus('error');
            return;
          }
        }

        console.log('[SignOut Redirect] Calling Clerk signOut...');

        // Sign out (without redirect parameter - Clerk handles it differently)
        await signOut();

        console.log('[SignOut Redirect] Sign out complete, manually redirecting to:', redirectUrl);

        // Add a flag to indicate sign-out was successful
        // This helps the satellite domain know to clear its local Clerk state
        const separator = redirectUrl.includes('?') ? '&' : '?';
        const redirectWithFlag = `${redirectUrl}${separator}clerk_signout=true`;

        console.log('[SignOut Redirect] ===== REDIRECTING =====');
        console.log('[SignOut Redirect] Original URL:', redirectUrl);
        console.log('[SignOut Redirect] URL with flag:', redirectWithFlag);
        console.log('[SignOut Redirect] ========================');

        // Add a small delay to ensure sign-out completed
        await new Promise(resolve => setTimeout(resolve, 500));

        // Manually redirect after sign out completes
        console.log('[SignOut Redirect] Executing redirect now...');
        window.location.href = redirectWithFlag;
      } catch (err) {
        console.error('[SignOut Redirect] Error during sign-out:', err);
        setError(String(err));
        setStatus('error');

        // Even on error, try to redirect after a delay
        const redirectUrl = searchParams.get('redirect_url') || '/';
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 2000);
      }
    };

    performSignOut();
  }, [signOut, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        {status === 'processing' && (
          <>
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <h2 className="mt-6 text-2xl font-bold text-gray-900">
                Signing out...
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Please wait while we sign you out.
              </p>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="mt-6 text-2xl font-bold text-gray-900">
                Sign out error
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {error || 'An error occurred while signing out.'}
              </p>
              <p className="mt-2 text-sm text-gray-600">
                Redirecting back in a moment...
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
