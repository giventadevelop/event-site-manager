import type { TenantOrganizationDTO, TenantSettingsDTO } from '@/types';

export type TenantOrganizationIdentity = Pick<
  TenantOrganizationDTO,
  | 'description'
  | 'addressLine1'
  | 'addressLine2'
  | 'city'
  | 'stateProvince'
  | 'zipCode'
  | 'country'
  | 'websiteUrl'
>;

const IDENTITY_KEYS: (keyof TenantOrganizationIdentity)[] = [
  'description',
  'addressLine1',
  'addressLine2',
  'city',
  'stateProvince',
  'zipCode',
  'country',
  'websiteUrl',
];

function pickIdentityValue(
  key: keyof TenantOrganizationIdentity,
  org: TenantOrganizationDTO | null | undefined,
  settings: TenantSettingsDTO | null | undefined,
): string | null {
  const orgVal = org?.[key];
  if (typeof orgVal === 'string' && orgVal.trim() !== '') {
    return orgVal.trim();
  }
  const settingsVal = settings?.[key as keyof TenantSettingsDTO];
  if (typeof settingsVal === 'string' && settingsVal.trim() !== '') {
    return settingsVal.trim();
  }
  return null;
}

/** Org-first; settings columns are legacy read fallback until v2.1 DROP. */
export function resolveTenantOrganizationIdentity(
  org: TenantOrganizationDTO | null | undefined,
  settings: TenantSettingsDTO | null | undefined,
): TenantOrganizationIdentity {
  const result = {} as TenantOrganizationIdentity;
  for (const key of IDENTITY_KEYS) {
    result[key] = pickIdentityValue(key, org, settings);
  }
  return result;
}
