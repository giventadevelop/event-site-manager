import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
// NOTE: Using Clerk SDK for OAuth (works with custom Google credentials)
// Backend webhook syncs users to multi-tenant system
import TrpcProvider from "@/lib/trpc/Provider";
import Script from "next/script";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ConditionalLayout from "../components/ConditionalLayout";
import MobileDebugConsole from "../components/MobileDebugConsole";
import { TenantSettingsProvider } from "../components/TenantSettingsProvider";
import { headers } from "next/headers";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getAppUrl } from "@/lib/env";
import { fetchWithJwtRetry } from "@/lib/proxyHandler";
import { getAllowedRedirectOrigins, isKnownSatelliteHost } from "@/lib/satelliteConfig";

const inter = Inter({ subsets: ["latin"] });

// CRITICAL: Mark layout as dynamic to prevent Next.js 15+ from detecting headers() access during static analysis
// This allows headers() to be called without triggering the "headers() should be awaited" error
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Satellite domain configuration for multi-domain support
  // Primary domain: Read from NEXT_PUBLIC_PRIMARY_DOMAIN env variable
  // Satellite domains: Read from NEXT_PUBLIC_CLERK_DOMAIN and NEXT_PUBLIC_APP_URL env variables
  // IMPORTANT: Only apply satellite config in production, not in development (localhost)

  // CRITICAL: Next.js 15+ requires headers() to be fully resolved before any iteration or access
  // For public routes, we still need headers() to determine route type, but Next.js 15 will log a warning
  // This warning is expected for public routes and can be ignored in TestSprite/Playwright tests
  // The page will still render correctly despite the console warning
  const headersList = await headers();
  const hostname = headersList.get('host') || '';
  const pathname = headersList.get('x-pathname') || '';

  // Define public routes that don't require authentication checks
  // These routes can skip auth() calls to avoid Next.js 15+ headers() async errors
  const publicRoutePatterns = [
    /^\/$/,
    /^\/sign-in/,
    /^\/sign-up/,
    /^\/sso-callback/,
    /^\/auth\/signout-redirect/,
    /^\/api\/webhooks/,
    /^\/api\/public/,
    /^\/api\/proxy/,
    /^\/api\/event\/success/,
    /^\/api\/membership\/success/,
    /^\/membership\/success/,
    /^\/membership\/qr/,
    /^\/api\/diagnostic/,
    /^\/api\/logs/,
    /^\/mosc/,
    /^\/events/,
    /^\/sponsors/,
    /^\/gallery/,
    /^\/about/,
    /^\/contact/,
    /^\/polls/,
    /^\/charity-theme/,
    /^\/calendar/,
    /^\/focus-groups/,
    /^\/pricing/,
  ];

  // Check if this is a public route
  // If pathname is empty (header not set) or headers() failed, default to treating as public route to avoid auth errors
  // This ensures TestSprite/Playwright tests can run on public pages without headers() errors
  const isPublicRoute = !pathname || publicRoutePatterns.some(pattern => pattern.test(pathname));

  // Get primary domain from environment variable
  const primaryDomain = process.env.NEXT_PUBLIC_PRIMARY_DOMAIN || 'www.event-site-manager.com';

  // Get satellite domain from environment variable
  const satelliteDomain = process.env.NEXT_PUBLIC_CLERK_DOMAIN || 'www.mosc-temp.com';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';

  // Detect if this is a satellite domain — uses config/satellites.json as source of truth
  const isSatellite = isKnownSatelliteHost(hostname);

  // Clerk v7 / Core 3: proxyUrl is no longer needed on ClerkProvider.
  // The frontendApiProxy option in clerkMiddleware handles all FAPI proxying automatically
  // with proper headers (Clerk-Proxy-Url, Clerk-Secret-Key, X-Forwarded-For).

  // Satellite domains must redirect to primary domain for authentication
  const clerkProps = isSatellite
    ? {
      isSatellite: true,
      domain: satelliteDomain, // Use env var to match DNS record
      signInUrl: `https://${primaryDomain}/sign-in`,
      signUpUrl: `https://${primaryDomain}/sign-up`,
      afterSignOutUrl: '/', // Clerk v7: afterSignOutUrl moved from UserButton to provider
    }
    : {
      // Primary domain allows redirects from all satellites (loaded from config/satellites.json)
      allowedRedirectOrigins: [
        ...(appUrl ? [appUrl] : []),
        ...getAllowedRedirectOrigins(),
      ],
      afterSignOutUrl: '/', // Clerk v7: afterSignOutUrl moved from UserButton to provider
    };

  // Determine tenant-scoped admin flag on the server
  // CRITICAL: For public routes, skip auth checks entirely to avoid Next.js 15+ headers() async errors
  // This allows public pages to render without authentication, which is correct behavior
  // Also skip auth checks if pathname is empty (header not available) to prevent errors
  let isTenantAdmin = false;

  // Only perform auth checks for non-public routes
  // If pathname is empty, treat as public route to avoid headers() errors
  if (!isPublicRoute && pathname) {
    try {
      // CRITICAL: Call auth() immediately after awaiting headers() to ensure proper async context
      // Do not call any other async functions before auth() completes
      let userId: string | null = null;
      let currentUserData: any = null;
      try {
        // Call auth() first - it internally uses headers() which we've already awaited
        const authResult = await auth();
        userId = authResult?.userId || null;
        console.log('[Layout] 🔍 Auth check result:', { userId, hasUserId: !!userId });

        // CRITICAL: Only call currentUser() after auth() completes successfully
        // This ensures headers() async context is properly maintained
        if (userId) {
          try {
            currentUserData = await currentUser();
          } catch (currentUserError: any) {
            // Handle currentUser() errors gracefully - it also uses headers() internally
            if (currentUserError?.message?.includes('headers()') || currentUserError?.message?.includes('sync-dynamic-apis')) {
              console.warn('[Layout] currentUser() skipped due to Next.js 15+ headers() async requirement:', currentUserError.message);
              currentUserData = null;
            } else {
              throw currentUserError;
            }
          }
        }
      } catch (authError: any) {
        // Handle Next.js 15+ headers() await error gracefully
        if (authError?.message?.includes('headers()') || authError?.message?.includes('sync-dynamic-apis')) {
          console.warn('[Layout] Auth check skipped due to Next.js 15+ headers() async requirement:', authError.message);
          userId = null;
          currentUserData = null;
        } else {
          throw authError;
        }
      }

      if (userId) {
        const baseUrl = getAppUrl();
        // Tenant-agnostic: do not add tenantId.equals; only userId (or email) for profile lookup
        console.log('[Layout] 🔍 Fetching user profile:', { userId, baseUrl });

        // Step 1: Check if userId exists (tenant-agnostic)
        const url = `${baseUrl}/api/proxy/user-profiles?userId.equals=${encodeURIComponent(userId)}&size=1`;
        console.log('[Layout] 🔍 Profile fetch URL:', url);
        const resp = await fetch(url, { cache: 'no-store', headers: { 'Content-Type': 'application/json' } });
        console.log('[Layout] 🔍 Profile fetch response:', { status: resp.status, ok: resp.ok });

        if (resp.ok) {
        const arr = await resp.json();
        const p = Array.isArray(arr) ? arr[0] : arr;

        if (!p) {
          // Step 2: Profile not found by userId — check if email exists (different userId case)
          // CRITICAL: Use currentUserData from above instead of calling currentUser() again
          try {
            const u = currentUserData; // Use already-fetched currentUser data
            const userEmail = u?.emailAddresses?.[0]?.emailAddress || '';

            if (userEmail) {
              // Check for existing profile with same email (tenant-agnostic)
              const emailCheckUrl = `${baseUrl}/api/proxy/user-profiles?email.equals=${encodeURIComponent(userEmail)}&size=1`;
              const emailResp = await fetch(emailCheckUrl, { cache: 'no-store', headers: { 'Content-Type': 'application/json' } });

              if (emailResp.ok) {
                const emailArr = await emailResp.json();
                const existingProfile = Array.isArray(emailArr) ? emailArr[0] : emailArr;

                if (existingProfile && existingProfile.userId !== userId) {
                  // Step 3: Email + tenantId exists but with different userId
                  // UPDATE the existing record's userId to match current Clerk userId
                  // CRITICAL: Preserve all existing fields - only update userId and clerkUserId
                  // DO NOT overwrite firstName, lastName, email if they already have values
                  console.log('[Layout] Found existing profile with same email but different userId. Updating userId...');
                  console.log('[Layout] Old userId:', existingProfile.userId, '→ New userId:', userId);
                  console.log('[Layout] Preserving existing profile data:', {
                    firstName: existingProfile.firstName,
                    lastName: existingProfile.lastName,
                    email: existingProfile.email
                  });

                  // Use direct backend call with JWT (not proxy) for PATCH operations
                  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

                  // CRITICAL: Build update payload that ONLY updates userId/clerkUserId
                  // Preserve ALL existing fields - do NOT include fields that might overwrite existing data
                  const updatePayload: any = {
                    id: existingProfile.id, // MUST include id in PATCH payload per backend requirements
                    userId: userId, // Update to current Clerk userId
                    clerkUserId: userId, // Also update clerkUserId
                    tenantId: existingProfile.tenantId, // Preserve existing tenantId from the profile
                    updatedAt: new Date().toISOString(),
                  };

                  // ONLY update firstName/lastName/email if they are missing/empty in existing profile
                  // This prevents overwriting existing data with empty values from Clerk
                  if (!existingProfile.firstName || existingProfile.firstName.trim() === '') {
                    if (u?.firstName && u.firstName.trim() !== '') {
                      updatePayload.firstName = u.firstName;
                    }
                  }
                  // Preserve existing firstName - do NOT update

                  if (!existingProfile.lastName || existingProfile.lastName.trim() === '') {
                    if (u?.lastName && u.lastName.trim() !== '') {
                      updatePayload.lastName = u.lastName;
                    }
                  }
                  // Preserve existing lastName - do NOT update

                  if (!existingProfile.email || existingProfile.email.trim() === '') {
                    if (userEmail && userEmail.trim() !== '') {
                      updatePayload.email = userEmail;
                    }
                  }
                  // Preserve existing email - do NOT update

                  if (!existingProfile.profileImageUrl || existingProfile.profileImageUrl.trim() === '') {
                    if (u?.imageUrl && u.imageUrl.trim() !== '') {
                      updatePayload.profileImageUrl = u.imageUrl;
                    }
                  }
                  // Preserve existing profileImageUrl - do NOT update

                  console.log('[Layout] Sending PATCH request with payload:', JSON.stringify(updatePayload, null, 2));

                  const updateRes = await fetchWithJwtRetry(`${API_BASE_URL}/api/user-profiles/${existingProfile.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/merge-patch+json' },
                    body: JSON.stringify(updatePayload),
                  });

                  if (updateRes.ok) {
                    const updated = await updateRes.json();
                    console.log('[Layout] 🔍 Updated profile data:', {
                      id: updated?.id,
                      userId: updated?.userId,
                      email: updated?.email,
                      userRole: updated?.userRole,
                      userStatus: updated?.userStatus,
                      tenantId: updated?.tenantId,
                      rawProfile: JSON.stringify(updated, null, 2)
                    });
                    isTenantAdmin = updated?.userRole === 'ADMIN';
                    console.log('[Layout] ✅ Successfully updated userId. Admin status:', {
                      isTenantAdmin,
                      userRole: updated?.userRole,
                      roleMatch: updated?.userRole === 'ADMIN',
                      roleType: typeof updated?.userRole,
                      roleValue: JSON.stringify(updated?.userRole)
                    });
                  } else {
                    const errorText = await updateRes.text();
                    console.error('[Layout] Failed to update userId:', updateRes.status);
                    console.error('[Layout] Error response:', errorText);
                  }
                } else {
                  // Step 4: No existing profile found - Create new profile
                  console.log('[Layout] Creating new user profile for userId:', userId);
                  const now = new Date().toISOString();
                  const payload = {
                    userId,
                    clerkUserId: userId,
                    email: userEmail,
                    firstName: u?.firstName || '',
                    lastName: u?.lastName || '',
                    profileImageUrl: u?.imageUrl || '',
                    userRole: 'MEMBER',
                    userStatus: 'PENDING_APPROVAL',
                    createdAt: now,
                    updatedAt: now,
                  };

                  const createRes = await fetch(`${baseUrl}/api/proxy/user-profiles`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                  });

                  if (!createRes.ok) {
                    console.error('[Layout] Failed to create user profile:', createRes.status);
                  } else {
                    console.log('[Layout] Successfully created new user profile');
                  }
                }
              }
            } else {
              // No email available, cannot check or create profile
              console.warn('[Layout] User has no email address, skipping profile creation');
            }
          } catch (err) {
            console.error('[Layout] Error in user profile creation/update logic:', err);
          }
        } else {
          // Step 5: Profile found by userId + tenantId - check admin status
          console.log('[Layout] 🔍 Profile data:', {
            id: p?.id,
            userId: p?.userId,
            email: p?.email,
            userRole: p?.userRole,
            userStatus: p?.userStatus,
            tenantId: p?.tenantId,
            rawProfile: JSON.stringify(p, null, 2)
          });
          isTenantAdmin = p?.userRole === 'ADMIN';
          console.log('[Layout] ✅ Found existing profile. Admin status:', {
            isTenantAdmin,
            userRole: p?.userRole,
            roleMatch: p?.userRole === 'ADMIN',
            roleType: typeof p?.userRole,
            roleValue: JSON.stringify(p?.userRole)
          });
        }
      }
      }
    } catch (e) {
      // Fail closed (no admin) on error
      console.error('[Layout] ❌ Error determining admin status:', e);
      isTenantAdmin = false;
    }
  } else {
    // Public route - skip auth checks to avoid Next.js 15+ headers() async errors
    console.log('[Layout] 🔍 Public route detected, skipping auth checks:', pathname);
    isTenantAdmin = false;
  }

  console.log('[Layout] 🔍 Final admin status:', { isTenantAdmin, isPublicRoute, pathname });

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Header Design System Fonts - DM Serif Display + Plus Jakarta Sans */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Epilogue:wght@300;400;500;600;700&family=Sora:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" />
      </head>
      <body className={inter.className + " flex flex-col min-h-screen"} suppressHydrationWarning>
        {/* Clerk v7 / Core 3: ClerkProvider must be inside <body>, not wrapping <html> */}
        <ClerkProvider
          publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
          {...clerkProps}
        >
          <TrpcProvider>
            <TenantSettingsProvider>
              <ConditionalLayout
                header={<Header hideMenuItems={false} isTenantAdmin={isTenantAdmin} />}
                footer={<Footer />}
              >
                {children}
              </ConditionalLayout>
            </TenantSettingsProvider>
          </TrpcProvider>
        </ClerkProvider>
        <Script
          id="hcaptcha-config"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.hcaptchaConfig = {
                passive: true,
                usePassiveEventListeners: true
              };
            `,
          }}
        />
        {/* Givebutter Widget Script */}
        <Script
          id="givebutter-widget"
          src="https://widgets.givebutter.com/latest.umd.cjs?acct=mKoUpYQebNsn6RqA&p=other"
          strategy="afterInteractive"
          async
        />
        {/* Mobile Debug Console - Always available for log copying, even on error pages */}
        <MobileDebugConsole />
      </body>
    </html>
  );
}
