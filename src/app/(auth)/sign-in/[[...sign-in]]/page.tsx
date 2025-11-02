'use client';

import { SignInWithReconciliation } from "@/components/SignInWithReconciliation";
import { useSearchParams } from "next/navigation";
import { extractSatelliteConfig } from "@/lib/satelliteConfig";
import SatelliteHeader from "@/components/auth/SatelliteHeader";
import SatelliteFooter from "@/components/auth/SatelliteFooter";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect_url') || '';

  // Extract satellite configuration from redirect_url if present
  const satelliteConfig = extractSatelliteConfig(redirectUrl);
  const shouldShowSatelliteBranding = satelliteConfig?.branding?.showOnAuth;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Conditionally render satellite header */}
      {shouldShowSatelliteBranding?.header && satelliteConfig?.branding && (
        <SatelliteHeader
          branding={satelliteConfig.branding}
          satelliteDomain={satelliteConfig.domain}
        />
      )}

      <main className={`flex flex-col items-center justify-center flex-1 py-12 ${shouldShowSatelliteBranding?.header ? 'pt-8' : ''}`}>
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-center text-gray-900">Welcome Back</h1>
          {satelliteConfig ? (
            <div className="mt-4 space-y-2">
              <p className="text-center text-gray-600">Sign in to continue</p>
              <div className="flex items-center justify-center">
                <div className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-sm font-medium text-blue-700">
                    Signing in for <span className="font-bold">{satelliteConfig.displayName}</span>
                  </span>
                </div>
              </div>
              <p className="text-xs text-center text-gray-500 mt-2">
                You'll be redirected to {satelliteConfig.hostname} after signing in
              </p>
            </div>
          ) : (
            <p className="mt-2 text-center text-gray-600">Sign in to continue</p>
          )}
        </div>
        <SignInWithReconciliation />
      </main>

      {/* Conditionally render satellite footer */}
      {shouldShowSatelliteBranding?.footer && satelliteConfig?.branding && (
        <SatelliteFooter
          branding={satelliteConfig.branding}
          satelliteDomain={satelliteConfig.domain}
        />
      )}
    </div>
  );
}