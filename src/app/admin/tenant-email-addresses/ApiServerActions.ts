"use server";

import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { effectiveTenantId, appendTenantIfPresent, getDefaultPageSize } from '@/lib/env';
import type { TenantEmailAddressDTO } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * Fetch tenant email addresses for the current tenant with pagination.
 * Uses criteria filter tenantId.equals as per JHipster/Spring Data REST conventions.
 * @param page Zero-based page index (default: 0)
 * @param size Number of items per page (default: from getDefaultPageSize())
 * @param tenantId Optional tenant scope; when omitted uses effective tenant (env or wildcard in all-tenants mode).
 */
export async function fetchTenantEmailAddressesServer(page: number = 0, size: number = getDefaultPageSize(), tenantId?: string): Promise<TenantEmailAddressDTO[]> {
  const params = new URLSearchParams();
  appendTenantIfPresent(params, effectiveTenantId(tenantId));
  params.append('sort', 'emailType,asc');
  params.append('page', page.toString());
  params.append('size', size.toString());

  const url = `${API_BASE_URL}/api/tenant-email-addresses?${params.toString()}`;
  const res = await fetchWithJwtRetry(url, { cache: 'no-store' });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to fetch tenant email addresses: ${res.status} ${res.statusText} - ${body}`);
  }

  const data = await res.json();
  // Handle paginated response (Spring Data REST returns { content: [...], totalElements: number })
  if (data && typeof data === 'object' && 'content' in data && Array.isArray(data.content)) {
    return data.content;
  }
  // Fallback for non-paginated response
  return Array.isArray(data) ? data : [];
}

/**
 * Fetch a single tenant email address by ID.
 */
export async function fetchTenantEmailAddressServer(id: number): Promise<TenantEmailAddressDTO | null> {
  const url = `${API_BASE_URL}/api/tenant-email-addresses/${id}`;
  const res = await fetchWithJwtRetry(url, { cache: 'no-store' });

  if (!res.ok) {
    if (res.status === 404) return null;
    const body = await res.text();
    throw new Error(`Failed to fetch tenant email address: ${res.status} ${res.statusText} - ${body}`);
  }

  return await res.json();
}

/**
 * Fetch count of tenant email addresses for the current tenant.
 * @param tenantId Optional tenant scope; when omitted uses effective tenant.
 */
export async function fetchTenantEmailAddressesCountServer(tenantId?: string): Promise<number> {
  const params = new URLSearchParams();
  appendTenantIfPresent(params, effectiveTenantId(tenantId));

  const url = `${API_BASE_URL}/api/tenant-email-addresses/count?${params.toString()}`;
  const res = await fetchWithJwtRetry(url, { cache: 'no-store' });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to fetch tenant email addresses count: ${res.status} ${res.statusText} - ${body}`);
  }

  const count = await res.json();
  return typeof count === 'number' ? count : Number(count ?? 0);
}

/**
 * Create a new tenant email address.
 * Required fields: emailAddress, emailType. isActive defaults true, isDefault defaults false.
 */
export async function createTenantEmailAddressServer(
  email: Omit<TenantEmailAddressDTO, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>
): Promise<TenantEmailAddressDTO> {
  const now = new Date().toISOString();

  const basePayload = {
    emailAddress: email.emailAddress.trim(),
    copyToEmailAddress: email.copyToEmailAddress?.trim() || email.emailAddress.trim(),
    emailType: email.emailType,
    displayName: email.displayName?.trim() || undefined,
    isActive: email.isActive ?? true,
    isDefault: email.isDefault ?? false,
    description: email.description?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
  };

  const payload = withTenantId(basePayload);

  const url = `${API_BASE_URL}/api/tenant-email-addresses`;
  const res = await fetchWithJwtRetry(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to create tenant email address: ${res.status} ${res.statusText} - ${body}`);
  }

  return await res.json();
}

/**
 * Update an existing tenant email address via PATCH.
 */
export async function updateTenantEmailAddressServer(
  id: number,
  email: Partial<TenantEmailAddressDTO>,
  tenantId?: string
): Promise<TenantEmailAddressDTO> {
  const now = new Date().toISOString();
  const tid = effectiveTenantId(tenantId);

  const basePatch: Record<string, unknown> = {
    ...email,
    id,
    updatedAt: now,
  };
  if (tid != null) basePatch.tenantId = tid;
  const payload = basePatch;

  const url = `${API_BASE_URL}/api/tenant-email-addresses/${id}`;
  const res = await fetchWithJwtRetry(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/merge-patch+json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to update tenant email address: ${res.status} ${res.statusText} - ${body}`);
  }

  return await res.json();
}

/**
 * Delete a tenant email address by ID.
 */
export async function deleteTenantEmailAddressServer(id: number): Promise<void> {
  const url = `${API_BASE_URL}/api/tenant-email-addresses/${id}`;
  const res = await fetchWithJwtRetry(url, { method: 'DELETE' });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to delete tenant email address: ${res.status} ${res.statusText} - ${body}`);
  }
}



