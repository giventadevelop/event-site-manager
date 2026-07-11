import { fetchAlbumServer } from '../../ApiServerActions';
import AdminAlbumEditClient from './AdminAlbumEditClient';
import AdminNavigation from '@/components/AdminNavigation';
import { notFound } from 'next/navigation';
import { effectiveTenantId } from '@/lib/env';

export default async function AdminAlbumEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ tenant?: string }> | { tenant?: string };
}) {
  const resolvedParams = typeof params.then === 'function' ? await params : params;
  const resolvedSearch =
    searchParams && typeof (searchParams as Promise<{ tenant?: string }>).then === 'function'
      ? await (searchParams as Promise<{ tenant?: string }>)
      : ((searchParams as { tenant?: string } | undefined) ?? {});

  const albumId = parseInt(resolvedParams.id, 10);
  const tenantOverride = effectiveTenantId(resolvedSearch.tenant);

  if (isNaN(albumId)) {
    notFound();
  }

  const album = await fetchAlbumServer(albumId, tenantOverride);

  if (!album) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 xl:px-16" style={{ paddingTop: '180px', paddingBottom: '48px' }}>
        <AdminNavigation currentPage="gallery-albums" />
        <AdminAlbumEditClient initialAlbum={album} />
      </div>
    </div>
  );
}
