'use server';

import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getApiBaseUrl } from '@/lib/env';
import type {
  PublicProfileDTO,
  ProfileWritingDTO,
  ProfileAchievementDTO,
  ProfileAffiliationDTO,
  ProfileMediaAssetDTO,
} from '@/types/profileSite';

const API_BASE_URL = getApiBaseUrl();

export type ProfileCollectionPath =
  | '/api/profile-writings'
  | '/api/profile-achievements'
  | '/api/profile-affiliations'
  | '/api/profile-media-assets';

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

export async function fetchPublicProfileServer(tenantId: string): Promise<PublicProfileDTO | null> {
  try {
    const params = new URLSearchParams({ 'tenantId.equals': tenantId, size: '1' });
    const res = await fetchWithJwtRetry(`${API_BASE_URL}/api/public-profiles?${params}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const list = normalizeList<PublicProfileDTO>(await res.json());
    return list[0] ?? null;
  } catch (error) {
    console.error('[fetchPublicProfileServer]', error);
    return null;
  }
}

export async function upsertPublicProfileServer(
  tenantId: string,
  payload: Partial<PublicProfileDTO> & { displayName: string }
): Promise<PublicProfileDTO | null> {
  try {
    const existing = await fetchPublicProfileServer(tenantId);
    const body = {
      ...payload,
      tenantId,
      updatedAt: new Date().toISOString(),
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };

    if (existing?.id) {
      const res = await fetchWithJwtRetry(`${API_BASE_URL}/api/public-profiles/${existing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/merge-patch+json' },
        body: JSON.stringify({ ...body, id: existing.id }),
      });
      if (!res.ok) throw new Error(await res.text());
      return await res.json();
    }

    const res = await fetchWithJwtRetry(`${API_BASE_URL}/api/public-profiles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(await res.text());
    return await res.json();
  } catch (error) {
    console.error('[upsertPublicProfileServer]', error);
    return null;
  }
}

export async function fetchProfileCollectionServer<T>(
  path: ProfileCollectionPath,
  tenantId: string
): Promise<T[]> {
  try {
    const params = new URLSearchParams({
      'tenantId.equals': tenantId,
      sort: 'displayOrder,asc',
      size: '200',
    });
    const res = await fetchWithJwtRetry(`${API_BASE_URL}${path}?${params}`, { cache: 'no-store' });
    if (!res.ok) return [];
    return normalizeList<T>(await res.json());
  } catch (error) {
    console.error(`[fetchProfileCollectionServer] ${path}`, error);
    return [];
  }
}

export async function createProfileItemServer<T extends object>(
  path: ProfileCollectionPath,
  tenantId: string,
  data: T
): Promise<T | null> {
  try {
    const body = {
      ...data,
      tenantId,
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
    console.error(`[createProfileItemServer] ${path}`, error);
    return null;
  }
}

export async function updateProfileItemServer<T extends object>(
  path: ProfileCollectionPath,
  id: number,
  tenantId: string,
  data: Partial<T>
): Promise<T | null> {
  try {
    const payload = { ...data, id, tenantId, updatedAt: new Date().toISOString() };
    const res = await fetchWithJwtRetry(`${API_BASE_URL}${path}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/merge-patch+json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await res.text());
    return await res.json();
  } catch (error) {
    console.error(`[updateProfileItemServer] ${path}`, error);
    return null;
  }
}

export async function deleteProfileItemServer(
  path: ProfileCollectionPath,
  id: number
): Promise<boolean> {
  try {
    const res = await fetchWithJwtRetry(`${API_BASE_URL}${path}/${id}`, { method: 'DELETE' });
    return res.ok;
  } catch (error) {
    console.error(`[deleteProfileItemServer] ${path}`, error);
    return false;
  }
}

/** Convenience typed fetchers */
export async function fetchProfileWritingsServer(tenantId: string) {
  return fetchProfileCollectionServer<ProfileWritingDTO>('/api/profile-writings', tenantId);
}
export async function fetchProfileAchievementsServer(tenantId: string) {
  return fetchProfileCollectionServer<ProfileAchievementDTO>('/api/profile-achievements', tenantId);
}
export async function fetchProfileAffiliationsServer(tenantId: string) {
  return fetchProfileCollectionServer<ProfileAffiliationDTO>('/api/profile-affiliations', tenantId);
}
export async function fetchProfileMediaAssetsServer(tenantId: string) {
  return fetchProfileCollectionServer<ProfileMediaAssetDTO>('/api/profile-media-assets', tenantId);
}
