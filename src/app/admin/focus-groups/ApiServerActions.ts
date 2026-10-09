'use server';
import { headersForAdminTenantScope, resolveAdminMutationTenantId } from '@/app/admin/adminAccessServer';

import { effectiveTenantId, getApiBaseUrl } from '@/lib/env';
import { withTenantId } from '@/lib/withTenantId';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import type { FocusGroupDTO } from '@/types';

export type CreateFocusGroupInput = {
  name: string;
  slug: string;
  description?: string;
  coverImageUrl?: string;
  isActive?: boolean;
  /** Optional admin tenant scope from ?tenant= */
  tenantId?: string;
};

export type CreateFocusGroupResult =
  | { ok: true; group: FocusGroupDTO }
  | { ok: false; error: string };

async function headersForTenantScope(
  tenantId: string | undefined,
  extra: Record<string, string> = {},
): Promise<Record<string, string>> {
  return headersForAdminTenantScope(tenantId, extra);
}

function isSlugUniqueViolation(bodyText: string): boolean {
  const lower = bodyText.toLowerCase();
  return (
    lower.includes('ux_focus_group__tenant_slug') ||
    lower.includes('uq_focus_group_tenant_slug') ||
    lower.includes('key (tenant_id, slug)')
  );
}

function isNameUniqueViolation(bodyText: string): boolean {
  const lower = bodyText.toLowerCase();
  return (
    lower.includes('ux_focus_group__tenant_name') ||
    lower.includes('uq_focus_group_tenant_name') ||
    lower.includes('key (tenant_id, name)')
  );
}

function isPrimaryKeyDuplicateError(bodyText: string): boolean {
  const lower = bodyText.toLowerCase();
  return (
    lower.includes('focus_group_pkey') ||
    (lower.includes('duplicate key') && lower.includes('key (id)='))
  );
}

async function syncBackendSequences(tenantId?: string): Promise<void> {
  try {
    const res = await fetchWithJwtRetry(`${getApiBaseUrl()}/api/admin/sync-sequence`, {
      method: 'POST',
      headers: await headersForTenantScope(tenantId, { 'Content-Type': 'application/json' }),
      body: JSON.stringify({}),
    });
    if (!res.ok) {
      console.warn('[createFocusGroupServer] Sequence sync returned', res.status);
    }
  } catch (err) {
    console.warn('[createFocusGroupServer] Sequence sync failed:', err);
  }
}

export async function createFocusGroupServer(
  input: CreateFocusGroupInput
): Promise<CreateFocusGroupResult> {
  const now = new Date().toISOString();
  const tid = await resolveAdminMutationTenantId(input.tenantId);
  const payload = withTenantId({
    name: input.name.trim(),
    slug: input.slug.trim(),
    description: input.description ?? '',
    coverImageUrl: input.coverImageUrl ?? '',
    isActive: input.isActive ?? true,
    createdAt: now,
    updatedAt: now,
    ...(tid ? { tenantId: tid } : {}),
  });

  const maxAttempts = 3;
  let lastError = 'Failed to create focus group';

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetchWithJwtRetry(`${getApiBaseUrl()}/api/focus-groups`, {
        method: 'POST',
        headers: await headersForTenantScope(tid, { 'Content-Type': 'application/json' }),
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const group = (await response.json()) as FocusGroupDTO;
        return { ok: true, group };
      }

      const errorText = await response.text();
      lastError = `Failed to create focus group: ${response.status} ${errorText}`;
      console.error('[createFocusGroupServer] Attempt', attempt, lastError);

      if (isSlugUniqueViolation(errorText)) {
        return {
          ok: false,
          error: 'A focus group with this slug already exists. Please choose a different slug.',
        };
      }

      if (isNameUniqueViolation(errorText)) {
        return {
          ok: false,
          error: 'A focus group with this name already exists. Please choose a different name.',
        };
      }

      if (isPrimaryKeyDuplicateError(errorText) && attempt < maxAttempts) {
        await syncBackendSequences(tid);
        continue;
      }

      return { ok: false, error: lastError };
    } catch (err) {
      lastError = err instanceof Error ? err.message : 'Unknown error creating focus group';
      console.error('[createFocusGroupServer] Exception on attempt', attempt, err);
      if (attempt < maxAttempts) {
        await syncBackendSequences(tid);
        continue;
      }
    }
  }

  return { ok: false, error: lastError };
}

export type DeleteFocusGroupResult = { ok: true } | { ok: false; error: string };

export async function deleteFocusGroupServer(
  id: number,
  tenantId?: string
): Promise<DeleteFocusGroupResult> {
  try {
    const tid = await resolveAdminMutationTenantId(tenantId);
    const response = await fetchWithJwtRetry(`${getApiBaseUrl()}/api/focus-groups/${id}`, {
      method: 'DELETE',
      headers: await headersForTenantScope(tid),
    });

    if (response.ok || response.status === 204) {
      return { ok: true };
    }

    const errorText = await response.text();
    const error = `Failed to delete focus group: ${response.status} ${errorText}`;
    console.error('[deleteFocusGroupServer]', error);
    return { ok: false, error };
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Unknown error deleting focus group';
    console.error('[deleteFocusGroupServer]', err);
    return { ok: false, error };
  }
}
