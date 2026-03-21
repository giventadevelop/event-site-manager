import type { SatelliteDomainDTO } from '@/types';
import type { SatelliteBranding, SatelliteConfig } from '@/lib/satelliteConfig';

/**
 * Maps backend SatelliteDomainDTO (flat fields) to runtime SatelliteConfig (nested branding).
 */
export function satelliteDomainDtoToSatelliteConfig(dto: SatelliteDomainDTO): SatelliteConfig {
  const id = dto.satelliteKey?.trim() || String(dto.id ?? '');
  const addedDate = dto.addedDate || dto.createdAt || new Date().toISOString();

  const branding = buildBrandingFromDto(dto);

  return {
    id,
    domain: dto.domain,
    hostname: dto.hostname,
    displayName: dto.displayName,
    tenantId: dto.tenantId || undefined,
    enabled: dto.enabled !== false,
    addedDate,
    branding,
  };
}

function buildBrandingFromDto(dto: SatelliteDomainDTO): SatelliteBranding | undefined {
  const hasAny =
    (dto.orgName && dto.orgName.trim()) ||
    (dto.fullName && dto.fullName.trim()) ||
    (dto.tagline && dto.tagline.trim()) ||
    dto.logoUrl;
  if (!hasAny) return undefined;

  const logoType = dto.logoType === 'image' ? 'image' : 'text';

  return {
    orgName: dto.orgName?.trim() ?? '',
    fullName: dto.fullName?.trim() ?? '',
    tagline: dto.tagline?.trim() ?? '',
    logo: {
      type: logoType,
      url: dto.logoUrl || undefined,
      primaryColor: dto.logoPrimaryColor || '#111827',
      secondaryColor: dto.logoSecondaryColor || '#6b7280',
    },
    theme: {
      primaryColor: dto.themePrimaryColor || '#60a5fa',
      hoverColor: dto.themeHoverColor || '#3b82f6',
      activeColor: dto.themeActiveColor || '#2563eb',
    },
    contact: {
      address: dto.contactAddress ?? '',
      phone: dto.contactPhone ?? '',
      tollFree: dto.contactTollFree,
      email: dto.contactEmail ?? '',
    },
    social: {
      facebook: dto.socialFacebook,
      twitter: dto.socialTwitter,
      linkedin: dto.socialLinkedin,
      youtube: dto.socialYoutube,
    },
    showOnAuth: {
      header: dto.showOnAuthHeader !== false,
      footer: dto.showOnAuthFooter !== false,
    },
  };
}
