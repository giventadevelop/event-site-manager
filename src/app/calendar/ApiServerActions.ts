'use server';

import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getTenantId } from '@/lib/env';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface CalendarEventDTO {
  id: number;
  title: string;
  caption?: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string;  // YYYY-MM-DD
  startTime: string; // HH:mm:ss
  endTime: string;   // HH:mm:ss
  location?: string;
  timezone: string;
  isActive: boolean;
  tenantId?: string;
}

export async function fetchEventsForMonthServer(year: number, month: number, focusGroupSlug?: string) {
  if (!API_BASE_URL) return [];
  const tenantId = getTenantId();
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 0));
  const startDate = start.toISOString().slice(0, 10);
  const endDate = end.toISOString().slice(0, 10);

  let url = `${API_BASE_URL}/api/event-details?`
    + `startDate.greaterThanOrEqual=${startDate}&`
    + `endDate.lessThanOrEqual=${endDate}&`
    + `isActive.equals=true&`
    + `tenantId.equals=${encodeURIComponent(tenantId)}&`
    + `sort=startDate,asc&page=0&size=200`;
  if (focusGroupSlug) {
    // backend to resolve slug→id; if not available, a proxy convenience can handle this
    url += `&focusGroupSlug.equals=${encodeURIComponent(focusGroupSlug)}`;
  }

  try {
    const res = await fetchWithJwtRetry(url, { cache: 'no-store' }, 'calendar-fetch-month');
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? (data as CalendarEventDTO[]) : [];
  } catch {
    return [];
  }
}

export async function fetchEventsForRangeServer(startDate: string, endDate: string) {
  if (!API_BASE_URL) return [];
  const tenantId = getTenantId();
  const url = `${API_BASE_URL}/api/event-details?`
    + `startDate.greaterThanOrEqual=${startDate}&`
    + `endDate.lessThanOrEqual=${endDate}&`
    + `isActive.equals=true&`
    + `tenantId.equals=${encodeURIComponent(tenantId)}&`
    + `sort=startDate,asc&page=0&size=200`;
  try {
    const res = await fetchWithJwtRetry(url, { cache: 'no-store' }, 'calendar-fetch-range');
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? (data as CalendarEventDTO[]) : [];
  } catch {
    return [];
  }
}


