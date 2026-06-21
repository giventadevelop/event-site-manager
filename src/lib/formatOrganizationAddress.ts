export interface OrganizationAddressParts {
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  stateProvince?: string | null;
  zipCode?: string | null;
  country?: string | null;
}

/** Multi-line address block for display (line breaks preserved). */
export function formatOrganizationAddress(parts: OrganizationAddressParts): string | null {
  const line1 = parts.addressLine1?.trim();
  const line2 = parts.addressLine2?.trim();
  const city = parts.city?.trim();
  const state = parts.stateProvince?.trim();
  const zip = parts.zipCode?.trim();
  const country = parts.country?.trim();

  const cityStateZip = [city, state, zip].filter(Boolean).join(', ');
  const lines = [line1, line2, cityStateZip || undefined, country].filter(Boolean) as string[];
  return lines.length > 0 ? lines.join('\n') : null;
}

export function hasOrganizationAddress(parts: OrganizationAddressParts): boolean {
  return formatOrganizationAddress(parts) !== null;
}
