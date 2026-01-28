import { getAppUrl } from '@/lib/env';

async function fetchGroup(baseUrl: string, slug: string) {
  try {
    const res = await fetch(`${baseUrl}/api/proxy/focus-groups?slug.equals=${encodeURIComponent(slug)}&size=1`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) && data.length > 0 ? data[0] : null;
  } catch {
    return null;
  }
}

async function fetchEvents(baseUrl: string, groupId: number) {
  try {
    const res = await fetch(`${baseUrl}/api/proxy/event-details?focusGroupId.equals=${groupId}&sort=startDate,asc`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export default async function FocusGroupDetailPage({ params }: { params: { slug: string } }) {
  const baseUrl = getAppUrl();
  const slug = typeof params.slug === 'string' ? params.slug : Array.isArray(params.slug) ? params.slug[0] : '';
  const group = await fetchGroup(baseUrl, slug);
  const events = group?.id ? await fetchEvents(baseUrl, group.id) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="mb-8">
          <div className="h-48 rounded-2xl bg-cover bg-center" style={{ backgroundImage: group?.coverImageUrl ? `url(${group.coverImageUrl})` : undefined, backgroundColor: '#f3f4f6' }} />
          <h1 className="mt-6 text-3xl md:text-4xl font-semibold text-gray-900">{group?.name || 'Focus Group'}</h1>
          <p className="mt-2 text-gray-600 max-w-3xl">{group?.description || 'Details coming soon.'}</p>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((e: any) => (
              <a key={e.id} href={`/event/${e.id}`} className="block bg-white rounded-xl shadow p-6 hover:shadow-md transition">
                <div className="text-sm text-gray-500">{e.startDate} • {e.startTime}</div>
                <div className="mt-1 text-lg font-semibold text-gray-900">{e.title}</div>
                <div className="mt-1 text-sm text-gray-600 line-clamp-3">{e.caption || e.description}</div>
              </a>
            ))}
            {events.length === 0 && (
              <div className="col-span-full text-center text-gray-500">No upcoming events.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
