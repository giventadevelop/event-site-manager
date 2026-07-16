'use server';

import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { appendTenantIfPresent, effectiveTenantId, getApiBaseUrl } from '@/lib/env';
import type {
  GasStationLocationDTO,
  GasStationIntegrationDTO,
  GasStationDailyMetricsDTO,
  GasStationRecommendationDTO,
  GasStationRecommendationStatus,
} from '@/types/gasStation';

const API_BASE_URL = getApiBaseUrl();

function normalizeList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.content)) return obj.content as T[];
    const embedded = obj._embedded as Record<string, unknown> | undefined;
    if (embedded) {
      const firstArray = Object.values(embedded).find(Array.isArray);
      if (firstArray) return firstArray as T[];
    }
  }
  return [];
}

async function fetchGasList<T>(
  path: string,
  tenantId: string | undefined,
  extraParams?: Record<string, string>
): Promise<T[]> {
  try {
    // Bounded per-tenant reference sets (station selectors, per-date metrics/recommendations) —
    // not paginated list views. The stations admin table uses the paged fetcher below instead.
    const params = new URLSearchParams({ size: '200' });
    appendTenantIfPresent(params, effectiveTenantId(tenantId));
    for (const [key, value] of Object.entries(extraParams ?? {})) {
      params.append(key, value);
    }
    const res = await fetchWithJwtRetry(`${API_BASE_URL}${path}?${params}`, { cache: 'no-store' });
    if (!res.ok) return [];
    return normalizeList<T>(await res.json());
  } catch (error) {
    console.error(`[fetchGasList] ${path}`, error);
    return [];
  }
}

