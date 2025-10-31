'use client';

import { SignIn } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Custom SignIn wrapper that triggers profile reconciliation after successful sign-in
 * This replicates the profile page workflow for sign-in instead of relying on webhooks
 */
export function SignInWithReconciliation() {
  const { isSignedIn, user } = useUser();
  const [hasTriggeredReconciliation, setHasTriggeredReconciliation] = useState(false);
  const searchParams = useSearchParams();

  // Get redirect_url from query parameters (for satellite domain redirects)
  const redirectUrl = searchParams?.get('redirect_url') || '/';

  useEffect(() => {
    // Trigger profile reconciliation when user signs in
    if (isSignedIn && user && !hasTriggeredReconciliation) {
      console.log('[SignInWithReconciliation] 🔄 User signed in, triggering profile reconciliation');
      console.log('[SignInWithReconciliation] 📍 Redirect URL:', redirectUrl);

      // Mark as triggered to prevent multiple calls
      setHasTriggeredReconciliation(true);

      // Trigger profile reconciliation after successful sign-in
      triggerProfileReconciliation();
    }
  }, [isSignedIn, user, hasTriggeredReconciliation, redirectUrl]);

  const triggerProfileReconciliation = async () => {
    try {
      console.log('[SignInWithReconciliation] 🚀 Starting profile reconciliation after sign-in');

      const response = await fetch('/api/auth/profile-reconciliation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          triggerSource: 'sign_in_flow',
          timestamp: new Date().toISOString()
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('[SignInWithReconciliation] ✅ Profile reconciliation completed:', data);

        if (data.reconciliationNeeded) {
          console.log('[SignInWithReconciliation] 🔄 Profile was updated with Clerk data');
        } else {
          console.log('[SignInWithReconciliation] ✅ Profile was already up-to-date');
        }

        // Redirect to the specified URL (satellite domain or home page)
        console.log('[SignInWithReconciliation] 🎯 Redirecting to:', redirectUrl);
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 1000);

      } else {
        const errorData = await response.text();
        console.error('[SignInWithReconciliation] ❌ Profile reconciliation failed:', response.status, errorData);

        // Still redirect even if reconciliation fails
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 1000);
      }
    } catch (error) {
      console.error('[SignInWithReconciliation] ❌ Error during profile reconciliation:', error);

      // Still redirect even if there's an error
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 1000);
    }
  };

  // Show regular sign-in component with dynamic redirect URL
  return (
    <div>
      <SignIn redirectUrl={redirectUrl} />

      {/* Optional: Show reconciliation status */}
      {isSignedIn && hasTriggeredReconciliation && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-700">
            ✅ Sign-in successful! Updating your profile...
          </p>
        </div>
      )}
    </div>
  );
}