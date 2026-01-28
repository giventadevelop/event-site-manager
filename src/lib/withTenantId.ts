/**
 * Returns a new DTO object. Tenant-agnostic: never injects tenantId from env.
 * Only preserves dto.tenantId if the caller already set it (e.g. from form/input).
 */
export function withTenantId<T extends object>(dto: T): T & { tenantId?: string } {
  return { ...dto } as T & { tenantId?: string };
}