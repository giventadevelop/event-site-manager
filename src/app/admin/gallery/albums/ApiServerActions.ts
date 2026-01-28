'use server';

import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getTenantId, getAppUrl } from '@/lib/env';
import { withTenantId } from '@/lib/withTenantId';
import type { GalleryAlbumDTO, EventMediaDTO } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const baseUrl = getAppUrl();

/**
 * Create new album
 */
export async function createAlbumServer(
  album: Omit<GalleryAlbumDTO, 'id' | 'createdAt' | 'updatedAt'>
): Promise<GalleryAlbumDTO> {
  try {
    const payload = withTenantId({
      ...album,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const url = `${API_BASE_URL}/api/gallery-albums`;
    const res = await fetchWithJwtRetry(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Failed to create album:', res.status, errorText);
      throw new Error(`Failed to create album: ${errorText}`);
    }

    return await res.json();
  } catch (error) {
    console.error('Error creating album:', error);
    throw error;
  }
}

/**
 * Fetch albums with pagination and filtering
 */
export async function fetchAlbumsServer(
  page: number = 0,
  size: number = 12,
  searchTerm?: string,
  isPublic?: boolean
): Promise<{ albums: GalleryAlbumDTO[]; totalCount: number }> {
  try {
    const tenantId = getTenantId();
    const params = new URLSearchParams();
    params.append('tenantId.equals', tenantId);
    params.append('page', page.toString());
    params.append('size', size.toString());
    params.append('sort', 'displayOrder,asc');
    params.append('sort', 'createdAt,desc');

    if (searchTerm) {
      params.append('title.contains', searchTerm);
    }

    if (typeof isPublic === 'boolean') {
      params.append('isPublic.equals', isPublic.toString());
    }

    const url = `${API_BASE_URL}/api/gallery-albums?${params.toString()}`;
    const res = await fetchWithJwtRetry(url, { cache: 'no-store' });

    if (!res.ok) {
      console.error('Failed to fetch albums:', res.status, res.statusText);
      return { albums: [], totalCount: 0 };
    }

    const totalCount = parseInt(res.headers.get('X-Total-Count') || '0', 10);
    const albums: GalleryAlbumDTO[] = await res.json();
    const albumsArray = Array.isArray(albums) ? albums : [];

    return { albums: albumsArray, totalCount };
  } catch (error) {
    console.error('Error fetching albums:', error);
    return { albums: [], totalCount: 0 };
  }
}

/**
 * Fetch album by ID
 */
export async function fetchAlbumServer(albumId: number): Promise<GalleryAlbumDTO | null> {
  try {
    const url = `${API_BASE_URL}/api/gallery-albums/${albumId}`;
    const res = await fetchWithJwtRetry(url, { cache: 'no-store' });

    if (!res.ok) {
      if (res.status === 404) {
        return null;
      }
      console.error('Failed to fetch album:', res.status, res.statusText);
      throw new Error(`Failed to fetch album: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error('Error fetching album:', error);
    throw error;
  }
}

/**
 * Update album
 */
export async function updateAlbumServer(
  albumId: number,
  updates: Partial<GalleryAlbumDTO>
): Promise<GalleryAlbumDTO> {
  try {
    const payload = withTenantId({
      ...updates,
      id: albumId,
      updatedAt: new Date().toISOString(),
    });

    const url = `${API_BASE_URL}/api/gallery-albums/${albumId}`;
    const res = await fetchWithJwtRetry(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/merge-patch+json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Failed to update album:', res.status, errorText);
      throw new Error(`Failed to update album: ${errorText}`);
    }

    return await res.json();
  } catch (error) {
    console.error('Error updating album:', error);
    throw error;
  }
}

/**
 * Delete album
 */
export async function deleteAlbumServer(albumId: number): Promise<void> {
  try {
    const url = `${API_BASE_URL}/api/gallery-albums/${albumId}`;
    const res = await fetchWithJwtRetry(url, {
      method: 'DELETE',
      cache: 'no-store',
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Failed to delete album:', res.status, errorText);
      throw new Error(`Failed to delete album: ${errorText}`);
    }
  } catch (error) {
    console.error('Error deleting album:', error);
    throw error;
  }
}

/**
 * Add media to album
 */
export async function addMediaToAlbumServer(albumId: number, mediaIds: number[]): Promise<void> {
  try {
    // Update each media item to set album_id and clear event_id
    for (const mediaId of mediaIds) {
      const url = `${API_BASE_URL}/api/event-medias/${mediaId}`;
      const payload = {
        id: mediaId,
        albumId,
        eventId: null, // Clear event association
        updatedAt: new Date().toISOString(),
      };

      const res = await fetchWithJwtRetry(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/merge-patch+json' },
        body: JSON.stringify(payload),
        cache: 'no-store',
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`Failed to add media ${mediaId} to album:`, res.status, errorText);
        throw new Error(`Failed to add media ${mediaId} to album: ${errorText}`);
      }
    }
  } catch (error) {
    console.error('Error adding media to album:', error);
    throw error;
  }
}

/**
 * Remove media from album
 */
export async function removeMediaFromAlbumServer(mediaId: number): Promise<void> {
  try {
    const url = `${API_BASE_URL}/api/event-medias/${mediaId}`;
    const payload = {
      id: mediaId,
      albumId: null,
      updatedAt: new Date().toISOString(),
    };

    const res = await fetchWithJwtRetry(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/merge-patch+json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Failed to remove media from album:', res.status, errorText);
      throw new Error(`Failed to remove media from album: ${errorText}`);
    }
  } catch (error) {
    console.error('Error removing media from album:', error);
    throw error;
  }
}

/**
 * Fetch media for album
 */
export async function fetchAlbumMediaServer(
  albumId: number,
  page: number = 0,
  size: number = 20
): Promise<{ media: EventMediaDTO[]; totalCount: number }> {
  try {
    const tenantId = getTenantId();
    const params = new URLSearchParams();
    params.append('tenantId.equals', tenantId);
    params.append('albumId.equals', albumId.toString());
    params.append('page', page.toString());
    params.append('size', size.toString());
    params.append('sort', 'displayOrder,asc');
    params.append('sort', 'updatedAt,desc');

    const url = `${API_BASE_URL}/api/event-medias?${params.toString()}`;
    const res = await fetchWithJwtRetry(url, { cache: 'no-store' });

    if (!res.ok) {
      console.error('Failed to fetch album media:', res.status, res.statusText);
      return { media: [], totalCount: 0 };
    }

    const totalCount = parseInt(res.headers.get('X-Total-Count') || '0', 10);
    const media: EventMediaDTO[] = await res.json();
    const mediaArray = Array.isArray(media) ? media : [];

    return { media: mediaArray, totalCount };
  } catch (error) {
    console.error('Error fetching album media:', error);
    return { media: [], totalCount: 0 };
  }
}


/**
 * Set cover image for album
 */
export async function setAlbumCoverImageServer(albumId: number, coverImageUrl: string): Promise<GalleryAlbumDTO> {
  try {
    const url = `${API_BASE_URL}/api/gallery-albums/${albumId}`;
    const payload = withTenantId({
      id: albumId,
      coverImageUrl,
      updatedAt: new Date().toISOString(),
    });

    const res = await fetchWithJwtRetry(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/merge-patch+json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Failed to set cover image:', res.status, errorText);
      throw new Error(`Failed to set cover image: ${errorText}`);
    }

    return await res.json();
  } catch (error) {
    console.error('Error setting cover image:', error);
    throw error;
  }
}

/**
 * Edit media (update media properties)
 */
export async function editAlbumMediaServer(mediaId: number | string, payload: Partial<EventMediaDTO>): Promise<EventMediaDTO> {
  try {
    const url = `${API_BASE_URL}/api/event-medias/${mediaId}`;
    const cleanedPayload = withTenantId({
      ...payload,
      id: Number(mediaId),
      eventMediaType: payload.eventMediaType || 'gallery',
      storageType: payload.storageType || 's3',
      updatedAt: new Date().toISOString(),
    });

    const res = await fetchWithJwtRetry(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/merge-patch+json' },
      body: JSON.stringify(cleanedPayload),
      cache: 'no-store',
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to update media: ${errorText}`);
    }

    return await res.json();
  } catch (error) {
    console.error('Error updating media:', error);
    throw error;
  }
}

/**
 * Delete media
 */
export async function deleteAlbumMediaServer(mediaId: number | string): Promise<void> {
  try {
    const url = `${API_BASE_URL}/api/event-medias/${mediaId}?tenantId.equals=${getTenantId()}`;
    const res = await fetchWithJwtRetry(url, {
      method: 'DELETE',
      cache: 'no-store',
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to delete media: ${errorText}`);
    }
  } catch (error) {
    console.error('Error deleting media:', error);
    throw error;
  }
}

