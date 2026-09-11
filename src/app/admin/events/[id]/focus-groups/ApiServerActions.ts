"use server";

import {
  associateEventWithFocusGroup,
  unlinkEventFromFocusGroup,
} from '@/app/admin/focus-groups/[id]/edit/ApiServerActions';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getAppUrl } from '@/lib/env';
import type { EventFocusGroupDTO, FocusGroupDTO } from '@/types';

function normalizeEventFocusGroups(data: unknown): EventFocusGroupDTO[] {
  if (Array.isArray(data)) return data as EventFocusGroupDTO[];
  if (data && typeof data === 'object') {
    const o = data as { content?: unknown; _embedded?: { eventFocusGroups?: unknown } };
    if (Array.isArray(o.content)) return o.content as EventFocusGroupDTO[];
    if (Array.isArray(o._embedded?.eventFocusGroups)) {
      return o._embedded!.eventFocusGroups as EventFocusGroupDTO[];
    }
  }
  return [];
}

/**
 * Fetch event-focus-groups associations for this event (for event-centric admin page).
 * Uses proxy + fetchWithJwtRetry per event-site-manager nextjs_api_routes rules.
 */
export async function fetchLinkedEventFocusGroupsServer(
  eventId: number
): Promise<EventFocusGroupDTO[]> {
  const baseUrl = getAppUrl();
  const params = new URLSearchParams({
    'eventId.equals': String(eventId),
    size: '100',
  });
  const res = await fetchWithJwtRetry(
    `${baseUrl}/api/proxy/event-focus-groups?${params.toString()}`,
    { cache: 'no-store' }
  );
  if (!res.ok) return [];
  return normalizeEventFocusGroups(await res.json());
}

/**
 * Fetch all focus groups (for "Link focus group" dropdown).
 * Do not add tenantId.equals — proxy injects it.
 */
export async function fetchAllFocusGroupsServer(): Promise<FocusGroupDTO[]> {
  const baseUrl = getAppUrl();
  const url = `${baseUrl}/api/proxy/focus-groups?size=500&sort=name,asc`;
  const res = await fetchWithJwtRetry(url, { cache: 'no-store' });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [data];
}

/**
 * Link this event to a focus group (creates event_focus_groups row).
 */
export async function linkEventToFocusGroupServer(
  eventId: number,
  focusGroupId: number
): Promise<EventFocusGroupDTO> {
  return associateEventWithFocusGroup(eventId, focusGroupId);
}

/**
 * Unlink this event from a focus group (deletes event_focus_groups association).
 */
export async function unlinkEventFromFocusGroupServer(
  eventId: number,
  focusGroupId: number
): Promise<void> {
  return unlinkEventFromFocusGroup(eventId, focusGroupId);
}
