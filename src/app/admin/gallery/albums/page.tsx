import { fetchAlbumsServer } from './ApiServerActions';
import AdminAlbumListClient from './AdminAlbumListClient';
import AdminNavigation from '@/components/AdminNavigation';

export default async function AdminAlbumsPage({
  searchParams,
}: {
  searchParams?:
    | Promise<{ [key: string]: string | string[] | undefined }>
    | { [key: string]: string | string[] | undefined };
}) {
  const resolvedSearchParams =
    searchParams && typeof (searchParams as Promise<unknown>).then === 'function'
      ? await searchParams
      : searchParams;
  const page = typeof resolvedSearchParams?.page === 'string' ? parseInt(resolvedSearchParams.page, 10) : 0;
  const searchTerm = typeof resolvedSearchParams?.search === 'string' ? resolvedSearchParams.search : '';

  // Initial SSR load; client re-fetches with full filters (tenant, search field, visibility, sort).
  const { albums, totalCount } = await fetchAlbumsServer(page, 12, {
    title: searchTerm || undefined,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 xl:px-16" style={{ paddingTop: '180px', paddingBottom: '48px' }}>
        <AdminNavigation currentPage="gallery-albums" />
        <AdminAlbumListClient
          initialAlbums={albums}
          initialTotalCount={totalCount}
          initialPage={page}
          initialSearchTerm={searchTerm}
        />
      </div>
    </div>
  );
}
