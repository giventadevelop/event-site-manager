import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import AdminNavigation from '@/components/AdminNavigation';
import TeamMembersClient from './TeamMembersClient';
import { fetchTeamMembersPage } from './ApiServerActions';
import { fetchTeamGroups } from '../team-groups/ApiServerActions';

interface PageProps {
  searchParams: Promise<{ groupId?: string }>;
}

export default async function TeamMembersAdminPage({ searchParams }: PageProps) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const sp = await searchParams;
  const groupId = sp.groupId ? Number(sp.groupId) : undefined;
  const PAGE_SIZE = 10;

  let groups: Awaited<ReturnType<typeof fetchTeamGroups>> = [];
  let members: Awaited<ReturnType<typeof fetchTeamMembersPage>>['members'] = [];
  let totalCount = 0;

  try {
    const result = await Promise.race([
      Promise.all([
        fetchTeamGroups(),
        fetchTeamMembersPage(0, PAGE_SIZE, {
          teamGroupId: Number.isFinite(groupId) ? groupId : undefined,
        }),
      ]),
      new Promise<[typeof groups, { members: typeof members; totalCount: number }]>((resolve) =>
        setTimeout(() => {
          console.warn('[TeamMembers] Data fetch timeout after 25 seconds');
          resolve([[], { members: [], totalCount: 0 }]);
        }, 25000)
      ),
    ]);
    groups = result[0];
    members = result[1].members;
    totalCount = result[1].totalCount;
  } catch (error) {
    console.error('Failed to fetch team members:', error);
  }

  return (
    <div className="container mx-auto px-4 py-8" style={{ paddingTop: '180px' }}>
      <AdminNavigation currentPage="admin" />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Team roster members</h1>
        <div className="bg-gray-50 border-l-4 border-rose-500 p-4 rounded-r-lg">
          <p className="text-gray-700">
            Add players or band members with portraits, jersey numbers, and skills. Members belong
            to a team group. Use Tenant ID typeahead to filter by organization (optional — leave
            empty for default JWT tenant context).
          </p>
        </div>
      </div>
      <TeamMembersClient
        initialMembers={members}
        initialGroups={groups}
        initialTotalCount={totalCount}
        initialPageSize={PAGE_SIZE}
        filterGroupId={Number.isFinite(groupId) ? groupId : undefined}
      />
    </div>
  );
}
