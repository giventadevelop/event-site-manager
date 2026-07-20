'use server';

import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { appendTenantIfPresent, effectiveTenantId, getApiBaseUrl, getTenantId } from '@/lib/env';
import { withTenantId } from '@/lib/withTenantId';
import type { EventPollDTO, EventPollOptionDTO, EventPollResponseDTO } from '@/types';

function apiBase(): string {
  return getApiBaseUrl();
}

function parseArrayPayload(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    const o = data as Record<string, unknown>;
    if (Array.isArray(o.content)) return o.content;
    if (Array.isArray(o.data)) return o.data;
    const embedded = o._embedded as Record<string, unknown> | undefined;
    if (embedded && typeof embedded === 'object') {
      for (const v of Object.values(embedded)) {
        if (Array.isArray(v)) return v;
      }
    }
  }
  return [];
}

/** Normalize option rows so UI always has flat pollId + option fields. */
function normalizePollOption(raw: EventPollOptionDTO): EventPollOptionDTO {
  const pollRel = raw.poll;
  const pollIdFromRel =
    pollRel && typeof pollRel === 'object' && 'id' in pollRel
      ? (pollRel as { id?: number }).id
      : undefined;
  return {
    ...raw,
    pollId: raw.pollId ?? pollIdFromRel,
    displayOrder: raw.displayOrder ?? 0,
    isActive: raw.isActive ?? true,
  };
}

/**
 * Backend create/PATCH bodies expect `poll: { id }` (relationship), not a bare `pollId`.
 * Keep optionText / displayOrder / isActive as scalar fields.
 */
function buildPollOptionWritePayload(
  optionData: Partial<EventPollOptionDTO> & { pollId?: number },
  extras: { id?: number; createdAt?: string; updatedAt?: string; tenantId?: string } = {}
) {
  const { pollId, poll, ...rest } = optionData;
  const resolvedPollId =
    pollId ??
    (poll && typeof poll === 'object' && 'id' in poll ? (poll as { id?: number }).id : undefined);

  return withTenantId({
    optionText: rest.optionText,
    displayOrder: rest.displayOrder ?? 0,
    isActive: rest.isActive ?? true,
    ...(resolvedPollId != null ? { poll: { id: resolvedPollId } } : {}),
    ...(extras.id != null ? { id: extras.id } : {}),
    ...(extras.tenantId ? { tenantId: extras.tenantId } : {}),
    createdAt: extras.createdAt ?? new Date().toISOString(),
    updatedAt: extras.updatedAt ?? new Date().toISOString(),
  });
}

// Event Polls API calls
export async function fetchEventPollsServer(filters?: Record<string, any>) {
  try {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        if (key === 'tenantId') {
          appendTenantIfPresent(params, effectiveTenantId(String(value)));
          return;
        }
        params.append(key, String(value));
      });
    }

    const qs = params.toString();
    const url = `${apiBase()}/api/event-polls${qs ? `?${qs}` : ''}`;

    const res = await fetchWithJwtRetry(url, {
      method: 'GET',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch polls: ${res.status}`);
    }

    const data = await res.json();
    const list = parseArrayPayload(data) as EventPollDTO[];
    const totalHeader = res.headers.get('x-total-count') ?? res.headers.get('X-Total-Count');
    const totalCount = totalHeader
      ? parseInt(totalHeader, 10)
      : list.length;

    return { data: list, totalCount };
  } catch (error) {
    console.error('Error fetching event polls:', error);
    return { data: [], totalCount: 0 };
  }
}

export async function fetchEventPollServer(pollId: number): Promise<EventPollDTO | null> {
  try {
    const url = `${apiBase()}/api/event-polls/${pollId}`;

    const res = await fetchWithJwtRetry(url, {
      method: 'GET',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });

    if (res.status === 404) {
      console.warn(`[fetchEventPollServer] Poll ${pollId} not found (404)`);
      return null;
    }

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[fetchEventPollServer] Failed to fetch poll ${pollId}: ${res.status} - ${errorText}`);
      throw new Error(`Failed to fetch poll: ${res.status}`);
    }

    return (await res.json()) as EventPollDTO;
  } catch (error) {
    console.error('Error fetching event poll:', error);
    // Re-throw non-404 failures so update can surface real errors
    if (error instanceof Error && error.message.startsWith('Failed to fetch poll:')) {
      throw error;
    }
    return null;
  }
}

