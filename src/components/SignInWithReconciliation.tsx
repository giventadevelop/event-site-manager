'use client';

import { SignIn } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

/**
 * Custom SignIn wrapper that triggers profile reconciliation after successful sign-in
 * This replicates the profile page workflow for sign-in instead of relying on webhooks
 */
export function SignInWithReconciliation() {
  const { isSignedIn, user } = useUser();
  const [hasTriggeredReconciliation, setHasTriggeredReconciliation] = useState(false);

  useEffect(() => {
    // Trigger profile reconciliation when user signs in
    if (isSignedIn && user && !hasTriggeredReconciliation) {
      console.log('[SignInWithReconciliation] 🔄 User signed in, triggering profile reconciliation');
      
      // Mark as triggered to prevent multiple calls
      setHasTriggeredReconciliation(true);
      
      // Trigger profile reconciliation after successful sign-in
      triggerProfileReconciliation();
    }
  }, [isSignedIn, user, hasTriggeredReconciliation]);

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

        // Optional: Show success message to user
        // You could add a toast notification here

        // Redirect to home page after successful reconciliation
        setTimeout(() => {
          window.location.href = '/home';
        }, 1000);

      } else {
        const errorData = await response.text();
        console.error('[SignInWithReconciliation] ❌ Profile reconciliation failed:', response.status, errorData);
      }
    } catch (error) {
      console.error('[SignInWithReconciliation] ❌ Error during profile reconciliation:', error);
    }
  };

  // Show regular sign-in component
  return (
    <div>
      <SignIn redirectUrl="/home" />
      
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