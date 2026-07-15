'use server';

import { getAdminProxyBaseUrl } from '@/lib/adminProxyBaseUrl';
import { appendTenantIfPresent, effectiveTenantId } from '@/lib/env';
import { parseTeamGroupsResponse } from '@/lib/parseTeamGroupsResponse';
import type { TeamGroupDTO } from '@/types/teamGroup';

/** Optional filters for admin list; tenant only when `?tenant=` is passed (see effectiveTenantId). */
export interface TeamGroupListFilters {
  tenantId?: string;
  name?: string;
  slug?: string;
  teamType?: string;
  /** Exact group id */
  id?: string;
  /** When set, adds isActive.equals */
  isActive?: boolean;
  /** Spring sort, e.g. displayOrder,asc */
  sort?: string;
}

function appendContainsIfTrimmed(params: URLSearchParams, field: string, value: string | undefined): void {
  const v = value?.trim();
  if (v) params.append(`${field}.contains`, v);
}

/**
 * Paginated list for admin. Omit tenantId.equals unless filters.tenantId is set (URL ?tenant=);
 * otherwise proxy uses JWT + X-Tenant-ID only.
 */
export async function fetchTeamGroupsPage(
  page: number,
  pageSize: number,
  filters?: TeamGroupListFilters
): Promise<{ groups: TeamGroupDTO[]; totalCount: number }> {
  try {
    const baseUrl = await getAdminProxyBaseUrl();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const params = new URLSearchParams({
      sort: filters?.sort?.trim() || 'displayOrder,asc',
      page: String(Math.max(0, page)),
      size: String(Math.max(1, pageSize)),
    });

    appendTenantIfPresent(params, effectiveTenantId(filters?.tenantId));

    const idTrim = filters?.id?.trim();
    if (idTrim && /^\d+$/.test(idTrim)) {
      params.append('id.equals', idTrim);
    }

    appendContainsIfTrimmed(params, 'name', filters?.name);
    appendContainsIfTrimmed(params, 'slug', filters?.slug);

    const teamType = filters?.teamType?.trim();
    if (teamType) {
      params.append('teamType.equals', teamType);
    }

    if (typeof filters?.isActive === 'boolean') {
      params.append('isActive.equals', filters.isActive ? 'true' : 'false');
    }

    const response = await fetch(
      `${baseUrl}/api/proxy/team-groups?${params.toString()}`,
      {
        signal: controller.signal,
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Failed to fetch team groups: ${response.status}`);
    }

    const data = await response.json();
    const groups = parseTeamGroupsResponse(data);
    const totalHeader = response.headers.get('x-total-count');
    const parsed = totalHeader != null ? parseInt(totalHeader, 10) : NaN;
    const totalCount = Number.isFinite(parsed) ? parsed : groups.length;
    return { groups, totalCount };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('Team groups fetch timed out after 15 seconds');
    } else {
      console.error('Error fetching team groups:', error);
    }
    return { groups: [], totalCount: 0 };
  }
}

/** Convenience for non-paginated callers (e.g. team-members group picker). */
export async function fetchTeamGroups(tenantId?: string): Promise<TeamGroupDTO[]> {
  const { groups } = await fetchTeamGroupsPage(0, 200, {
    tenantId,
    sort: 'displayOrder,asc',
  });
  return groups;
}

export async function createTeamGroup(
  payload: Omit<TeamGroupDTO, 'id'>,
  tenantId?: string
): Promise<TeamGroupDTO | null> {
  try {
    const baseUrl = await getAdminProxyBaseUrl();
    const body: Record<string, unknown> = { ...payload };
    const tid = effectiveTenantId(tenantId);
    if (tid != null) body.tenantId = tid;
    // Required timestamps for backend create validation
    const now = new Date().toISOString();
    if (!body.createdAt) body.createdAt = now;
    if (!body.updatedAt) body.updatedAt = now;

    const response = await fetch(`${baseUrl}/api/proxy/team-groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error(`Failed to create team group: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error creating team group:', error);
    return null;
  }
}

export async function updateTeamGroup(
  id: number,
  payload: Partial<TeamGroupDTO>,
  tenantId?: string
): Promise<TeamGroupDTO | null> {
  try {
    const baseUrl = await getAdminProxyBaseUrl();
    const body: Record<string, unknown> = {
      ...payload,
      id,
      updatedAt: new Date().toISOString(),
    };
    const tid = effectiveTenantId(tenantId);
    if (tid != null) body.tenantId = tid;

    const response = await fetch(`${baseUrl}/api/proxy/team-groups/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/merge-patch+json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error(`Failed to update team group: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error updating team group:', error);
    return null;
  }
}

export async function deleteTeamGroup(id: number): Promise<boolean> {
  try {
    const baseUrl = await getAdminProxyBaseUrl();
    const response = await fetch(`${baseUrl}/api/proxy/team-groups/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error(`Failed to delete team group: ${response.status}`);
    return true;
  } catch (error) {
    console.error('Error deleting team group:', error);
    return false;
  }
}
