import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getAppUrl, appendTenantIfPresent, effectiveTenantId } from '@/lib/env';
import type { EventEmailsDTO } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const baseUrl = getAppUrl();

export async function fetchEventEmailsServer(eventId?: number, tenantId?: string) {
  const params = new URLSearchParams();
  if (eventId) {
    params.append('eventId.equals', eventId.toString());
  }
  appendTenantIfPresent(params, effectiveTenantId(tenantId));

  const response = await fetchWithJwtRetry(`${API_BASE_URL}/api/event-emails${params.toString() ? `?${params.toString()}` : ''}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch event emails: ${response.statusText}`);
  }

  return await response.json();
}

export async function fetchEventEmailServer(id: number) {
  const response = await fetchWithJwtRetry(`${API_BASE_URL}/api/event-emails/${id}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch event email: ${response.statusText}`);
  }

  return await response.json();
}

export async function createEventEmailServer(email: Omit<EventEmailsDTO, 'id' | 'createdAt' | 'updatedAt'>) {
  const payload = withTenantId(email);

  const response = await fetchWithJwtRetry(`${API_BASE_URL}/api/event-emails`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create event email: ${errorText}`);
  }

  return await response.json();
}

export async function updateEventEmailServer(id: number, email: Partial<EventEmailsDTO>, tenantId?: string) {
  const tid = effectiveTenantId(tenantId);
  const payload: Record<string, unknown> = { ...email, id };
  if (tid != null) payload.tenantId = tid;

  const response = await fetchWithJwtRetry(`${API_BASE_URL}/api/event-emails/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/merge-patch+json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update event email: ${errorText}`);
  }

  return await response.json();
}

export async function deleteEventEmailServer(id: number) {
  const response = await fetchWithJwtRetry(`${API_BASE_URL}/api/event-emails/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete event email: ${errorText}`);
  }

  return true;
}
