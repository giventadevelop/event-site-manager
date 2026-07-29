import Link from 'next/link';
import Image from 'next/image';
import { fetchDownloadableProfileMediaAssetsServer } from '@/lib/profileSitePublicServer';

export default async function DownloadsListPage() {
  const assets = await fetchDownloadableProfileMediaAssetsServer();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Downloads</h1>
        <p className="text-lg text-gray-600 mb-10">
          Documents and media files available for download.
        </p>

        {assets.length === 0 ? (
          <p className="text-gray-600">No downloads available yet.</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {assets.map((asset) => (
              <li
                key={asset.id ?? asset.fileUrl}
                className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col"
              >
                {asset.coverImageUrl && (
                  <div className="relative w-full h-40">
                    <Image
                      src={asset.coverImageUrl}
                      alt=""
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}
                <div className="p-5 flex flex-col flex-1">
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">{asset.title}</h2>
                  {asset.fileType && (
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">{asset.fileType}</p>
                  )}
                  {asset.description && (
                    <p className="text-sm text-gray-600 line-clamp-3 mb-4">{asset.description}</p>
                  )}
                  <div className="mt-auto flex flex-wrap gap-3">
                    {asset.id != null && (
                      <Link
                        href={`/downloads/${asset.id}`}
                        className="text-sm text-blue-600 font-semibold hover:underline"
                      >
                        View details
                      </Link>
                    )}
                    <a
                      href={asset.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 font-semibold hover:underline"
                    >
                      Download
                    </a>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
