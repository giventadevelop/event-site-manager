// This file was renamed from actions.ts to ApiServerActions.ts as a standard for server-side API calls in this module.
"use server";
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { effectiveTenantId, appendTenantIfPresent, getDefaultPageSize, getBackendApiUrl, getTenantIdOptional } from '@/lib/env';
import { pickFirstUserProfile } from '@/lib/pickFirstUserProfile';
import { UserProfileDTO } from '@/types';

/**
 * When the admin UI selects a tenant (`?tenant=`), override X-Tenant-ID so the backend
 * TenantContextFilter scopes to that tenant. Without this, fetchWithJwtRetry keeps the
 * platform env tenant (e.g. event_site_manager_admin_1) and tenantId.equals=other returns [].
 */
function headersForTenantScope(
  tenantId: string | undefined,
  extra: Record<string, string> = {},
): Record<string, string> {
  const tid = effectiveTenantId(tenantId);
  return tid ? { ...extra, 'X-Tenant-ID': tid } : { ...extra };
}

export async function fetchAllUsersServer(tenantId?: string): Promise<UserProfileDTO[]> {
  const params = new URLSearchParams();
  params.set('page', '0');
  params.set('size', String(getDefaultPageSize()));
  appendTenantIfPresent(params, effectiveTenantId(tenantId));
  const url = `${getBackendApiUrl()}/api/user-profiles?${params.toString()}`;
  const res = await fetchWithJwtRetry(url, {
    cache: 'no-store',
    headers: headersForTenantScope(tenantId),
  });
  if (!res.ok) return [];
  return res.json();
}

export async function fetchAdminProfileServer(userId: string, tenantId?: string): Promise<UserProfileDTO | null> {
  if (!userId) return null;
  try {
    // Prefer explicit tenant override (admin UI), else active env tenant — matches Header/layout admin checks
    const scopedTenantId = effectiveTenantId(tenantId) ?? getTenantIdOptional();
    const params = new URLSearchParams();
    params.append('userId.equals', userId);
    params.append('size', '1');
    appendTenantIfPresent(params, scopedTenantId);
    const url = `${getBackendApiUrl()}/api/user-profiles?${params.toString()}`;

    const res = await fetchWithJwtRetry(url, {
      cache: 'no-store',
      headers: headersForTenantScope(scopedTenantId),
    });

    if (!res.ok) return null;
    // CRITICAL: Do not treat Spring Page / HAL wrappers as a profile — that drops userRole and
    // causes /admin layout to redirect admins to the homepage while the Header still shows Admin.
    return pickFirstUserProfile(await res.json());
  } catch (error) {
    console.error('Error fetching admin profile:', error);
    return null;
  }
}

export async function fetchUsersServer({ search, searchField, status, role, page, pageSize, tenantId }: {
  search: string;
  searchField: string;
  status: string;
  role: string;
  page: number;
  pageSize: number;
  tenantId?: string;
}) {
  const params = new URLSearchParams();
  if (search && searchField) {
    params.append(`${searchField}.contains`, search);
  }
  if (status) params.append('userStatus.equals', status);
  if (role) params.append('userRole.equals', role);
  params.append('page', String((page ?? 1) - 1));
  params.append('size', String(pageSize ?? getDefaultPageSize()));
  appendTenantIfPresent(params, effectiveTenantId(tenantId));
  const url = `${getBackendApiUrl()}/api/user-profiles?${params.toString()}`;
  const tid = effectiveTenantId(tenantId);
  const res = await fetchWithJwtRetry(url, {
    cache: 'no-store',
    headers: headersForTenantScope(tenantId),
  });
  const totalCount = res.headers.get('X-Total-Count');
  const data = await res.json();
  const parsedTotal = totalCount ? parseInt(totalCount, 10) : (Array.isArray(data) ? data.length : 0);
  console.log('[ManageUsage fetchUsersServer]', {
    url,
    scopedTenantId: tid ?? null,
    status: res.status,
    totalCount: parsedTotal,
    rowCount: Array.isArray(data) ? data.length : null,
  });
  return { data, totalCount: parsedTotal };
}

const TYPEAHEAD_FIELDS = ['firstName', 'lastName', 'email', 'userId', 'phone'] as const;
const TYPEAHEAD_LIMIT = 20;

function mergeUsersById(...lists: UserProfileDTO[][]): UserProfileDTO[] {
  const byId = new Map<string, UserProfileDTO>();
  for (const list of lists) {
    for (const user of list) {
      const key =
        user.id != null
          ? `id:${user.id}`
          : user.userId
            ? `userId:${user.userId}`
            : user.email
              ? `email:${user.email}`
              : null;
      if (!key || byId.has(key)) continue;
      byId.set(key, user);
    }
  }
  return Array.from(byId.values());
}

function normalizeUserList(data: unknown): UserProfileDTO[] {
  if (Array.isArray(data)) return data as UserProfileDTO[];
  if (
    data &&
    typeof data === 'object' &&
    'content' in data &&
    Array.isArray((data as { content: unknown }).content)
  ) {
    return (data as { content: UserProfileDTO[] }).content;
  }
  return [];
}

/**
 * Multi-field typeahead for focus-group member add / Manage Usage.
 * Uses fetchWithJwtRetry + backend base URL per nextjs_api_routes.mdc.
 */
export async function searchUsersForTypeaheadServer(
  query: string,
  options?: { status?: string; role?: string; tenantId?: string },
): Promise<UserProfileDTO[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const tid = effectiveTenantId(options?.tenantId);
  const results = await Promise.all(
    TYPEAHEAD_FIELDS.map(async (field) => {
      const params = new URLSearchParams();
      params.append(`${field}.contains`, trimmed);
      if (options?.status) params.append('userStatus.equals', options.status);
      if (options?.role) params.append('userRole.equals', options.role);
      appendTenantIfPresent(params, tid);
      params.append('page', '0');
      params.append('size', String(TYPEAHEAD_LIMIT));
      const res = await fetchWithJwtRetry(
        `${getBackendApiUrl()}/api/user-profiles?${params.toString()}`,
        {
          cache: 'no-store',
          headers: headersForTenantScope(options?.tenantId),
        },
      );
      if (!res.ok) return [] as UserProfileDTO[];
      return normalizeUserList(await res.json());
    }),
  );

  return mergeUsersById(...results).slice(0, TYPEAHEAD_LIMIT);
}

export async function patchUserProfileServer(userId: number, payload: Partial<UserProfileDTO>, tenantId?: string) {
  const url = `${getBackendApiUrl()}/api/user-profiles/${userId}`;
  const tid = effectiveTenantId(tenantId);
  const finalPayload = {
    ...payload,
    id: userId,
    ...(tid != null ? { tenantId: tid } : {}),
  };

  const res = await fetchWithJwtRetry(url, {
    method: 'PATCH',
    headers: headersForTenantScope(tenantId, {
      'Content-Type': 'application/merge-patch+json',
    }),
    body: JSON.stringify(finalPayload),
    cache: 'no-store',
  });

  if (!res.ok) {
    const errorBody = await res.text();
    console.error(`Failed to update user profile ${userId}:`, errorBody);
    throw new Error('Failed to update user profile');
  }
  return res.json();
}

export async function bulkUploadUsersServer(users: any[], tenantId?: string) {
  const tid = effectiveTenantId(tenantId);
  const res = await fetchWithJwtRetry(`${getBackendApiUrl()}/api/user-profiles/bulk`, {
    method: 'POST',
    headers: headersForTenantScope(tenantId, {
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(users.map(u => ({ ...u, ...(tid != null ? { tenantId: tid } : {}) }))),
  });
  return await res.json();
}