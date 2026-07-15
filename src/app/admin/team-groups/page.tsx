import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import AdminNavigation from '@/components/AdminNavigation';
import TeamGroupsClient from './TeamGroupsClient';
import { fetchTeamGroupsPage } from './ApiServerActions';

export default async function TeamGroupsAdminPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const PAGE_SIZE = 10;
  let groups: Awaited<ReturnType<typeof fetchTeamGroupsPage>>['groups'] = [];
  let totalCount = 0;
  try {
    const result = await Promise.race([
      fetchTeamGroupsPage(0, PAGE_SIZE),
      new Promise<{ groups: typeof groups; totalCount: number }>((resolve) =>
        setTimeout(() => {
          console.warn('[TeamGroups] Data fetch timeout after 25 seconds');
          resolve({ groups: [], totalCount: 0 });
        }, 25000)
      ),
    ]);
    groups = result.groups;
    totalCount = result.totalCount;
  } catch (error) {
    console.error('Failed to fetch team groups:', error);
    groups = [];
    totalCount = 0;
  }

  return (
    <div className="container mx-auto px-4 py-8" style={{ paddingTop: '180px' }}>
      <AdminNavigation currentPage="admin" />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Team groups</h1>
        <div className="bg-gray-50 border-l-4 border-violet-500 p-4 rounded-r-lg">
          <p className="text-gray-700">
            Manage squads and bands shown on the homepage carousel. Each group has its own roster
            members. Use Tenant ID typeahead to filter by organization (optional — leave empty for
            default JWT tenant context).
          </p>
        </div>
      </div>
      <TeamGroupsClient
        initialGroups={groups}
        initialTotalCount={totalCount}
        initialPageSize={PAGE_SIZE}
      />
    </div>
  );
}
