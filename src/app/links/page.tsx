import Link from 'next/link';
import {
  fetchPublishedPublicProfileForPagesServer,
  fetchPublishedProfileWritingsServer,
  fetchProfileAffiliationsForLinksServer,
} from '@/lib/profileSitePublicServer';

type LinkItem = {
  label: string;
  href: string;
  group: string;
};

function collectSocialLinks(
  profile: Awaited<ReturnType<typeof fetchPublishedPublicProfileForPagesServer>>
): LinkItem[] {
  if (!profile) return [];
  const entries: Array<[string, string | undefined]> = [
    ['Website', profile.websiteUrl],
    ['LinkedIn', profile.linkedinUrl],
    ['Twitter / X', profile.twitterUrl],
    ['Facebook', profile.facebookUrl],
    ['Instagram', profile.instagramUrl],
    ['YouTube', profile.youtubeUrl],
  ];
  return entries
    .filter(([, url]) => !!url?.trim())
    .map(([label, url]) => ({
      label,
      href: url!.trim(),
      group: 'Social',
    }));
}

export default async function LinksListPage() {
  const [profile, writings, affiliations] = await Promise.all([
    fetchPublishedPublicProfileForPagesServer(),
    fetchPublishedProfileWritingsServer(),
    fetchProfileAffiliationsForLinksServer(),
  ]);

  const socialLinks = collectSocialLinks(profile);
  const externalWritings = writings
    .filter((w) => w.writingType === 'EXTERNAL_LINK' && !!w.externalUrl?.trim())
    .map((w) => ({
      label: w.title,
      href: w.externalUrl!.trim(),
      group: 'Featured links',
    }));
  const affiliationLinks = affiliations
    .filter((a) => !!a.url?.trim())
    .map((a) => ({
      label: a.role ? `${a.organizationName} — ${a.role}` : a.organizationName,
      href: a.url!.trim(),
      group: 'Affiliations',
    }));

  const allLinks = [...socialLinks, ...externalWritings, ...affiliationLinks];
  const groups = Array.from(new Set(allLinks.map((l) => l.group)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Links</h1>
        <p className="text-lg text-gray-600 mb-10">
          Social profiles, external articles, and affiliated organizations.
        </p>

        {allLinks.length === 0 ? (
          <p className="text-gray-600">No links available yet.</p>
        ) : (
          <div className="space-y-10">
            {groups.map((group) => (
              <section key={group}>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{group}</h2>
                <ul className="space-y-3">
                  {allLinks
                    .filter((l) => l.group === group)
                    .map((link) => (
                      <li key={`${link.group}-${link.href}-${link.label}`}>
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between gap-4 bg-white rounded-lg shadow-md px-5 py-4 hover:bg-gray-50"
                        >
                          <span className="font-medium text-gray-900">{link.label}</span>
                          <span className="text-blue-600 text-sm font-semibold flex-shrink-0">Open →</span>
                        </a>
                      </li>
                    ))}
                </ul>
              </section>
            ))}
          </div>
        )}

        <p className="mt-12 text-sm text-gray-600">
          Looking for on-site articles?{' '}
          <Link href="/news" className="text-blue-600 font-semibold hover:underline">
            Visit News
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
