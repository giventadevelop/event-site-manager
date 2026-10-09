/** Tenant card shown on the /admin workspace picker. Keep this out of `'use server'` files. */
export type AdminWorkspaceTenant = {
  tenantId: string;
  organizationName: string;
  domain?: string;
  isActive?: boolean;
  role: string;
  mappedToUser: boolean;
};

/** HttpOnly cookie: tenant this admin is working on for the current browser session. */
export const ADMIN_SESSION_TENANT_COOKIE = 'admin_session_tenant';

/** SUPER_ADMIN chose to query every tenant (empty ?tenant= / all-tenants filter). */
export const ADMIN_SESSION_ALL_TENANTS = '__all__';

export function isAdminSessionAllTenants(value: string | null | undefined): boolean {
  return (value ?? '').trim() === ADMIN_SESSION_ALL_TENANTS;
}
