'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { GalleryAlbumDTO, GalleryCategoryDTO } from '@/types';
import {
  updateAlbumServer,
  deleteAlbumServer,
  fetchGalleryCategoriesServer,
} from '../../ApiServerActions';
import { Modal } from '@/components/Modal';
import GalleryAlbumCoverImageUpload from '@/components/admin/gallery/GalleryAlbumCoverImageUpload';

interface AdminAlbumEditClientProps {
  initialAlbum: GalleryAlbumDTO;
}

export default function AdminAlbumEditClient({ initialAlbum }: AdminAlbumEditClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [showAdvancedCoverUrl, setShowAdvancedCoverUrl] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categories, setCategories] = useState<GalleryCategoryDTO[]>([]);
  const [formData, setFormData] = useState({
    title: initialAlbum.title || '',
    description: initialAlbum.description || '',
    coverImageUrl: initialAlbum.coverImageUrl || '',
    isPublic: initialAlbum.isPublic ?? true,
    displayOrder: initialAlbum.displayOrder || 0,
    galleryCategoryId: initialAlbum.galleryCategoryId
      ? String(initialAlbum.galleryCategoryId)
      : initialAlbum.galleryCategory?.id
        ? String(initialAlbum.galleryCategory.id)
        : '',
  });

  const albumTenantId = initialAlbum.tenantId?.trim() || '';

  useEffect(() => {
    let cancelled = false;
    async function loadCategories() {
      try {
        const list = await fetchGalleryCategoriesServer(initialAlbum.tenantId);
        if (!cancelled) setCategories(list);
      } catch {
        if (!cancelled) setCategories([]);
      }
    }
    void loadCategories();
    return () => {
      cancelled = true;
    };
  }, [initialAlbum.tenantId]);

  const albumsListHref = initialAlbum.tenantId
    ? `/admin/gallery/albums?tenant=${encodeURIComponent(initialAlbum.tenantId)}`
    : '/admin/gallery/albums';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await updateAlbumServer(
        initialAlbum.id!,
        {
          title: formData.title,
          description: formData.description || undefined,
          coverImageUrl: formData.coverImageUrl || undefined,
          isPublic: formData.isPublic,
          displayOrder: formData.displayOrder,
          galleryCategoryId: formData.galleryCategoryId
            ? Number(formData.galleryCategoryId)
            : null,
        },
        initialAlbum.tenantId,
      );

      router.push(albumsListHref);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update album');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!initialAlbum.id) return;

    try {
      await deleteAlbumServer(initialAlbum.id, initialAlbum.tenantId);
      router.push(albumsListHref);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete album');
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex mb-8" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link
              href="/admin"
              className="flex-shrink-0 h-14 rounded-xl bg-indigo-100 hover:bg-indigo-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
              title="Admin Dashboard"
              aria-label="Admin Dashboard"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-200 flex items-center justify-center">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <span className="font-semibold text-indigo-700">Admin Dashboard</span>
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <Link href={albumsListHref} className="ml-1 text-sm font-medium text-gray-500 md:ml-2 hover:text-gray-700">
                Albums
              </Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">Edit Album</span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Album</h1>
        <p className="mt-2 text-sm text-gray-600">
          Update album details and settings
        </p>
        {albumTenantId ? (
          <div
            className="mt-4 inline-flex flex-wrap items-center gap-2 rounded-xl border-2 border-sky-300 bg-sky-50 px-4 py-3 shadow-sm"
            title="Tenant that owns this album"
            aria-label={`Tenant ID ${albumTenantId}`}
          >
            <span className="text-xs font-semibold uppercase tracking-wide text-sky-700">
              Tenant ID
            </span>
            <code className="rounded-lg bg-white px-3 py-1.5 text-sm font-bold text-sky-900 border border-sky-200 break-all">
              {albumTenantId}
            </code>
          </div>
        ) : (
          <div className="mt-4 inline-flex items-center gap-2 rounded-xl border-2 border-amber-300 bg-amber-50 px-4 py-3 shadow-sm">
            <span className="text-sm font-medium text-amber-800">
              Tenant ID is not set on this album record.
            </span>
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error updating album</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="title">
              Title *
            </label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter album title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter album description (optional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cover Image
            </label>
            {initialAlbum.id != null && (
              <GalleryAlbumCoverImageUpload
                albumId={initialAlbum.id}
                tenantId={albumTenantId || undefined}
                currentImageUrl={formData.coverImageUrl || undefined}
                onImageUploaded={(url) => setFormData((prev) => ({ ...prev, coverImageUrl: url }))}
                onError={() => {}}
                onUploadingChange={setCoverUploading}
                disabled={loading}
              />
            )}
            <p className="mt-2 text-xs text-gray-500">
              Upload saves the cover immediately (S3). You can also set a cover from the{' '}
              <Link
                href={`/admin/gallery/albums/${initialAlbum.id}/media${
                  albumTenantId ? `?tenant=${encodeURIComponent(albumTenantId)}` : ''
                }`}
                className="text-blue-600 hover:underline"
              >
                media management page
              </Link>
              .
            </p>
            <button
              type="button"
              onClick={() => setShowAdvancedCoverUrl((v) => !v)}
              className="mt-2 text-xs text-blue-600 hover:underline"
            >
              {showAdvancedCoverUrl ? 'Hide' : 'Show'} advanced: paste cover URL
            </button>
            {showAdvancedCoverUrl && (
              <div className="mt-2">
                <input
                  id="coverImageUrl"
                  type="url"
                  value={formData.coverImageUrl}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, coverImageUrl: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com/image.jpg (optional)"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Manual URL is saved when you click Save Changes below.
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="displayOrder">
              Display Order
            </label>
            <input
              id="displayOrder"
              type="number"
              value={formData.displayOrder}
              onChange={(e) => setFormData(prev => ({ ...prev, displayOrder: parseInt(e.target.value) || 0 }))}
              min="0"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
            />
            <p className="mt-1 text-xs text-gray-500">
              Lower values appear first in the gallery. Default: 0.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="visibility">
              Visibility
            </label>
            <select
              id="visibility"
              value={formData.isPublic ? 'public' : 'private'}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, isPublic: e.target.value === 'public' }))
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="public">Public — visible in gallery</option>
              <option value="private">Private — hidden from public gallery</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Uses the album <code className="text-xs">isPublic</code> flag. Private albums stay in admin but are hidden on the public site.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="galleryCategoryId">
              Category
            </label>
            <select
              id="galleryCategoryId"
              value={formData.galleryCategoryId}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, galleryCategoryId: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Uncategorized</option>
              {categories.map((cat) => (
                <option key={cat.id} value={String(cat.id)}>
                  {cat.displayName || cat.slug || `Category ${cat.id}`}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Optional gallery grouping (e.g. Ecumenical Visits, Major Events).
            </p>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
            >
              Delete Album
            </button>
            <div className="flex gap-3">
              <Link
                href={albumsListHref}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || coverUploading}
              >
                {loading ? 'Saving...' : coverUploading ? 'Uploading cover...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Album"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete album <strong>"{initialAlbum.title}"</strong>? This action cannot be undone.
          </p>
          <p className="text-sm text-gray-600">
            Media files associated with this album will not be deleted, but they will be removed from the album.
          </p>
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setShowDeleteModal(false);
                handleDelete();
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete Album
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

