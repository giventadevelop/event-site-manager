'use server';

/**
 * Public list helpers for News / Downloads / Links pages.
 * Uses direct backend calls via fetchWithJwtRetry (ESM pattern) — not /api/proxy.
 */
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getApiBaseUrl, getTenantId } from '@/lib/env';
import type {
  PublicProfileDTO,
  ProfileWritingDTO,
  ProfileMediaAssetDTO,
  ProfileAffiliationDTO,
} from '@/types/profileSite';

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

export async function fetchPublishedPublicProfileForPagesServer(): Promise<PublicProfileDTO | null> {
  try {
    const params = new URLSearchParams({
      'tenantId.equals': getTenantId(),
      size: '1',
    });
    const res = await fetchWithJwtRetry(`${API_BASE_URL}/api/public-profiles?${params}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const list = normalizeList<PublicProfileDTO>(await res.json());
    const profile = list[0] ?? null;
    if (!profile || profile.isPublished === false) return null;
    return profile;
  } catch (error) {
    console.error('[fetchPublishedPublicProfileForPagesServer]', error);
    return null;
  }
}

export async function fetchPublishedProfileWritingsServer(): Promise<ProfileWritingDTO[]> {
  try {
    const params = new URLSearchParams({
      'tenantId.equals': getTenantId(),
      'status.equals': 'PUBLISHED',
      sort: 'displayOrder,asc',
      size: '100',
    });
    const res = await fetchWithJwtRetry(`${API_BASE_URL}/api/profile-writings?${params}`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    return normalizeList<ProfileWritingDTO>(await res.json());
  } catch (error) {
    console.error('[fetchPublishedProfileWritingsServer]', error);
    return [];
  }
}

export async function fetchDownloadableProfileMediaAssetsServer(): Promise<ProfileMediaAssetDTO[]> {
  try {
    const params = new URLSearchParams({
      'tenantId.equals': getTenantId(),
      sort: 'displayOrder,asc',
      size: '100',
    });
    const res = await fetchWithJwtRetry(`${API_BASE_URL}/api/profile-media-assets?${params}`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    return normalizeList<ProfileMediaAssetDTO>(await res.json()).filter(
      (a) => a.isDownloadable !== false
    );
  } catch (error) {
    console.error('[fetchDownloadableProfileMediaAssetsServer]', error);
    return [];
  }
}

export async function fetchProfileMediaAssetByIdServer(
  id: number
): Promise<ProfileMediaAssetDTO | null> {
  if (!id || Number.isNaN(id)) return null;
  try {
    const res = await fetchWithJwtRetry(`${API_BASE_URL}/api/profile-media-assets/${id}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return (await res.json()) as ProfileMediaAssetDTO;
  } catch (error) {
    console.error('[fetchProfileMediaAssetByIdServer]', error);
    return null;
  }
}

export async function fetchProfileWritingBySlugServer(
  slug: string
): Promise<ProfileWritingDTO | null> {
  if (!slug?.trim()) return null;
  try {
    const params = new URLSearchParams({
      'slug.equals': slug.trim(),
      'status.equals': 'PUBLISHED',
      'tenantId.equals': getTenantId(),
      size: '1',
    });
    const res = await fetchWithJwtRetry(`${API_BASE_URL}/api/profile-writings?${params}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return normalizeList<ProfileWritingDTO>(await res.json())[0] ?? null;
  } catch (error) {
    console.error('[fetchProfileWritingBySlugServer]', error);
    return null;
  }
}

export async function fetchProfileWritingByIdServer(
  id: number
): Promise<ProfileWritingDTO | null> {
  if (!id || Number.isNaN(id)) return null;
  try {
    const res = await fetchWithJwtRetry(`${API_BASE_URL}/api/profile-writings/${id}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const writing = (await res.json()) as ProfileWritingDTO;
    if (writing.status && writing.status !== 'PUBLISHED') return null;
    return writing;
  } catch (error) {
    console.error('[fetchProfileWritingByIdServer]', error);
    return null;
  }
}

export async function fetchProfileAffiliationsForLinksServer(): Promise<ProfileAffiliationDTO[]> {
  try {
    const params = new URLSearchParams({
      'tenantId.equals': getTenantId(),
      sort: 'displayOrder,asc',
      size: '100',
    });
    const res = await fetchWithJwtRetry(`${API_BASE_URL}/api/profile-affiliations?${params}`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    return normalizeList<ProfileAffiliationDTO>(await res.json());
  } catch (error) {
    console.error('[fetchProfileAffiliationsForLinksServer]', error);
    return [];
  }
}
