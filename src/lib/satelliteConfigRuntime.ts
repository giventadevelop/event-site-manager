import { unstable_cache, revalidateTag } from 'next/cache';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getBackendApiUrl } from '@/lib/env';
import type { SatelliteDomainDTO } from '@/types';
import { satelliteDomainDtoToSatelliteConfig } from '@/lib/satelliteDomainMapper';
import type { SatelliteBranding, SatelliteConfig } from '@/lib/satelliteConfig';
import { getSatelliteConfigsSync } from '@/lib/satelliteConfig';

/** Must match revalidateTag calls after admin satellite CRUD / tenant logo updates. */
export const SATELLITE_CONFIG_CACHE_TAG = 'satellite-domains-runtime';

const CACHE_KEY = 'satellite-configs-merged-v2';

/** Server-side cache TTL (seconds). Align with public API Cache-Control s-maxage. */
export const SATELLITE_CONFIG_REVALIDATE_SECONDS = 300;

/**
 * Fetches enabled satellite rows from the backend API (service JWT).
 */
async function fetchEnabledSatelliteDomainDtos(): Promise<SatelliteDomainDTO[]> {
  const API_BASE_URL = getBackendApiUrl();
  const params = new URLSearchParams({
    page: '0',
    size: '500',
    sort: 'displayName,asc',
    'enabled.equals': 'true',
  });

  const response = await fetchWithJwtRetry(`${API_BASE_URL}/api/satellite-domains?${params.toString()}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    console.error('[satelliteConfigRuntime] API error:', response.status, response.statusText);
    return [];
  }

  const data = await response.json();

  if (data._embedded?.satelliteDomains) {
    return data._embedded.satelliteDomains as SatelliteDomainDTO[];
  }
  if (Array.isArray(data)) {
    return data as SatelliteDomainDTO[];
  }
  return [];
}

/** Prefer tenant_settings.logoImageUrl when the satellite has a tenantId. */
async function fetchTenantLogoUrl(tenantId: string): Promise<string | null> {
  try {
    const API_BASE_URL = getBackendApiUrl();
    const params = new URLSearchParams({
      'tenantId.equals': tenantId,
      size: '1',
    });
    const response = await fetchWithJwtRetry(
      `${API_BASE_URL}/api/tenant-settings?${params.toString()}`,
      { cache: 'no-store' }
    );
    if (!response.ok) return null;
    const data = await response.json();
    const row = Array.isArray(data) ? data[0] : data;
    const url = typeof row?.logoImageUrl === 'string' ? row.logoImageUrl.trim() : '';
    return url || null;
  } catch (e) {
    console.warn('[satelliteConfigRuntime] tenant logo lookup failed:', tenantId, e);
    return null;
  }
}

/**
 * Fill auth logo from tenant_settings when available.
 * Branding text (orgName / fullName / etc.) stays from satellite_domain (DB) or JSON fallback.
 */
async function enrichLogosFromTenantSettings(configs: SatelliteConfig[]): Promise<SatelliteConfig[]> {
  const tenantIds = [
    ...new Set(configs.map((c) => c.tenantId?.trim()).filter((id): id is string => Boolean(id))),
  ];

  const logoByTenant = new Map<string, string>();
  await Promise.all(
    tenantIds.map(async (tenantId) => {
      const logoUrl = await fetchTenantLogoUrl(tenantId);
      if (logoUrl) logoByTenant.set(tenantId, logoUrl);
    })
  );

  if (logoByTenant.size === 0) return configs;

  return configs.map((config) => {
    const tenantId = config.tenantId?.trim();
    const logoUrl = tenantId ? logoByTenant.get(tenantId) : undefined;
    if (!logoUrl) return config;

    const existing = config.branding;
    const branding: SatelliteBranding = {
      orgName: existing?.orgName ?? '',
      fullName: existing?.fullName ?? '',
      tagline: existing?.tagline ?? '',
      logo: {
        type: 'image',
        url: logoUrl,
        primaryColor: existing?.logo?.primaryColor || '#111827',
        secondaryColor: existing?.logo?.secondaryColor || '#6b7280',
      },
      theme: existing?.theme ?? {
        primaryColor: '#60a5fa',
        hoverColor: '#3b82f6',
        activeColor: '#2563eb',
      },
      contact: existing?.contact ?? { address: '', phone: '', email: '' },
      social: existing?.social ?? {},
      showOnAuth: existing?.showOnAuth ?? { header: true, footer: true },
    };

    return { ...config, branding };
  });
}

/**
 * Load order:
 * 1. Database via REST (`satellite_domain`) — source of truth
 * 2. Enrich logos from `tenant_settings.logoImageUrl`
 * 3. JSON/env fallback only when API returns no rows or errors
 *
 * Result is cached by `unstable_cache` (see getCachedMergedSatelliteConfigs).
 */
async function loadMergedSatelliteConfigs(): Promise<SatelliteConfig[]> {
  try {
    const dtos = await fetchEnabledSatelliteDomainDtos();
    const mapped = dtos.map(satelliteDomainDtoToSatelliteConfig);
    if (mapped.length > 0) {
      const enriched = await enrichLogosFromTenantSettings(mapped);
      if (process.env.NODE_ENV === 'development') {
        console.log(
          `[satelliteConfigRuntime] Using ${enriched.length} satellites from API (tenant logos enriched)`
        );
      }
      return enriched;
    }
  } catch (e) {
    console.error('[satelliteConfigRuntime] Fetch failed, falling back to static config:', e);
  }

  const fallback = getSatelliteConfigsSync();
  const enrichedFallback = await enrichLogosFromTenantSettings(fallback);
  if (process.env.NODE_ENV === 'development') {
    console.log(`[satelliteConfigRuntime] Fallback: ${enrichedFallback.length} satellites from JSON/env`);
  }
  return enrichedFallback;
}

const getCachedMergedSatelliteConfigs = unstable_cache(
  async () => loadMergedSatelliteConfigs(),
  [CACHE_KEY],
  { revalidate: SATELLITE_CONFIG_REVALIDATE_SECONDS, tags: [SATELLITE_CONFIG_CACHE_TAG] }
);

/**
 * Database-backed satellite list (cached 5 min).
 * JSON/env is used only when the API returns no rows or fails.
 */
export async function getMergedSatelliteConfigs(): Promise<SatelliteConfig[]> {
  return getCachedMergedSatelliteConfigs();
}

/** Call after satellite CRUD or tenant logo changes so auth branding refreshes promptly. */
export function revalidateSatelliteConfigCache(): void {
  try {
    revalidateTag(SATELLITE_CONFIG_CACHE_TAG);
  } catch (e) {
    console.warn('[satelliteConfigRuntime] revalidateTag failed:', e);
  }
}
