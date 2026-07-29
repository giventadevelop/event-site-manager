import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchProfileWritingByIdServer } from '@/lib/profileSitePublicServer';

interface WritingIdPageProps {
  params: Promise<{ id: string }>;
}

export default async function WritingIdPage({ params }: WritingIdPageProps) {
  const { id } = await params;
  const numericId = Number(id);
  if (!numericId || Number.isNaN(numericId)) {
    notFound();
  }
  const writing = await fetchProfileWritingByIdServer(numericId);
  if (!writing) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <Link href="/news" className="text-blue-600 font-semibold hover:underline text-sm">
          ← Back to news
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-8 mb-4">{writing.title}</h1>
        {writing.publicationName && (
          <p className="text-sm text-gray-500 mb-6">{writing.publicationName}</p>
        )}
        {writing.body ? (
          <div className="prose max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
            {writing.body}
          </div>
        ) : writing.excerpt ? (
          <p className="text-lg text-gray-600">{writing.excerpt}</p>
        ) : null}
        {writing.externalUrl?.trim() && (
          <a
            href={writing.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex mt-8 text-blue-600 font-semibold hover:underline"
          >
            Open original →
          </a>
        )}
      </div>
    </div>
  );
}
