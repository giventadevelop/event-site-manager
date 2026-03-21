import { unstable_cache, revalidateTag } from 'next/cache';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getBackendApiUrl } from '@/lib/env';
import type { SatelliteDomainDTO } from '@/types';
import { satelliteDomainDtoToSatelliteConfig } from '@/lib/satelliteDomainMapper';
import type { SatelliteConfig } from '@/lib/satelliteConfig';
import { getSatelliteConfigsSync } from '@/lib/satelliteConfig';

/** Must match revalidateTag calls after admin satellite CRUD. */
export const SATELLITE_CONFIG_CACHE_TAG = 'satellite-domains-runtime';

const CACHE_KEY = 'satellite-configs-merged';

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

async function loadMergedSatelliteConfigs(): Promise<SatelliteConfig[]> {
  try {
    const dtos = await fetchEnabledSatelliteDomainDtos();
    const mapped = dtos.map(satelliteDomainDtoToSatelliteConfig);
    if (mapped.length > 0) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[satelliteConfigRuntime] Using ${mapped.length} satellites from API`);
      }
      return mapped;
    }
  } catch (e) {
    console.error('[satelliteConfigRuntime] Fetch failed, falling back to static config:', e);
  }

  const fallback = getSatelliteConfigsSync();
  if (process.env.NODE_ENV === 'development') {
    console.log(`[satelliteConfigRuntime] Fallback: ${fallback.length} satellites from JSON/env`);
  }
  return fallback;
}

const getCachedMergedSatelliteConfigs = unstable_cache(
  async () => loadMergedSatelliteConfigs(),
  [CACHE_KEY],
  { revalidate: 300, tags: [SATELLITE_CONFIG_CACHE_TAG] }
);

/**
 * Database-backed satellite list (cached 5 min), merged with JSON/env fallback when API returns no rows.
 */
export async function getMergedSatelliteConfigs(): Promise<SatelliteConfig[]> {
  return getCachedMergedSatelliteConfigs();
}

/** Call after create/update/delete in admin so layout and public API pick up changes immediately. */
export function revalidateSatelliteConfigCache(): void {
  try {
    revalidateTag(SATELLITE_CONFIG_CACHE_TAG);
  } catch (e) {
    console.warn('[satelliteConfigRuntime] revalidateTag failed:', e);
  }
}
