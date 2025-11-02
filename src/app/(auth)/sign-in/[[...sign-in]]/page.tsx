'use client';

import { SignInWithReconciliation } from "@/components/SignInWithReconciliation";
import { useSearchParams } from "next/navigation";
import { extractSatelliteDomain, getSatelliteDomainName } from "@/lib/env";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect_url') || '';

  // Extract satellite domain from redirect_url if present
  const satelliteHostname = extractSatelliteDomain(redirectUrl);
  const satelliteName = satelliteHostname ? getSatelliteDomainName(satelliteHostname) : null;

  return (
    <main className="flex flex-col items-center justify-center flex-1 py-2">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-center text-gray-900">Welcome Back</h1>
        {satelliteName ? (
          <div className="mt-4 space-y-2">
            <p className="text-center text-gray-600">Sign in to continue</p>
            <div className="flex items-center justify-center">
              <div className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-sm font-medium text-blue-700">
                  Signing in for <span className="font-bold">{satelliteName}</span>
                </span>
              </div>
            </div>
            <p className="text-xs text-center text-gray-500 mt-2">
              You'll be redirected to {satelliteHostname} after signing in
            </p>
          </div>
        ) : (
          <p className="mt-2 text-center text-gray-600">Sign in to continue</p>
        )}
      </div>
      <SignInWithReconciliation />
    </main>
  );
}