export async function createEventPollServer(
  pollData: Omit<EventPollDTO, 'id' | 'createdAt' | 'updatedAt'>
) {
  try {
    const url = `${apiBase()}/api/event-polls`;

    const payload = withTenantId({
      ...pollData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const res = await fetchWithJwtRetry(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Failed to create poll: ${res.status} - ${errorText}`);
      throw new Error(`Failed to create poll: ${res.status} - ${errorText}`);
    }

    return (await res.json()) as EventPollDTO;
  } catch (error) {
    console.error('Error creating event poll:', error);
    throw error;
  }
}

export async function updateEventPollServer(pollId: number, pollData: Partial<EventPollDTO>) {
  try {
    // Prefer fields already on the edit form; only fetch when tenantId/createdAt missing
    let tenantId = pollData.tenantId;
    let createdAt = pollData.createdAt;

    if (!tenantId || !createdAt) {
      const existingPoll = await fetchEventPollServer(pollId);
      if (!existingPoll) {
        throw new Error(`Poll with ID ${pollId} not found`);
      }
      tenantId = tenantId || existingPoll.tenantId;
      createdAt = createdAt || existingPoll.createdAt;
    }

    const url = `${apiBase()}/api/event-polls/${pollId}`;
    const finalPayload = {
      ...pollData,
      id: pollId,
      tenantId: tenantId || getTenantId(),
      createdAt,
      updatedAt: new Date().toISOString(),
    };

    const res = await fetchWithJwtRetry(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/merge-patch+json' },
      body: JSON.stringify(finalPayload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Failed to update poll: ${res.status} - ${errorText}`);
      throw new Error(`Failed to update poll: ${res.status} - ${errorText}`);
    }

    return (await res.json()) as EventPollDTO;
  } catch (error) {
    console.error('Error updating event poll:', error);
    throw error;
  }
}

export async function deleteEventPollServer(pollId: number) {
  try {
    const url = `${apiBase()}/api/event-polls/${pollId}`;

    const res = await fetchWithJwtRetry(url, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      throw new Error(`Failed to delete poll: ${res.status}`);
    }

    return true;
  } catch (error) {
    console.error('Error deleting event poll:', error);
    throw error;
  }
}

// Event Poll Options API calls
export async function fetchEventPollOptionServer(optionId: number) {
  try {
    const url = `${apiBase()}/api/event-poll-options/${optionId}`;

    const res = await fetchWithJwtRetry(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!res.ok) {
      return null;
    }

    return normalizePollOption((await res.json()) as EventPollOptionDTO);
  } catch (error) {
    console.error('Error fetching event poll option:', error);
    return null;
  }
}

export async function fetchEventPollOptionsServer(filters?: Record<string, any>) {
  try {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const qs = params.toString();
    const url = `${apiBase()}/api/event-poll-options${qs ? `?${qs}` : ''}`;

    const res = await fetchWithJwtRetry(url, {
      method: 'GET',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch poll options: ${res.status}`);
    }

    return (parseArrayPayload(await res.json()) as EventPollOptionDTO[]).map(normalizePollOption);
  } catch (error) {
    console.error('Error fetching event poll options:', error);
    return [];
  }
}

export async function createEventPollOptionServer(
  optionData: Omit<EventPollOptionDTO, 'id' | 'createdAt' | 'updatedAt'>
) {
  try {
    const url = `${apiBase()}/api/event-poll-options`;
    const payload = buildPollOptionWritePayload(optionData);

    const res = await fetchWithJwtRetry(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Failed to create poll option: ${res.status} - ${errorText}`);
      throw new Error(`Failed to create poll option: ${res.status} - ${errorText}`);
    }

    return normalizePollOption((await res.json()) as EventPollOptionDTO);
  } catch (error) {
    console.error('Error creating event poll option:', error);
    throw error;
  }
}

export async function updateEventPollOptionServer(
  optionId: number,
  optionData: Partial<EventPollOptionDTO>
) {
  try {
    let tenantId = optionData.tenantId;
    let createdAt = optionData.createdAt;
    let existingOption: EventPollOptionDTO | null = null;

    if (!tenantId || !createdAt || optionData.optionText == null) {
      existingOption = await fetchEventPollOptionServer(optionId);
      if (!existingOption) {
        throw new Error(`Poll option with ID ${optionId} not found`);
      }
      tenantId = tenantId || existingOption.tenantId;
      createdAt = createdAt || existingOption.createdAt;
    }

    const url = `${apiBase()}/api/event-poll-options/${optionId}`;
    const payload = buildPollOptionWritePayload(
      {
        optionText: optionData.optionText ?? existingOption?.optionText,
        displayOrder: optionData.displayOrder ?? existingOption?.displayOrder ?? 0,
        isActive: optionData.isActive ?? existingOption?.isActive ?? true,
        pollId:
          optionData.pollId ??
          existingOption?.pollId ??
          (existingOption?.poll && typeof existingOption.poll === 'object'
            ? (existingOption.poll as { id?: number }).id
            : undefined),
      },
      {
        id: optionId,
        tenantId: tenantId || getTenantId(),
        createdAt,
        updatedAt: new Date().toISOString(),
      }
    );

    const res = await fetchWithJwtRetry(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/merge-patch+json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Failed to update poll option: ${res.status} - ${errorText}`);
      throw new Error(`Failed to update poll option: ${res.status} - ${errorText}`);
    }

    return normalizePollOption((await res.json()) as EventPollOptionDTO);
  } catch (error) {
    console.error('Error updating event poll option:', error);
    throw error;
  }
}

export async function deleteEventPollOptionServer(optionId: number) {
  try {
    const url = `${apiBase()}/api/event-poll-options/${optionId}`;

    const res = await fetchWithJwtRetry(url, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      throw new Error(`Failed to delete poll option: ${res.status}`);
    }

    return true;
  } catch (error) {
    console.error('Error deleting event poll option:', error);
    throw error;
  }
}

// Event Poll Responses API calls
export async function fetchEventPollResponsesServer(filters?: Record<string, any>) {
  try {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const qs = params.toString();
    const url = `${apiBase()}/api/event-poll-responses${qs ? `?${qs}` : ''}`;

    const res = await fetchWithJwtRetry(url, {
      method: 'GET',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch poll responses: ${res.status}`);
    }

    return parseArrayPayload(await res.json()) as EventPollResponseDTO[];
  } catch (error) {
    console.error('Error fetching event poll responses:', error);
    return [];
  }
}

