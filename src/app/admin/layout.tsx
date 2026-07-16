import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { auth, currentUser } from '@clerk/nextjs/server';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { fetchAdminProfileServer } from './manage-usage/ApiServerActions';
import { bootstrapUserProfile } from '@/components/ProfileBootstrapperApiServerActions';
import { AdminTenantLayoutClient } from './AdminTenantContext';
import { isAdminRole } from '@/lib/utils';

/**
 * Admin Layout - Protects all /admin/* routes
 *
 * This layout ensures that only users with ADMIN or SUPER_ADMIN role can access admin pages.
 * If a user is not authenticated or doesn't have an admin role, they are redirected to the homepage.
 *
 * This prevents the "freezing" issue by redirecting immediately on the server-side
 * before any client components can render.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    // CRITICAL: Next.js 15+ requires headers() to be awaited before calling auth()
    // This ensures proper async context for dynamic APIs
    await headers();

    // Check authentication
    // When user is logged out, auth() returns { userId: null } without throwing
    let userId: string | null = null;
    try {
      // CRITICAL: Call auth() AFTER headers() is awaited to ensure proper async context
      const authResult = await auth();
      userId = authResult?.userId || null;
    } catch (authError) {
      // If auth() throws (e.g., middleware not configured), assume not authenticated
      console.warn('[AdminLayout] Auth check failed, assuming not authenticated:', authError);
      redirect('/');
    }

    // If not authenticated, redirect to homepage immediately
    if (!userId) {
      // Silent redirect for logged-out users (no console warning needed)
      redirect('/');
    }

    // Ensure tenant-scoped profile exists for the current user
    // This is non-blocking - if it fails, we'll still check the profile
    try {
      const u = await currentUser();
      if (u) {
        // Map Clerk user object to userData format expected by bootstrapUserProfile
        // CRITICAL: Only pass data that exists - don't pass empty strings
        await bootstrapUserProfile({
          userId,
          userData: {
            email: u.emailAddresses?.[0]?.emailAddress || undefined,
            firstName: u.firstName || undefined,
            lastName: u.lastName || undefined,
            imageUrl: u.imageUrl || undefined,
          }
        });
      }
    } catch (error) {
      console.error('[AdminLayout] Error bootstrapping user profile (non-fatal):', error);
      // Continue - fetchAdminProfileServer will check if profile exists
    }

    // Fetch user profile to check admin role
    let userProfile = null;
    try {
      userProfile = await fetchAdminProfileServer(userId);
    } catch (error) {
      console.error('[AdminLayout] Error fetching user profile:', error);
      // If we can't fetch the profile, assume user is not admin for security
      console.warn('[AdminLayout] Cannot verify admin status, redirecting to homepage');
      redirect('/');
    }

    // Align with Header / root layout — ADMIN and SUPER_ADMIN both grant access
    const isAdmin = isAdminRole(userProfile?.userRole);

    // If not admin or profile doesn't exist, redirect to homepage immediately
    if (!isAdmin) {
      console.warn(
        `[AdminLayout] User ${userId} attempted to access admin route but does not have ADMIN role. ` +
        `Role: ${userProfile?.userRole || 'NONE'}, Status: ${userProfile?.userStatus || 'NONE'}`
      );
      redirect('/');
    }

    // User is authenticated and has admin role - always show tenant bar for filter-by-tenant
    return (
      <AdminTenantLayoutClient showTenantSelector={true}>
        {children}
      </AdminTenantLayoutClient>
    );
  } catch (error) {
    // CRITICAL: redirect() throws NEXT_REDIRECT — must rethrow or navigation breaks
    if (isRedirectError(error)) {
      throw error;
    }
    // If any unexpected error occurs, redirect to homepage for security
    console.error('[AdminLayout] Unexpected error:', error);
    redirect('/');
  }
}
