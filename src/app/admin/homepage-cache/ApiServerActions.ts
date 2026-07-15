'use server';

import { getAdminProxyBaseUrl } from '@/lib/adminProxyBaseUrl';
import { appendTenantIfPresent, effectiveTenantId } from '@/lib/env';
import type { TenantSettingsDTO } from '@/app/admin/tenant-management/types';

function parseTenantSettingsList(data: unknown): TenantSettingsDTO[] {
  if (data == null) return [];
  if (Array.isArray(data)) return data as TenantSettingsDTO[];
  if (typeof data === 'object') {
    const o = data as Record<string, unknown>;
    if (Array.isArray(o.content)) return o.content as TenantSettingsDTO[];
    const embedded = o._embedded as Record<string, unknown> | undefined;
    if (embedded && typeof embedded === 'object') {
      for (const v of Object.values(embedded)) {
        if (Array.isArray(v)) return v as TenantSettingsDTO[];
      }
    }
  }
  return [];
}

export interface HomepageCacheListFilters {
  /** When set (from ?tenant=), scopes with tenantId.equals */
  tenantId?: string;
  /** Exact settings id */
  id?: string;
  sort?: string;
}

/**
 * Paginated tenant_settings rows for cache admin.
 * Omit tenantId.equals unless filters.tenantId is set; proxy uses JWT + X-Tenant-ID otherwise.
 */
export async function fetchHomepageCacheSettingsPage(
  page: number,
  pageSize: number,
  filters?: HomepageCacheListFilters
): Promise<{ settings: TenantSettingsDTO[]; totalCount: number }> {
  try {
    const baseUrl = await getAdminProxyBaseUrl();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const params = new URLSearchParams({
      sort: filters?.sort?.trim() || 'tenantId,asc',
      page: String(Math.max(0, page)),
      size: String(Math.max(1, pageSize)),
    });

    appendTenantIfPresent(params, effectiveTenantId(filters?.tenantId));

    const idTrim = filters?.id?.trim();
    if (idTrim && /^\d+$/.test(idTrim)) {
      params.append('id.equals', idTrim);
    }

    const response = await fetch(`${baseUrl}/api/proxy/tenant-settings?${params.toString()}`, {
      signal: controller.signal,
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Failed to fetch tenant settings: ${response.status}`);
    }

    const data = await response.json();
    const settings = parseTenantSettingsList(data);
    const totalHeader = response.headers.get('x-total-count');
    const parsed = totalHeader != null ? parseInt(totalHeader, 10) : NaN;
    const totalCount = Number.isFinite(parsed) ? parsed : settings.length;
    return { settings, totalCount };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('[HomepageCache] settings fetch timed out after 15 seconds');
    } else {
      console.error('[HomepageCache] Error fetching tenant settings:', error);
    }
    return { settings: [], totalCount: 0 };
  }
}

/**
 * Bumps homepageCacheVersion on a tenant_settings row (cache-busting).
 */
export async function refreshHomepageCacheServer(settingsId: number): Promise<{ version: number }> {
  const baseUrl = await getAdminProxyBaseUrl();

  const getRes = await fetch(`${baseUrl}/api/proxy/tenant-settings/${settingsId}`, {
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!getRes.ok) {
    if (getRes.status === 404) {
      throw new Error('Tenant setting not found');
    }
    throw new Error(`Failed to load tenant setting: ${getRes.statusText}`);
  }

  const existing = (await getRes.json()) as TenantSettingsDTO;
  const currentVersion =
    typeof existing.homepageCacheVersion === 'number' ? existing.homepageCacheVersion : 0;
  const newVersion = currentVersion + 1;

  const patchRes = await fetch(`${baseUrl}/api/proxy/tenant-settings/${settingsId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/merge-patch+json' },
    body: JSON.stringify({
      id: settingsId,
      tenantId: existing.tenantId,
      homepageCacheVersion: newVersion,
      updatedAt: new Date().toISOString(),
    }),
  });

  if (!patchRes.ok) {
    const text = await patchRes.text();
    throw new Error(`Failed to refresh homepage cache: ${patchRes.statusText}. ${text}`);
  }

  return { version: newVersion };
}
