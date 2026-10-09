'use server';

import { cookies } from 'next/headers';
import {
  fetchAdminWorkspaceTenants,
  getCurrentAdminAccess,
} from '@/app/admin/adminAccessServer';
import { isTenantIdAllowed } from '@/lib/adminTenantAccess';
import {
  ADMIN_SESSION_ALL_TENANTS,
  ADMIN_SESSION_TENANT_COOKIE,
  isAdminSessionAllTenants,
} from '@/lib/adminSessionTenant';

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
  };
}

export async function loadAdminWorkspaceTenants() {
  return fetchAdminWorkspaceTenants();
}

/**
 * Persist the tenant this admin will work on for the rest of the browser session.
 * Pass `__all__` only as a platform SUPER_ADMIN (query every tenant).
 */
export async function selectAdminSessionTenant(
  tenantId: string,
): Promise<{ ok: true; tenantId: string | null; allTenants: boolean } | { ok: false; error: string }> {
  const access = await getCurrentAdminAccess();
  if (!access.isAdmin) {
    return { ok: false, error: 'Admin access required' };
  }

  const trimmed = tenantId.trim();
  const store = await cookies();

  if (isAdminSessionAllTenants(trimmed)) {
    if (!access.canQueryAllTenants) {
      return { ok: false, error: 'Only a platform super admin can work across all tenants.' };
    }
    store.set(ADMIN_SESSION_TENANT_COOKIE, ADMIN_SESSION_ALL_TENANTS, cookieOptions());
    return { ok: true, tenantId: null, allTenants: true };
  }

  if (!isTenantIdAllowed(access, trimmed)) {
    return { ok: false, error: 'That tenant is not mapped to your admin account.' };
  }

  store.set(ADMIN_SESSION_TENANT_COOKIE, trimmed, cookieOptions());
  return { ok: true, tenantId: trimmed, allTenants: false };
}

export async function clearAdminSessionTenant(): Promise<void> {
  const store = await cookies();
  store.delete(ADMIN_SESSION_TENANT_COOKIE);
}
