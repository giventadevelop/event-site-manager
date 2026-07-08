'use server';

import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { appendTenantIfPresent, effectiveTenantId, getApiBaseUrl } from '@/lib/env';
import { fetchUsersServer } from '@/app/admin/manage-usage/ApiServerActions';
import type { UserProfileDTO } from '@/types';
import type { GasStationUserStationAssignmentDTO } from '@/lib/gasStationAccess';

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

function requireTenantId(tenantId?: string): string {
  const tid = effectiveTenantId(tenantId);
  if (!tid) {
    throw new Error('Select a tenant (?tenant=) to manage gas station location access.');
  }
  return tid;
}

export async function fetchGasStationAssignmentsForUserServer(
  userProfileId: number,
  tenantId?: string
): Promise<GasStationUserStationAssignmentDTO[]> {
  try {
    const tid = requireTenantId(tenantId);
    const params = new URLSearchParams({
      'userProfileId.equals': String(userProfileId),
      size: '500',
    });
    appendTenantIfPresent(params, tid);
    const res = await fetchWithJwtRetry(
      `${API_BASE_URL}/api/gas-station-user-station-assignments?${params}`,
      { cache: 'no-store' }
    );
    if (!res.ok) return [];
    return normalizeList<GasStationUserStationAssignmentDTO>(await res.json());
  } catch (error) {
    console.error('[fetchGasStationAssignmentsForUserServer]', error);
    return [];
  }
}

export async function fetchAllGasStationAssignmentsServer(
  tenantId?: string
): Promise<GasStationUserStationAssignmentDTO[]> {
  try {
    const tid = requireTenantId(tenantId);
    const params = new URLSearchParams({ size: '1000' });
    appendTenantIfPresent(params, tid);
    const res = await fetchWithJwtRetry(
      `${API_BASE_URL}/api/gas-station-user-station-assignments?${params}`,
      { cache: 'no-store' }
    );
    if (!res.ok) return [];
    return normalizeList<GasStationUserStationAssignmentDTO>(await res.json());
  } catch (error) {
    console.error('[fetchAllGasStationAssignmentsServer]', error);
    return [];
  }
}

export async function createGasStationAssignmentServer(
  userProfileId: number,
  stationId: number,
  tenantId?: string,
  assignedByUserProfileId?: number | null
): Promise<GasStationUserStationAssignmentDTO | null> {
  try {
    const tid = requireTenantId(tenantId);
    const body = {
      tenantId: tid,
      userProfileId,
      stationId,
      assignedByUserProfileId: assignedByUserProfileId ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const res = await fetchWithJwtRetry(`${API_BASE_URL}/api/gas-station-user-station-assignments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(await res.text());
    return await res.json();
  } catch (error) {
    console.error('[createGasStationAssignmentServer]', error);
    return null;
  }
}

export async function deleteGasStationAssignmentServer(id: number): Promise<boolean> {
  try {
    const res = await fetchWithJwtRetry(
      `${API_BASE_URL}/api/gas-station-user-station-assignments/${id}`,
      { method: 'DELETE' }
    );
    return res.ok;
  } catch (error) {
    console.error('[deleteGasStationAssignmentServer]', error);
    return false;
  }
}

export async function replaceGasStationAssignmentsForUserServer(
  userProfileId: number,
  stationIds: number[],
  tenantId?: string,
  assignedByUserProfileId?: number | null
): Promise<boolean> {
  try {
    const existing = await fetchGasStationAssignmentsForUserServer(userProfileId, tenantId);
    const desired = new Set(stationIds);
    const existingIds = new Set(existing.map((a) => a.stationId));

    const toRemove = existing.filter((a) => a.id != null && !desired.has(a.stationId));
    const toAdd = stationIds.filter((id) => !existingIds.has(id));

    for (const row of toRemove) {
      if (row.id == null) continue;
      const ok = await deleteGasStationAssignmentServer(row.id);
      if (!ok) return false;
    }

    for (const stationId of toAdd) {
      const created = await createGasStationAssignmentServer(
        userProfileId,
        stationId,
        tenantId,
        assignedByUserProfileId
      );
      if (!created) return false;
    }

    return true;
  } catch (error) {
    console.error('[replaceGasStationAssignmentsForUserServer]', error);
    return false;
  }
}

/** Platform admins: require a selected tenant; service JWT has full gas scope for that tenant. */
export async function assertGasStationTenantAdminAccess(
  tenantId?: string
): Promise<{ tenantId: string }> {
  return { tenantId: requireTenantId(tenantId) };
}

export async function fetchGasStationManagersServer(tenantId?: string): Promise<UserProfileDTO[]> {
  const tid = requireTenantId(tenantId);
  const result = await fetchUsersServer({
    search: '',
    searchField: 'email',
    status: '',
    role: 'GAS_STATION_MANAGER',
    page: 1,
    pageSize: 200,
    tenantId: tid,
  });
  const raw = result?.data;
  if (Array.isArray(raw)) return raw as UserProfileDTO[];
  if (raw && typeof raw === 'object' && Array.isArray((raw as { content?: unknown[] }).content)) {
    return (raw as { content: UserProfileDTO[] }).content;
  }
  return [];
}
