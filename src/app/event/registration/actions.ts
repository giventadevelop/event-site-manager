'use server';

import { withTenantId } from '@/lib/withTenantId';
import { getTenantId, getApiBaseUrl } from '@/lib/env';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import type { EventAttendeeDTO, EventAttendeeGuestDTO, UserProfileDTO } from '@/types';

const API_BASE_URL = getApiBaseUrl();

/**
 * Create a new user profile
 */
export async function createUserProfileAction(profileData: Partial<UserProfileDTO>): Promise<UserProfileDTO> {
  try {
    const payload = withTenantId({
      ...profileData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const response = await fetchWithJwtRetry(`${API_BASE_URL}/api/user-profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }, 'createUserProfile');

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create user profile: ${response.status} ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
}

/**
 * Create a new event attendee
 */
export async function createEventAttendeeAction(attendeeData: Partial<EventAttendeeDTO>): Promise<EventAttendeeDTO> {
  try {
    const payload = withTenantId({
      ...attendeeData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const response = await fetchWithJwtRetry(`${API_BASE_URL}/api/event-attendees`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }, 'createEventAttendee');

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create event attendee: ${response.status} ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating event attendee:', error);
    throw error;
  }
}

/**
 * Create a new event attendee guest
 */
export async function createEventAttendeeGuestAction(
  primaryAttendeeId: number, 
  guestData: Partial<EventAttendeeGuestDTO>
): Promise<EventAttendeeGuestDTO> {
  try {
    const payload = withTenantId({
      ...guestData,
      primaryAttendee: { id: primaryAttendeeId },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const response = await fetchWithJwtRetry(`${API_BASE_URL}/api/event-attendee-guests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }, 'createEventAttendeeGuest');

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create event attendee guest: ${response.status} ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating event attendee guest:', error);
    throw error;
  }
}

/**
 * Lookup user profile by email
 */
export async function lookupUserProfileByEmailAction(email: string): Promise<UserProfileDTO | null> {
  try {
    const tenantId = getTenantId();
    const response = await fetchWithJwtRetry(
      `${API_BASE_URL}/api/user-profiles?email.equals=${encodeURIComponent(email)}&tenantId.equals=${tenantId}`,
      { method: 'GET' },
      'lookupUserProfileByEmail'
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to lookup user profile: ${response.status} ${errorText}`);
    }

    const profiles = await response.json();
    return profiles && profiles.length > 0 ? profiles[0] : null;
  } catch (error) {
    console.error('Error looking up user profile:', error);
    throw error;
  }
}
