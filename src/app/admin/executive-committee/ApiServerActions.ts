import { getAppUrl, getTenantId } from '@/lib/env';
import type { ExecutiveCommitteeTeamMemberDTO } from '@/types/executiveCommitteeTeamMember';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function fetchExecutiveCommitteeMembers(): Promise<ExecutiveCommitteeTeamMemberDTO[]> {
  try {
    const baseUrl = getAppUrl();
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    const response = await fetch(`${baseUrl}/api/proxy/executive-committee-team-members`, {
      signal: controller.signal,
      cache: 'no-store',
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Failed to fetch executive committee members: ${response.status}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('Executive committee members fetch timed out after 15 seconds');
    } else {
      console.error('Error fetching executive committee members:', error);
    }
    return [];
  }
}

export async function createExecutiveCommitteeMember(
  memberData: Omit<ExecutiveCommitteeTeamMemberDTO, 'id'>
): Promise<ExecutiveCommitteeTeamMemberDTO | null> {
  try {
    const baseUrl = getAppUrl();
    const response = await fetch(`${baseUrl}/api/proxy/executive-committee-team-members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(memberData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create executive committee member: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating executive committee member:', error);
    return null;
  }
}

export async function updateExecutiveCommitteeMember(
  id: number,
  memberData: Partial<ExecutiveCommitteeTeamMemberDTO>
): Promise<ExecutiveCommitteeTeamMemberDTO | null> {
  try {
    const baseUrl = getAppUrl();
    const response = await fetch(`${baseUrl}/api/proxy/executive-committee-team-members/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/merge-patch+json',
      },
      body: JSON.stringify({ ...memberData, id }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update executive committee member: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating executive committee member:', error);
    return null;
  }
}

export async function deleteExecutiveCommitteeMember(id: number): Promise<boolean> {
  try {
    const baseUrl = getAppUrl();
    const response = await fetch(`${baseUrl}/api/proxy/executive-committee-team-members/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete executive committee member: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Error deleting executive committee member:', error);
    return false;
  }
}

export async function updateProfileImage(
  memberId: number,
  imageUrl: string
): Promise<ExecutiveCommitteeTeamMemberDTO | null> {
  try {
    const baseUrl = getAppUrl();
    const response = await fetch(`${baseUrl}/api/proxy/executive-committee-team-members/${memberId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/merge-patch+json',
      },
      body: JSON.stringify({
        id: memberId,
        profileImageUrl: imageUrl
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update profile image: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating profile image:', error);
    return null;
  }
}

/**
 * Uploads a profile image for a team member
 *
 * 🎯 IMPORTANT: This function relies ONLY on HTTP status codes for success/failure determination.
 * - 2xx status codes (200-299) = Success
 * - Any other status code = Failure
 *
 * This approach prevents issues with null responses or malformed JSON from backend errors.
 * The backend may return a 500 error with a null EventMediaDTO result, but we avoid
 * processing it to prevent getId() calls on null objects.
 *
 * The proxy handler now returns structured error JSON for failures instead of piping
 * the raw backend error response that contains null objects.
 */
export async function uploadTeamMemberProfileImage(
  memberId: number,
  file: File,
  userProfileId?: number
): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append('file', file); // Changed from 'files' to 'file' per new API schema

    const params = new URLSearchParams();
    params.append('eventId', '0'); // Use 0 for team member profile images (not event-specific)
    params.append('executiveTeamMemberID', String(memberId)); // Add the team member ID as required by backend
    params.append('eventFlyer', 'false');
    params.append('isEventManagementOfficialDocument', 'false');
    params.append('isHeroImage', 'false');
    params.append('isActiveHeroImage', 'false');
    params.append('isFeaturedImage', 'false');
    params.append('isPublic', 'true');
    params.append('isTeamMemberProfileImage', 'true'); // Set to true for team member profile images
    params.append('title', `Team Member Profile Image - ${memberId}`); // Required parameter
    params.append('description', 'Profile image uploaded for executive committee team member');
    params.append('tenantId', getTenantId()); // Required parameter

    const baseUrl = getAppUrl();
    const url = `${baseUrl}/api/proxy/event-medias/upload?${params.toString()}`;

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    // 🎯 CRITICAL: Only rely on HTTP status codes for success/failure determination
    // This prevents issues with null responses or malformed JSON from backend errors

    // Check if the response indicates success (2xx status codes)
    if (response.status >= 200 && response.status < 300) {
      console.log('✅ Upload successful - HTTP status:', response.status);

      // Only attempt to parse response if we got a successful status code
      // CRITICAL: Handle null objects gracefully - even in success scenarios
      try {
        const result = await response.json();

        // 🎯 CRITICAL: Safely check for null/undefined objects before accessing properties
        // This prevents getId() or property access errors on null objects

        let imageUrl: string | null = null;

        // Try different possible response structures, but safely check for null first
        if (result && typeof result === 'object') {
          if (result.data && Array.isArray(result.data) && result.data.length > 0) {
            const firstItem = result.data[0];
            if (firstItem && typeof firstItem === 'object') {
              imageUrl = firstItem.fileUrl || firstItem.url || null;
            }
          } else if (result.fileUrl) {
            imageUrl = result.fileUrl;
          } else if (result.url) {
            imageUrl = result.url;
          }
        }

        if (imageUrl && typeof imageUrl === 'string') {
          console.log('✅ Successfully extracted image URL:', imageUrl);
          return imageUrl;
        } else {
          console.warn('⚠️ Upload successful but no valid image URL found in response. Response:', result);
          // For team member profile uploads, we can accept this as success
          // The backend upload succeeded even if we can't get the URL
          return 'upload-successful-no-url';
        }
      } catch (parseError) {
        console.error('❌ Failed to parse successful upload response:', parseError);
        console.log('Upload succeeded (HTTP 2xx) but response parsing failed - treating as success');
        // Since HTTP status was 2xx, the upload actually succeeded
        return 'upload-successful-parse-error';
      }
            } else {
      // 🚫 Any non-2xx status code indicates failure
      // CRITICAL: For error responses, avoid parsing the response body as it may contain null objects
      console.error('❌ Upload failed - HTTP status:', response.status);

      // Don't try to parse error response body to avoid null object issues
      // The proxy handler now returns structured error JSON, but we'll be safe and not rely on it
      throw new Error(`Upload failed with HTTP status ${response.status}. Please try again or contact support if the issue persists.`);
    }
  } catch (error) {
    console.error('Error uploading team member profile image:', error);
    // Instead of returning null, re-throw the error so the UI can show the specific error message
    throw error;
  }
}

