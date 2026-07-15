import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import AdminNavigation from '@/components/AdminNavigation';
import HomepageCacheClient from './HomepageCacheClient';
import { fetchHomepageCacheSettingsPage } from './ApiServerActions';

export default async function HomepageCachePage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const PAGE_SIZE = 10;
  let settings: Awaited<ReturnType<typeof fetchHomepageCacheSettingsPage>>['settings'] = [];
  let totalCount = 0;

  try {
    const result = await Promise.race([
      fetchHomepageCacheSettingsPage(0, PAGE_SIZE),
      new Promise<{ settings: typeof settings; totalCount: number }>((resolve) =>
        setTimeout(() => {
          console.warn('[HomepageCache] Data fetch timeout after 25 seconds');
          resolve({ settings: [], totalCount: 0 });
        }, 25000)
      ),
    ]);
    settings = result.settings;
    totalCount = result.totalCount;
  } catch (error) {
    console.error('[HomepageCachePage] Failed to fetch tenant settings:', error);
  }

  return (
    <div className="container mx-auto px-4 py-8" style={{ paddingTop: '180px' }}>
      <AdminNavigation currentPage="admin" />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Cache records</h1>
        <div className="bg-gray-50 border-l-4 border-sky-500 p-4 rounded-r-lg">
          <p className="text-gray-700">
            Refresh the edge-cached homepage payload per tenant by bumping{' '}
            <code className="text-sm bg-gray-100 px-1 rounded">homepageCacheVersion</code>. Use
            Tenant ID typeahead to filter by organization (optional — leave empty for default JWT
            tenant context).
          </p>
        </div>
      </div>
      <HomepageCacheClient
        initialSettings={settings}
        initialTotalCount={totalCount}
        initialPageSize={PAGE_SIZE}
      />
    </div>
  );
}
