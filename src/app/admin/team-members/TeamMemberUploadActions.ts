'use server';

import { getAdminProxyBaseUrl } from '@/lib/adminProxyBaseUrl';
import { getTenantId } from '@/lib/env';

/**
 * Upload portrait for squad roster member (same media proxy as executive committee).
 * Tenant for the upload pipeline uses env default (required by upload contract);
 * list/CRUD filters remain tenant-agnostic via ?tenant=.
 */
export async function uploadSquadMemberProfileImage(
  memberId: number,
  file: File
): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const params = new URLSearchParams();
    params.append('eventId', '0');
    params.append('executiveTeamMemberID', String(memberId));
    params.append('eventFlyer', 'false');
    params.append('isEventManagementOfficialDocument', 'false');
    params.append('isHeroImage', 'false');
    params.append('isActiveHeroImage', 'false');
    params.append('isFeaturedImage', 'false');
    params.append('isPublic', 'true');
    params.append('isTeamMemberProfileImage', 'true');
    params.append('title', `Squad member profile - ${memberId}`);
    params.append('description', 'Profile image for team_members roster');
    params.append('tenantId', getTenantId());

    const baseUrl = await getAdminProxyBaseUrl();
    const url = `${baseUrl}/api/proxy/event-medias/upload?${params.toString()}`;
    const response = await fetch(url, { method: 'POST', body: formData });

    if (response.status >= 200 && response.status < 300) {
      try {
        const result = await response.json();
        if (result?.data?.[0]?.fileUrl) return result.data[0].fileUrl as string;
        if (result?.fileUrl) return result.fileUrl as string;
        if (result?.url) return result.url as string;
        return 'upload-successful-no-url';
      } catch {
        return 'upload-successful-parse-error';
      }
    }
    throw new Error(`Upload failed: HTTP ${response.status}`);
  } catch (error) {
    console.error('Squad member image upload failed:', error);
    return null;
  }
}
