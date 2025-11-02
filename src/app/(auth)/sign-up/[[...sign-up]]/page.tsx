'use client';

import { SignUp } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { extractSatelliteConfig } from "@/lib/satelliteConfig";
import SatelliteHeader from "@/components/auth/SatelliteHeader";
import SatelliteFooter from "@/components/auth/SatelliteFooter";

export default function SignUpPage() {
  const searchParams = useSearchParams();

  // Get redirect_url from query parameters (for satellite domain redirects)
  const redirectUrl = searchParams?.get('redirect_url') || '/';

  // Extract satellite configuration from redirect_url if present
  const satelliteConfig = extractSatelliteConfig(redirectUrl);
  const shouldShowSatelliteBranding = satelliteConfig?.branding?.showOnAuth;

  console.log('[SignUpPage] 📍 Redirect URL:', redirectUrl);
  console.log('[SignUpPage] 🌐 Satellite Config:', satelliteConfig);

  return (
    <>
      {/* Conditionally render satellite header */}
      {shouldShowSatelliteBranding?.header && satelliteConfig?.branding && (
        <SatelliteHeader
          branding={satelliteConfig.branding}
          satelliteDomain={satelliteConfig.domain}
        />
      )}

      <main className={`flex flex-col items-center justify-center flex-1 py-2 ${shouldShowSatelliteBranding?.header ? 'mt-20' : ''}`}>
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-center text-gray-900">Create Account</h1>
          {satelliteConfig ? (
            <div className="mt-4 space-y-2">
              <p className="text-center text-gray-600">Sign up to continue</p>
              <div className="flex items-center justify-center">
                <div className="inline-flex items-center px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                  <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-sm font-medium text-green-700">
                    Creating account for <span className="font-bold">{satelliteConfig.displayName}</span>
                  </span>
                </div>
              </div>
              <p className="text-xs text-center text-gray-500 mt-2">
                You'll be redirected to {satelliteConfig.hostname} after signing up
              </p>
            </div>
          ) : (
            <p className="mt-2 text-center text-gray-600">Sign up to continue</p>
          )}
        </div>
        <SignUp redirectUrl={redirectUrl} afterSignUpUrl={redirectUrl} />
      </main>

      {/* Conditionally render satellite footer */}
      {shouldShowSatelliteBranding?.footer && satelliteConfig?.branding && (
        <SatelliteFooter
          branding={satelliteConfig.branding}
          satelliteDomain={satelliteConfig.domain}
        />
      )}
    </>
  );
}