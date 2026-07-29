import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { fetchProfileMediaAssetByIdServer } from '@/lib/profileSitePublicServer';

interface DownloadDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function DownloadDetailPage({ params }: DownloadDetailPageProps) {
  const { id } = await params;
  const numericId = Number(id);
  if (!numericId || Number.isNaN(numericId)) {
    notFound();
  }
  const asset = await fetchProfileMediaAssetByIdServer(numericId);
  if (!asset || asset.isDownloadable === false) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <Link href="/downloads" className="text-blue-600 font-semibold hover:underline text-sm">
          ← Back to downloads
        </Link>

        {asset.coverImageUrl && (
          <div className="relative w-full h-48 sm:h-64 rounded-lg overflow-hidden shadow-md mt-8 mb-8">
            <Image src={asset.coverImageUrl} alt="" fill className="object-cover" priority unoptimized />
          </div>
        )}

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{asset.title}</h1>
        {asset.fileType && (
          <p className="text-sm uppercase tracking-wide text-gray-500 mb-6">{asset.fileType}</p>
        )}
        {asset.description && (
          <div className="text-lg text-gray-600 whitespace-pre-wrap leading-relaxed mb-8">
            {asset.description}
          </div>
        )}

        <a
          href={asset.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
        >
          Download file
        </a>
      </div>
    </div>
  );
}
