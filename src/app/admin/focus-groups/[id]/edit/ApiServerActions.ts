"use server";
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getAppUrl } from '@/lib/env';
import type { EventDetailsDTO, EventFocusGroupDTO } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * Associate an event with a focus group
 * Checks if relationship already exists before creating to prevent duplicate constraint violations
 */
export async function associateEventWithFocusGroup(
  eventId: number,
  focusGroupId: number
): Promise<EventFocusGroupDTO> {
  // Check if relationship already exists
  const existingId = await findAssociationId(eventId, focusGroupId);
  
  if (existingId) {
    // Relationship already exists - throw user-friendly error
    throw new Error('This event is already associated with this focus group.');
  }

  // Relationship doesn't exist - proceed with creation
  const baseUrl = getAppUrl();
  const url = `${baseUrl}/api/proxy/event-focus-groups`;
  
  const payload = {
    eventId,
    focusGroupId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const res = await fetchWithJwtRetry(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Failed to associate event with focus group:', res.status, errorText);
    
    // Check if error is due to duplicate (in case check missed it)
    if (errorText.includes('already exists') || errorText.includes('duplicate') || res.status === 409) {
      throw new Error('This event is already associated with this focus group.');
    }
    
    throw new Error(`Failed to associate event: ${res.statusText}`);
  }

  return await res.json();
}

/**
 * Find association ID for an event and focus group
 */
export async function findAssociationId(
  eventId: number,
  focusGroupId: number
): Promise<number | null> {
  const baseUrl = getAppUrl();
  const params = new URLSearchParams({
    'focusGroupId.equals': focusGroupId.toString(),
    'eventId.equals': eventId.toString(),
  });

  const url = `${baseUrl}/api/proxy/event-focus-groups?${params.toString()}`;
  const res = await fetchWithJwtRetry(url, { cache: 'no-store' });

  if (!res.ok) {
    console.error('Failed to find association:', res.status);
    return null;
  }

  const data = await res.json();
  const associations = Array.isArray(data) ? data : [data];
  const association = associations.find(
    (a: EventFocusGroupDTO) => a.eventId === eventId && a.focusGroupId === focusGroupId
  );

  return association?.id || null;
}

/**
 * Unlink an event from a focus group
 */
export async function unlinkEventFromFocusGroup(
  eventId: number,
  focusGroupId: number
): Promise<void> {
  const baseUrl = getAppUrl();
  
  // First, find the association ID
  const associationId = await findAssociationId(eventId, focusGroupId);
  
  if (!associationId) {
    throw new Error('Association not found');
  }

  const url = `${baseUrl}/api/proxy/event-focus-groups/${associationId}`;

  const res = await fetchWithJwtRetry(url, {
    method: 'DELETE',
    cache: 'no-store',
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Failed to unlink event from focus group:', res.status, errorText);
    throw new Error(`Failed to unlink event: ${res.statusText}`);
  }
}

/**
 * Fetch associated events for a focus group with pagination
 */
export async function fetchAssociatedEvents(
  focusGroupId: number,
  page: number = 0,
  pageSize: number = 10,
  sort: string = 'startDate,desc',
  showPastEvents?: boolean
): Promise<{ events: EventDetailsDTO[]; totalCount: number }> {
  const baseUrl = getAppUrl();
  const params = new URLSearchParams({
    'focusGroupId.equals': focusGroupId.toString(),
    page: page.toString(),
    size: pageSize.toString(),
    sort,
  });

  // Add date filtering if requested
  if (showPastEvents !== undefined) {
    const today = new Date().toISOString().split('T')[0];
    if (showPastEvents) {
      params.append('endDate.lessThan', today);
    } else {
      params.append('startDate.greaterThanOrEqual', today);
    }
  }

  const url = `${baseUrl}/api/proxy/event-details?${params.toString()}`;
  const res = await fetchWithJwtRetry(url, { cache: 'no-store' });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Failed to fetch associated events:', res.status, errorText);
    throw new Error(`Failed to fetch events: ${res.statusText}`);
  }

  const totalCount = Number(res.headers.get('X-Total-Count')) || 0;
  const events = await res.json();

  return { events: Array.isArray(events) ? events : [], totalCount };
}

/**
 * Search events by title or ID
 */
export async function searchEvents(
  searchTerm: string,
  searchType: 'title' | 'id',
  pageSize: number = 100
): Promise<EventDetailsDTO[]> {
  const baseUrl = getAppUrl();
  const params = new URLSearchParams({
    page: '0',
    size: pageSize.toString(),
    sort: 'startDate,desc',
  });

  if (searchType === 'id') {
    params.append('id.equals', searchTerm);
  } else {
    params.append('title.contains', searchTerm);
  }

  const url = `${baseUrl}/api/proxy/event-details?${params.toString()}`;
  const res = await fetchWithJwtRetry(url, { cache: 'no-store' });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Failed to search events:', res.status, errorText);
    return [];
  }

  const events = await res.json();
  return Array.isArray(events) ? events : [];
}

