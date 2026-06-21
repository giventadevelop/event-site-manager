/** Normalize website/domain input for storage and uniqueness checks. */
export function normalizeTenantDomain(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/\/.*$/, '')
    .trim();
}

const TENANT_DOMAIN_PATTERN =
  /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/;

export function getTenantDomainFormatError(raw: string): string | null {
  const normalized = normalizeTenantDomain(raw);
  if (!normalized) {
    return 'Website / domain is required';
  }
  if (normalized.length > 255) {
    return 'Domain must be 255 characters or fewer';
  }
  if (!TENANT_DOMAIN_PATTERN.test(normalized)) {
    return 'Enter a valid domain (e.g. malayalees-us.org)';
  }
  return null;
}

export function isValidTenantDomain(raw: string): boolean {
  return getTenantDomainFormatError(raw) === null;
}
