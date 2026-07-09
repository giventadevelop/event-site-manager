'use server';

import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getApiBaseUrl, getAppUrl } from '@/lib/env';
import type {
  PublicProfileDTO,
  ProfileWritingDTO,
  ProfileAchievementDTO,
  ProfileAffiliationDTO,
  ProfileMediaAssetDTO,
  ProfileAudienceContactDTO,
  ProfileAudienceBulkImportResultDTO,
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

export async function fetchProfileAudienceContactsServer(
  tenantId: string,
  params?: { emailContains?: string; page?: number; size?: number }
): Promise<{ contacts: ProfileAudienceContactDTO[]; totalCount: number }> {
  try {
    const qs = new URLSearchParams({
      'tenantId.equals': tenantId,
      sort: 'createdAt,desc',
      size: String(params?.size ?? 20),
      page: String(params?.page ?? 0),
    });
    if (params?.emailContains?.trim()) {
      qs.append('email.contains', params.emailContains.trim());
    }
    const res = await fetchWithJwtRetry(`${API_BASE_URL}/api/profile-audience-contacts?${qs}`, {
      cache: 'no-store',
    });
    if (!res.ok) return { contacts: [], totalCount: 0 };
    const data = await res.json();
    const contacts = normalizeList<ProfileAudienceContactDTO>(data);
    const totalCount =
      typeof data === 'object' && data !== null && 'totalElements' in data
        ? Number((data as { totalElements: number }).totalElements)
        : contacts.length;
    return { contacts, totalCount };
  } catch (error) {
    console.error('[fetchProfileAudienceContactsServer]', error);
    return { contacts: [], totalCount: 0 };
  }
}

export async function createProfileAudienceContactServer(
  tenantId: string,
  data: Omit<ProfileAudienceContactDTO, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>
): Promise<ProfileAudienceContactDTO | null> {
  try {
    const profile = await fetchPublicProfileServer(tenantId);
    if (!profile?.id) return null;
    const body = {
      ...data,
      tenantId,
      publicProfileId: profile.id,
      source: data.source ?? 'ADMIN_MANUAL',
      optInStatus: data.optInStatus ?? 'OPTED_IN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const res = await fetchWithJwtRetry(`${API_BASE_URL}/api/profile-audience-contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(await res.text());
    return await res.json();
  } catch (error) {
    console.error('[createProfileAudienceContactServer]', error);
    return null;
  }
}

export async function updateProfileAudienceContactServer(
  tenantId: string,
  id: number,
  data: Partial<ProfileAudienceContactDTO>
): Promise<ProfileAudienceContactDTO | null> {
  try {
    const payload = { ...data, id, tenantId, updatedAt: new Date().toISOString() };
    const res = await fetchWithJwtRetry(`${API_BASE_URL}/api/profile-audience-contacts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/merge-patch+json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await res.text());
    return await res.json();
  } catch (error) {
    console.error('[updateProfileAudienceContactServer]', error);
    return null;
  }
}

export async function deleteProfileAudienceContactServer(id: number): Promise<boolean> {
  try {
    const res = await fetchWithJwtRetry(`${API_BASE_URL}/api/profile-audience-contacts/${id}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (error) {
    console.error('[deleteProfileAudienceContactServer]', error);
    return false;
  }
}

export async function bulkImportProfileAudienceServer(
  tenantId: string,
  contacts: Partial<ProfileAudienceContactDTO>[]
): Promise<ProfileAudienceBulkImportResultDTO | null> {
  try {
    const profile = await fetchPublicProfileServer(tenantId);
    if (!profile?.id) return null;
    const payload = contacts
      .filter((c) => c.email?.trim())
      .map((c) => ({
        email: c.email!.trim(),
        firstName: c.firstName ?? '',
        lastName: c.lastName ?? '',
        notes: c.notes ?? '',
        tenantId,
        publicProfileId: profile.id,
        source: 'CSV_IMPORT' as const,
        optInStatus: c.optInStatus ?? 'OPTED_IN',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
    const res = await fetchWithJwtRetry(`${API_BASE_URL}/api/profile-audience-contacts/bulk-import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Tenant-ID': tenantId },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await res.text());
    return await res.json();
  } catch (error) {
    console.error('[bulkImportProfileAudienceServer]', error);
    return null;
  }
}

export async function sendToProfileAudienceServer(
  templateId: number
): Promise<{ success: boolean; message?: string }> {
  try {
    const baseUrl = getAppUrl();
    const url = `${baseUrl}/api/proxy/promotion-email-templates/${templateId}/send-to-profile-audience`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    if (!res.ok) {
      return { success: false, message: await res.text() };
    }
    return { success: true };
  } catch (error) {
    console.error('[sendToProfileAudienceServer]', error);
    return { success: false, message: String(error) };
  }
}
