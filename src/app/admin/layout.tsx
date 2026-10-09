import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { auth, currentUser } from '@clerk/nextjs/server';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { bootstrapUserProfile } from '@/components/ProfileBootstrapperApiServerActions';
import { AdminTenantLayoutClient } from './AdminTenantContext';
import { fetchAdminAccessForClerkUser, resolveSessionTenantForAccess } from './adminAccessServer';
import { isPlatformOnlyAdminPath } from '@/lib/adminTenantAccess';

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
    const headersList = await headers();
    const pathname = headersList.get('x-pathname') || '';

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

    let clerkEmail: string | undefined;
    try {
      const u = await currentUser();
      clerkEmail = u?.emailAddresses?.[0]?.emailAddress;
      if (u) {
        await bootstrapUserProfile({
          userId,
          userData: {
            email: clerkEmail,
            firstName: u.firstName || undefined,
            lastName: u.lastName || undefined,
            imageUrl: u.imageUrl || undefined,
          }
        });
      }
    } catch (error) {
      console.error('[AdminLayout] Error bootstrapping user profile (non-fatal):', error);
    }

    // Admin on any tenant profile (hub looks across tenants; satellite is env-scoped)
    let access;
    try {
      access = await fetchAdminAccessForClerkUser(userId, clerkEmail);
    } catch (error) {
      console.error('[AdminLayout] Error resolving admin tenant access:', error);
      redirect('/');
    }

    if (!access.isAdmin) {
      console.warn(
        `[AdminLayout] User ${userId} attempted to access admin route but has no ADMIN/SUPER_ADMIN profile.`
      );
      redirect('/');
    }

    if (isPlatformOnlyAdminPath(pathname) && !access.isPlatformSuperAdmin) {
      redirect('/admin');
    }

    const session = await resolveSessionTenantForAccess(access);
    const pathOnly = pathname.split('?')[0] || '';
    const isAdminSubpath = pathOnly.startsWith('/admin/') && pathOnly !== '/admin/';
    const needsWorkspacePick =
      !access.canQueryAllTenants &&
      access.allowedTenantIds.length > 1 &&
      !session.tenantId;
    if (needsWorkspacePick && isAdminSubpath) {
      redirect('/admin');
    }

    return (
      <AdminTenantLayoutClient
        showTenantSelector={true}
        isPlatformSuperAdmin={access.isPlatformSuperAdmin}
        canQueryAllTenants={access.canQueryAllTenants}
        allowedTenantIds={access.allowedTenantIds}
        defaultTenantId={session.tenantId ?? access.defaultTenantId}
      >
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
