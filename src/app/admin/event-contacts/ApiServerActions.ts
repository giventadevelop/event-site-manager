import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { appendTenantIfPresent, effectiveTenantId } from '@/lib/env';
import type { EventContactsDTO } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function fetchEventContactsServer(eventId?: number, tenantId?: string) {
  const params = new URLSearchParams();
  if (eventId) {
    params.append('eventId.equals', eventId.toString());
  }
  appendTenantIfPresent(params, effectiveTenantId(tenantId));

  const qs = params.toString();
  const response = await fetchWithJwtRetry(`${API_BASE_URL}/api/event-contacts${qs ? `?${qs}` : ''}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch event contacts: ${response.statusText}`);
  }

  return await response.json();
}

export async function fetchEventContactServer(id: number) {
  const response = await fetchWithJwtRetry(`${API_BASE_URL}/api/event-contacts/${id}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch event contact: ${response.statusText}`);
  }

  return await response.json();
}

export async function createEventContactServer(
  contact: Omit<EventContactsDTO, 'id' | 'createdAt' | 'updatedAt'>,
  tenantId?: string
) {
  const tid = effectiveTenantId(tenantId);
  const nowIso = new Date().toISOString();
  const payload = {
    ...contact,
    createdAt: nowIso,
    updatedAt: nowIso,
    ...(tid != null ? { tenantId: tid } : {}),
  };

  const response = await fetchWithJwtRetry(`${API_BASE_URL}/api/event-contacts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create event contact: ${errorText}`);
  }

  return await response.json();
}

export async function updateEventContactServer(id: number, contact: Partial<EventContactsDTO>, tenantId?: string) {
  const tid = effectiveTenantId(tenantId);
  const payload = { ...contact, id, ...(tid != null ? { tenantId: tid } : {}) };

  const response = await fetchWithJwtRetry(`${API_BASE_URL}/api/event-contacts/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/merge-patch+json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update event contact: ${errorText}`);
  }

  return await response.json();
}

export async function deleteEventContactServer(id: number) {
  const response = await fetchWithJwtRetry(`${API_BASE_URL}/api/event-contacts/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete event contact: ${errorText}`);
  }

  return true;
}
