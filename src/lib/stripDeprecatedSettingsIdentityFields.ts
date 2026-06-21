/** Legacy tenant_settings identity columns — do not PATCH in v2.0 (canonical: tenant_organization). */
export const DEPRECATED_SETTINGS_IDENTITY_KEYS = [
  'description',
  'addressLine1',
  'addressLine2',
  'city',
  'stateProvince',
  'zipCode',
  'country',
] as const;

export function stripDeprecatedSettingsIdentityFields<T extends Record<string, unknown>>(
  data: T,
): T {
  const stripped = { ...data };
  for (const key of DEPRECATED_SETTINGS_IDENTITY_KEYS) {
    delete stripped[key];
  }
  return stripped;
}