export async function createEventPollResponseServer(
  responseData: Omit<EventPollResponseDTO, 'id' | 'createdAt' | 'updatedAt'>
) {
  try {
    const url = `${apiBase()}/api/event-poll-responses`;

    const payload = withTenantId({
      comment: responseData.comment,
      responseValue: responseData.responseValue,
      isAnonymous: responseData.isAnonymous,
      poll: responseData.pollId ? { id: responseData.pollId } : undefined,
      pollOption: responseData.pollOptionId ? { id: responseData.pollOptionId } : undefined,
      user: responseData.userId ? { id: responseData.userId } : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const res = await fetchWithJwtRetry(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Failed to create poll response: ${res.status} - ${errorText}`);
      throw new Error(`Failed to create poll response: ${res.status} - ${errorText}`);
    }

    return (await res.json()) as EventPollResponseDTO;
  } catch (error) {
    console.error('Error creating event poll response:', error);
    throw error;
  }
}

export async function deleteEventPollResponseServer(responseId: number) {
  try {
    const url = `${apiBase()}/api/event-poll-responses/${responseId}`;

    const res = await fetchWithJwtRetry(url, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      throw new Error(`Failed to delete poll response: ${res.status}`);
    }

    return true;
  } catch (error) {
    console.error('Error deleting event poll response:', error);
    throw error;
  }
}
