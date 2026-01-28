import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getAppUrl } from '@/lib/env';
import type { EventAttendeeDTO, EventAttendeeGuestDTO, EventDetailsDTO } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface RegistrationManagementData {
  attendees: EventAttendeeDTO[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  events: EventDetailsDTO[];
  selectedEvent: EventDetailsDTO | null;
  searchTerm: string;
  searchType: string;
  statusFilter: string;
}

/**
 * Fetch registration management data with filtering and pagination
 */
export async function fetchRegistrationManagementData(
  eventId: number | null,
  search: string,
  searchType: string,
  status: string,
  page: number,
  eventName?: string,
  startDate?: string,
  endDate?: string
): Promise<RegistrationManagementData | null> {
  try {
    const pageSize = 20;
    const offset = (page - 1) * pageSize;

    // Fetch events for filter dropdown (limit to 50) - Always fetch regardless of eventId
    const eventsParams = new URLSearchParams();
    eventsParams.append('sort', 'startDate,desc');
    eventsParams.append('size', '50');

    const eventsResponse = await fetchWithJwtRetry(
      `${API_BASE_URL}/api/event-details?${eventsParams.toString()}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      },
      'fetchEventsForDropdown'
    );

    let events: EventDetailsDTO[] = [];
    if (eventsResponse.ok) {
      const eventsData = await eventsResponse.json();
      events = Array.isArray(eventsData) ? eventsData : [];
    }

    // Only fetch attendees if eventId is provided
    if (!eventId) {
      // Return empty data structure when no event is selected, but include events for dropdown
      return {
        attendees: [],
        totalCount: 0,
        currentPage: 1,
        totalPages: 0,
        events: events,
        selectedEvent: null,
        searchTerm: search,
        searchType: searchType,
        statusFilter: status,
      };
    }

    // Build query parameters
    const params = new URLSearchParams();
    params.append('size', pageSize.toString());
    params.append('page', (offset / pageSize).toString());
    params.append('sort', 'registrationDate,desc');

    params.append('eventId.equals', eventId.toString());

    if (search) {
      if (searchType === 'name') {
        params.append('firstName.contains', search);
        params.append('lastName.contains', search);
      } else if (searchType === 'email') {
        params.append('email.contains', search);
      } else if (searchType === 'eventId') {
        params.append('eventId.equals', search);
      }
    }

    if (status) {
      params.append('registrationStatus.equals', status);
    }

    // Fetch attendees using fetchWithJwtRetry
    const attendeesResponse = await fetchWithJwtRetry(
      `${API_BASE_URL}/api/event-attendees?${params.toString()}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      },
      'fetchAttendees'
    );

    if (!attendeesResponse.ok) {
      throw new Error(`Failed to fetch attendees: ${attendeesResponse.status}`);
    }

    const attendees = await attendeesResponse.json();
    const attendeesArray = Array.isArray(attendees) ? attendees : [];

    // Get total count for pagination
    const countParams = new URLSearchParams(params);
    countParams.delete('size');
    countParams.delete('page');
    countParams.append('size', '1');

    const countResponse = await fetchWithJwtRetry(
      `${API_BASE_URL}/api/event-attendees?${countParams.toString()}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      },
      'fetchAttendeesCount'
    );

    let totalCount = 0;
    if (countResponse.ok) {
      const countData = await countResponse.json();
      totalCount = countData.totalElements || attendeesArray.length;
    }

    // Fetch selected event details if eventId is provided
    let selectedEvent: EventDetailsDTO | null = null;
    if (eventId) {
      const eventResponse = await fetchWithJwtRetry(
        `${API_BASE_URL}/api/event-details/${eventId}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
        },
        'fetchSelectedEvent'
      );

      if (eventResponse.ok) {
        selectedEvent = await eventResponse.json();
      }
    }

    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      attendees: attendeesArray,
      totalCount,
      currentPage: page,
      totalPages,
      events,
      selectedEvent,
      searchTerm: search,
      searchType: searchType,
      statusFilter: status,
    };
  } catch (error) {
    console.error('Error fetching registration management data:', error);
    return null;
  }
}

/**
 * Search events by name, ID, or date range
 */