async function createGasResource<T extends { tenantId: string }>(
  path: string,
  data: T
): Promise<T | null> {
  try {
    const body = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const res = await fetchWithJwtRetry(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(await res.text());
    return await res.json();
  } catch (error) {
    console.error(`[createGasResource] ${path}`, error);
    return null;
  }
}

async function patchGasResource<T extends object>(
  path: string,
  id: number,
  data: Partial<T>
): Promise<T | null> {
  try {
    const payload = { ...data, id, updatedAt: new Date().toISOString() };
    const res = await fetchWithJwtRetry(`${API_BASE_URL}${path}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/merge-patch+json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await res.text());
    return await res.json();
  } catch (error) {
    console.error(`[patchGasResource] ${path}`, error);
    return null;
  }
}

async function deleteGasResource(path: string, id: number): Promise<boolean> {
  try {
    const res = await fetchWithJwtRetry(`${API_BASE_URL}${path}/${id}`, { method: 'DELETE' });
    return res.ok;
  } catch (error) {
    console.error(`[deleteGasResource] ${path}`, error);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Stations — tenantId optional: undefined lists ALL tenants' stations
// ---------------------------------------------------------------------------

export async function fetchGasStationLocationsServer(
  tenantId?: string
): Promise<GasStationLocationDTO[]> {
  return fetchGasList<GasStationLocationDTO>('/api/gas-station-locations', tenantId, {
    sort: 'tenantId,asc',
  });
}

export interface GasStationLocationsPage {
  content: GasStationLocationDTO[];
  totalElements: number;
  totalPages: number;
}

/** One server page for the stations admin table (totals from X-Total-Count). */
export async function fetchGasStationLocationsPageServer(
  page: number,
  size: number,
  tenantId?: string
): Promise<GasStationLocationsPage> {
  try {
    const params = new URLSearchParams({
      page: String(Math.max(0, page)),
      size: String(Math.min(Math.max(1, size), 100)),
      sort: 'tenantId,asc',
    });
    appendTenantIfPresent(params, effectiveTenantId(tenantId));
    const res = await fetchWithJwtRetry(`${API_BASE_URL}/api/gas-station-locations?${params}`, {
      cache: 'no-store',
    });
    if (!res.ok) return { content: [], totalElements: 0, totalPages: 0 };
    const content = normalizeList<GasStationLocationDTO>(await res.json());
    const rawTotal = res.headers.get('x-total-count');
    const totalElements = rawTotal != null && Number.isFinite(parseInt(rawTotal, 10))
      ? Math.max(0, parseInt(rawTotal, 10))
      : content.length;
    return {
      content,
      totalElements,
      totalPages: Math.max(1, Math.ceil(totalElements / Math.max(1, size))),
    };
  } catch (error) {
    console.error('[fetchGasStationLocationsPageServer]', error);
    return { content: [], totalElements: 0, totalPages: 0 };
  }
}

export async function createGasStationLocationServer(
  data: Omit<GasStationLocationDTO, 'id'> & { tenantId: string }
): Promise<GasStationLocationDTO | null> {
  return createGasResource('/api/gas-station-locations', data);
}

export async function updateGasStationLocationServer(
  id: number,
  data: Partial<GasStationLocationDTO>
): Promise<GasStationLocationDTO | null> {
  return patchGasResource<GasStationLocationDTO>('/api/gas-station-locations', id, data);
}

export async function deleteGasStationLocationServer(id: number): Promise<boolean> {
  return deleteGasResource('/api/gas-station-locations', id);
}

// ---------------------------------------------------------------------------
// Integrations
// ---------------------------------------------------------------------------

export async function fetchGasStationIntegrationsServer(
  tenantId?: string,
  stationId?: number
): Promise<GasStationIntegrationDTO[]> {
  const extra: Record<string, string> = { sort: 'systemType,asc' };
  if (stationId != null) extra['stationId.equals'] = String(stationId);
  return fetchGasList<GasStationIntegrationDTO>('/api/gas-station-integrations', tenantId, extra);
}

export async function createGasStationIntegrationServer(
  data: Omit<GasStationIntegrationDTO, 'id'> & { tenantId: string }
): Promise<GasStationIntegrationDTO | null> {
  return createGasResource('/api/gas-station-integrations', data);
}

export async function updateGasStationIntegrationServer(
  id: number,
  data: Partial<GasStationIntegrationDTO>
): Promise<GasStationIntegrationDTO | null> {
  return patchGasResource<GasStationIntegrationDTO>('/api/gas-station-integrations', id, data);
}

export async function deleteGasStationIntegrationServer(id: number): Promise<boolean> {
  return deleteGasResource('/api/gas-station-integrations', id);
}

// ---------------------------------------------------------------------------
// Daily metrics
// ---------------------------------------------------------------------------

export async function fetchGasStationDailyMetricsServer(
  metricDate: string,
  tenantId?: string
): Promise<GasStationDailyMetricsDTO[]> {
  return fetchGasList<GasStationDailyMetricsDTO>('/api/gas-station-daily-metrics', tenantId, {
    'metricDate.equals': metricDate,
  });
}

export async function fetchGasStationMetricsRangeServer(
  fromDate: string,
  toDate: string,
  tenantId?: string
): Promise<GasStationDailyMetricsDTO[]> {
  return fetchGasList<GasStationDailyMetricsDTO>('/api/gas-station-daily-metrics', tenantId, {
    'metricDate.greaterThanOrEqual': fromDate,
    'metricDate.lessThanOrEqual': toDate,
    // Chart aggregation over a caller-bounded date range (days x stations), not a list view.
    size: '2000',
  });
}

// ---------------------------------------------------------------------------
// Recommendations (the morning action list)
// ---------------------------------------------------------------------------

export async function fetchGasStationRecommendationsServer(
  recommendationDate: string,
  tenantId?: string
): Promise<GasStationRecommendationDTO[]> {
  return fetchGasList<GasStationRecommendationDTO>('/api/gas-station-recommendations', tenantId, {
    'recommendationDate.equals': recommendationDate,
    sort: 'priority,asc',
  });
}

export async function updateGasStationRecommendationServer(
  id: number,
  patch: { status?: GasStationRecommendationStatus; ownerFeedback?: string; tenantId?: string }
): Promise<GasStationRecommendationDTO | null> {
  return patchGasResource<GasStationRecommendationDTO>('/api/gas-station-recommendations', id, patch);
}
