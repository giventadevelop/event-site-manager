'use server';
import { resolveAdminMutationTenantId } from '@/app/admin/adminAccessServer';

import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getApiBaseUrl } from '@/lib/env';
import type { HomepageYoutubeOverrideDTO } from '@/types';

export type HomepageYoutubeOverrideResult = {
  record: HomepageYoutubeOverrideDTO | null;
  error: string | null;
};

async function resolveTenant(requested?: string): Promise<string> {
  return resolveAdminMutationTenantId(requested);
}

function parseList(data: unknown): HomepageYoutubeOverrideDTO[] {
  if (Array.isArray(data)) return data as HomepageYoutubeOverrideDTO[];
  if (data && typeof data === 'object' && Array.isArray((data as { content?: unknown }).content)) {
    return (data as { content: HomepageYoutubeOverrideDTO[] }).content;
  }
  return [];
}

export async function fetchHomepageYoutubeOverride(
  tenantId?: string
): Promise<HomepageYoutubeOverrideResult> {
  try {
    const tenant = await resolveTenant(tenantId);
    const params = new URLSearchParams();
    params.set('tenantId.equals', tenant);
    params.set('size', '1');
    const res = await fetchWithJwtRetry(
      `${getApiBaseUrl()}/api/homepage-youtube-overrides?${params.toString()}`,
      {
        method: 'GET',
        cache: 'no-store',
        headers: { 'X-Tenant-ID': tenant },
      },
      'homepage-youtube-override-list'
    );
    if (!res.ok) {
      const details = await res.text().catch(() => '');
      return { record: null, error: `Could not load the YouTube override (${res.status}). ${details}`.trim() };
    }
    const rows = parseList(await res.json());
    return { record: rows[0] ?? null, error: null };
  } catch (error) {
    return { record: null, error: error instanceof Error ? error.message : 'Could not load the YouTube override.' };
  }
}

export async function saveHomepageYoutubeOverride(
  tenantId: string | undefined,
  payload: HomepageYoutubeOverrideDTO
): Promise<HomepageYoutubeOverrideResult> {
  try {
    const tenant = await resolveTenant(tenantId ?? payload.tenantId);
    const body: HomepageYoutubeOverrideDTO = {
      ...payload,
      tenantId: tenant,
      youtubeUrl: payload.youtubeUrl?.trim() || null,
      title: payload.title?.trim() || null,
      description: payload.description?.trim() || null,
      isActive: payload.isActive !== false,
      startsAt: payload.startsAt || null,
      endsAt: payload.endsAt || null,
    };

    const isUpdate = typeof body.id === 'number';
    const url = isUpdate
      ? `${getApiBaseUrl()}/api/homepage-youtube-overrides/${body.id}`
      : `${getApiBaseUrl()}/api/homepage-youtube-overrides`;
    const res = await fetchWithJwtRetry(
      url,
      {
        method: isUpdate ? 'PATCH' : 'POST',
        cache: 'no-store',
        headers: {
          'Content-Type': isUpdate ? 'application/merge-patch+json' : 'application/json',
          'X-Tenant-ID': tenant,
        },
        body: JSON.stringify(body),
      },
      isUpdate ? 'homepage-youtube-override-patch' : 'homepage-youtube-override-create'
    );
    if (!res.ok) {
      const details = await res.text().catch(() => '');
      return { record: null, error: `Could not save the YouTube override (${res.status}). ${details}`.trim() };
    }
    const saved = (await res.json()) as HomepageYoutubeOverrideDTO;
    return { record: saved, error: null };
  } catch (error) {
    return { record: null, error: error instanceof Error ? error.message : 'Could not save the YouTube override.' };
  }
}
