"use server";

import { getAppUrl } from '@/lib/env';
import type { ExecutiveCommitteeTeamMemberDTO } from '@/types';

/**
 * Fetches all active executive committee team members from the backend API
 * Sorted by priority order for proper display sequence
 */
export async function fetchExecutiveTeamMembersServer(): Promise<ExecutiveCommitteeTeamMemberDTO[]> {
  try {
    const baseUrl = getAppUrl();
    const response = await fetch(
      `${baseUrl}/api/proxy/executive-committee-team-members?isActive.equals=true&sort=priorityOrder,asc`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store', // Always fetch fresh data for team members
      }
    );

    if (!response.ok) {
      console.error('Failed to fetch executive team members:', response.statusText);
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching executive team members:', error);
    return [];
  }
}

