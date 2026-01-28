import { getAppUrl } from '@/lib/env';

async function fetchGroup(baseUrl: string, id: string) {
  try {
    const res = await fetch(`${baseUrl}/api/proxy/focus-groups/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

async function fetchMembers(baseUrl: string, id: string) {
  try {
    const res = await fetch(`${baseUrl}/api/proxy/focus-group-members?focusGroupId.equals=${id}&sort=createdAt,desc`, { cache: 'no-store' });
    if (!res.ok) return [];
    return Array.isArray(await res.json()) ? await res.json() : [];
  } catch { return []; }
}

export default async function ManageGroupMembersPage({ params }: { params: { id: string } }) {
  const baseUrl = getAppUrl();
  const group = await fetchGroup(baseUrl, params.id);
  const members = await fetchMembers(baseUrl, params.id);

  return (
    <div className="px-8 pt-24 pb-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-2">Manage Members for: {group?.name ?? 'Focus Group'}</h1>
      <div className="text-sm text-gray-600 mb-6">Add or update member roles and statuses (UPPERCASE enforced).</div>

      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">Add Member</h2>
        <form action={`${baseUrl}/api/proxy/focus-group-members`} method="post" className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input type="hidden" name="focusGroupId" value={params.id} />
          <input type="text" name="userProfileId" placeholder="User Profile ID" className="border rounded px-2 py-1" required />
          <input type="text" name="role" placeholder="Role (MEMBER/LEAD/ADMIN)" className="border rounded px-2 py-1" />
          <input type="text" name="status" placeholder="Status (ACTIVE/INACTIVE/PENDING)" className="border rounded px-2 py-1" />
          <button className="px-3 py-1 bg-blue-600 text-white rounded">Add</button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-3">Members</h2>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Profile ID</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {members.map((m: any) => (
              <tr key={m.id}>
                <td className="px-4 py-2 text-sm text-gray-900">{m.userProfileId}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{String(m.role || '').toUpperCase()}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{String(m.status || '').toUpperCase()}</td>
                <td className="px-4 py-2 text-right text-sm">
                  <form action={`${baseUrl}/api/proxy/focus-group-members/${m.id}`} method="post" className="inline-flex gap-2">
                    <input type="hidden" name="_method" value="PATCH" />
                    <input type="text" name="role" placeholder="MEMBER/LEAD/ADMIN" className="border rounded px-2 py-1" defaultValue={String(m.role || '').toUpperCase()} />
                    <input type="text" name="status" placeholder="ACTIVE/INACTIVE/PENDING" className="border rounded px-2 py-1" defaultValue={String(m.status || '').toUpperCase()} />
                    <button className="px-2 py-1 bg-blue-600 text-white rounded">Update</button>
                  </form>
                </td>
              </tr>
            ))}
            {members.length === 0 && (
              <tr><td className="px-4 py-2 text-sm text-gray-500" colSpan={4}>No members found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