export async function searchEvents(
  eventName?: string,
  eventId?: string,
  startDate?: string,
  endDate?: string
): Promise<EventDetailsDTO[]> {
  try {
    const params = new URLSearchParams();
    params.append('sort', 'startDate,desc');
    params.append('size', '50'); // Limit to 50 events

    if (eventId) {
      params.append('id.equals', eventId);
    }

    if (eventName) {
      params.append('title.contains', eventName);
    }

    if (startDate) {
      params.append('startDate.greaterThanOrEqual', startDate);
    }

    if (endDate) {
      params.append('endDate.lessThanOrEqual', endDate);
    }

    const eventsResponse = await fetchWithJwtRetry(
      `${API_BASE_URL}/api/event-details?${params.toString()}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      },
      'searchEvents'
    );

    if (!eventsResponse.ok) {
      throw new Error(`Failed to search events: ${eventsResponse.status}`);
    }

    const eventsData = await eventsResponse.json();
    return Array.isArray(eventsData) ? eventsData : [];
  } catch (error) {
    console.error('Error searching events:', error);
    return [];
  }
}

/**
 * Export registrations to CSV
 */
export async function exportRegistrationsToCSV(
  eventId: number | null,
  search: string,
  searchType: string,
  status: string
): Promise<string | null> {
  try {
    const baseUrl = getAppUrl();

    // Build query parameters for export
    const params = new URLSearchParams();
    params.append('size', '10000'); // Large number to get all records
    params.append('sort', 'registrationDate,desc');

    if (eventId) {
      params.append('eventId.equals', eventId.toString());
    }

    if (search) {
      if (searchType === 'name') {
        params.append('firstName.contains', search);
        params.append('lastName.contains', search);
      } else if (searchType === 'email') {
        params.append('email.contains', search);
      } else if (searchType === 'eventId') {
        params.append('eventId.equals', search);
      }
    }

    if (status) {
      params.append('registrationStatus.equals', status);
    }

    // Fetch all attendees for export
    const attendeesResponse = await fetch(`${baseUrl}/api/proxy/event-attendees?${params.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!attendeesResponse.ok) {
      throw new Error(`Failed to fetch attendees for export: ${attendeesResponse.status}`);
    }

    const attendees = await attendeesResponse.json();
    const attendeesArray = Array.isArray(attendees) ? attendees : [];

    // Generate CSV content
    const csvHeaders = [
      'Registration ID',
      'First Name',
      'Last Name',
      'Email',
      'Phone',
      'Event ID',
      'Event Title',
      'Registration Date',
      'Status',
      'Total Guests',
      'Special Requirements',
      'Dietary Restrictions',
      'Accessibility Needs',
      'Emergency Contact Name',
      'Emergency Contact Phone',
      'Emergency Contact Relationship'
    ];

    const csvRows = attendeesArray.map(attendee => [
      attendee.id || '',
      attendee.firstName || '',
      attendee.lastName || '',
      attendee.email || '',
      attendee.phone || '',
      attendee.eventId || '',
      '', // Event title would need to be fetched separately
      attendee.registrationDate ? new Date(attendee.registrationDate).toLocaleDateString() : '',
      attendee.registrationStatus || '',
      attendee.totalNumberOfGuests || 0,
      attendee.specialRequirements || '',
      attendee.dietaryRestrictions || '',
      attendee.accessibilityNeeds || '',
      attendee.emergencyContactName || '',
      attendee.emergencyContactPhone || '',
      attendee.emergencyContactRelationship || ''
    ]);

    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.map(field => `"${field.toString().replace(/"/g, '""')}"`).join(','))
      .join('\n');

    return csvContent;
  } catch (error) {
    console.error('Error exporting registrations to CSV:', error);
    return null;
  }
}

/**
 * Update attendee registration status
 */
export async function updateAttendeeStatus(
  attendeeId: number,
  status: string
): Promise<boolean> {
  try {
    const { fetchWithJwtRetry } = await import('@/lib/proxyHandler');
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

    if (!API_BASE_URL) {
      console.error('API_BASE_URL is not configured');
      return false;
    }

    // Include the id field in the payload as required by backend for PATCH operations
    const payload = {
      id: attendeeId,
      registrationStatus: status
    };

    const response = await fetchWithJwtRetry(
      `${API_BASE_URL}/api/event-attendees/${attendeeId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/merge-patch+json',
        },
        body: JSON.stringify(payload),
      },
      'updateAttendeeStatus'
    );

    return response.ok;
  } catch (error) {
    console.error('Error updating attendee status:', error);
    return false;
  }
}

/**
 * Update attendee registration details
 */
export async function updateAttendeeRegistration(
  attendeeId: number,
  updateData: any
): Promise<boolean> {
  try {
    const { fetchWithJwtRetry } = await import('@/lib/proxyHandler');
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

    if (!API_BASE_URL) {
      console.error('API_BASE_URL is not configured');
      return false;
    }

    // Include the id field in the payload as required by backend for PATCH operations
    const payload = {
      ...updateData,
      id: attendeeId
    };

    const response = await fetchWithJwtRetry(
      `${API_BASE_URL}/api/event-attendees/${attendeeId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/merge-patch+json',
        },
        body: JSON.stringify(payload),
      },
      'updateAttendeeRegistration'
    );

    return response.ok;
  } catch (error) {
    console.error('Error updating attendee registration:', error);
    return false;
  }
}

/**
 * Delete attendee registration
 */
export async function deleteAttendeeRegistration(attendeeId: number): Promise<boolean> {
  try {
    const { fetchWithJwtRetry } = await import('@/lib/proxyHandler');
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

    if (!API_BASE_URL) {
      console.error('API_BASE_URL is not configured');
      return false;
    }

    const response = await fetchWithJwtRetry(
      `${API_BASE_URL}/api/event-attendees/${attendeeId}`,
      {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      },
      'deleteAttendeeRegistration'
    );

    return response.ok;
  } catch (error) {
    console.error('Error deleting attendee registration:', error);
    return false;
  }
}
