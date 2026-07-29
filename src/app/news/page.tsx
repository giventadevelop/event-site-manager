import Link from 'next/link';
import Image from 'next/image';
import { fetchPublishedProfileWritingsServer } from '@/lib/profileSitePublicServer';
import { getProfileWritingDetailPath, formatProfileDate } from '@/lib/profileSitePaths';

export default async function NewsListPage() {
  const writings = await fetchPublishedProfileWritingsServer();
  const articles = writings.filter((w) => w.writingType !== 'EXTERNAL_LINK');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">News</h1>
        <p className="text-lg text-gray-600 mb-10">
          Published writings and perspectives for this site.
        </p>

        {articles.length === 0 ? (
          <p className="text-gray-600">No published articles yet.</p>
        ) : (
          <ul className="space-y-6">
            {articles.map((writing) => {
              const href = getProfileWritingDetailPath(writing);
              const dateLabel = formatProfileDate(writing.publishedAt);
              return (
                <li
                  key={writing.id ?? writing.slug}
                  className="bg-white rounded-lg shadow-md p-5 flex flex-col sm:flex-row gap-5"
                >
                  {writing.featuredImageUrl && (
                    <div className="relative w-full sm:w-40 h-32 flex-shrink-0 rounded-lg overflow-hidden">
                      <Image
                        src={writing.featuredImageUrl}
                        alt=""
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    {dateLabel && (
                      <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">{dateLabel}</p>
                    )}
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      {href ? (
                        <Link href={href} className="hover:text-blue-600">
                          {writing.title}
                        </Link>
                      ) : (
                        writing.title
                      )}
                    </h2>
                    {writing.excerpt && (
                      <p className="text-sm text-gray-600 line-clamp-3 mb-3">{writing.excerpt}</p>
                    )}
                    {href && (
                      <Link href={href} className="text-sm text-blue-600 font-semibold hover:underline">
                        Read more →
                      </Link>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
