import type { TenantSettingsDTO } from '@/types';
import { getApiBaseUrl } from '@/lib/env';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { logServerFetchFailure } from '@/lib/logServerFetchFailure';

const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

interface TenantSettingsCacheEntry {
  settings: TenantSettingsDTO | null;
  fetchedAt: number;
}

const tenantSettingsCache: Record<string, TenantSettingsCacheEntry> = {};

export async function getTenantSettings(tenantId: string): Promise<TenantSettingsDTO | null> {
  const now = Date.now();
  const cacheEntry = tenantSettingsCache[tenantId];
  if (cacheEntry && now - cacheEntry.fetchedAt < CACHE_DURATION_MS) {
    return cacheEntry.settings;
  }
  try {
    const apiBase = getApiBaseUrl();
    const url = `${apiBase}/api/tenant-settings?tenantId.equals=${encodeURIComponent(tenantId)}`;
    const res = await fetchWithJwtRetry(url, { cache: 'no-store' });
    if (!res.ok) {
      console.warn(`[tenantSettingsCache] Failed to fetch tenant settings for tenantId=${tenantId}: ${res.status}`);
      return null;
    }
    const data = await res.json();
    const settings: TenantSettingsDTO | null = Array.isArray(data) ? data[0] : data;
    tenantSettingsCache[tenantId] = { settings, fetchedAt: now };
    return settings;
  } catch (error) {
    logServerFetchFailure('tenantSettingsCache', error);
    return null;
  }
}
