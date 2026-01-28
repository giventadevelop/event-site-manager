import { EventCalendarEntryDTO, EventTypeDetailsDTO } from '@/types';
import { getAppUrl, effectiveTenantId, appendTenantIfPresent } from '@/lib/env';

export async function fetchCalendarEventsServer(tenantId?: string): Promise<EventCalendarEntryDTO[]> {
  const baseUrl = getAppUrl();
  const params = new URLSearchParams();
  params.set('size', '1000');
  appendTenantIfPresent(params, effectiveTenantId(tenantId));

  try {
    const response = await fetch(`${baseUrl}/api/proxy/event-calendar-entries?${params.toString()}`, {
      cache: 'no-store'
    });

    if (response.ok) {
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    }
    return [];
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return [];
  }
}

export async function fetchEventTypesServer(tenantId?: string): Promise<EventTypeDetailsDTO[]> {
  const baseUrl = getAppUrl();
  const params = new URLSearchParams();
  appendTenantIfPresent(params, effectiveTenantId(tenantId));

  try {
    const response = await fetch(`${baseUrl}/api/proxy/event-type-details?${params.toString()}`, {
      cache: 'no-store'
    });

    if (response.ok) {
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    }
    return [];
  } catch (error) {
    console.error('Error fetching event types:', error);
    return [];
  }
}