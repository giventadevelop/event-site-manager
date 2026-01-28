'use client';

import { useState } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import { AlbumMediaSlideshow } from './AlbumMediaSlideshow';
import type { GalleryAlbumWithMedia } from '../../ApiServerActions';

interface GalleryAlbumCardProps {
  albumWithMedia: GalleryAlbumWithMedia;
}

export function GalleryAlbumCard({ albumWithMedia }: GalleryAlbumCardProps) {
  const [showSlideshow, setShowSlideshow] = useState(false);
  const { album, media, totalMediaCount } = albumWithMedia;

  // Get preview images (first 4 media items)
  const previewMedia = media.slice(0, 4);
  const remainingCount = Math.max(0, totalMediaCount - 4);

  // Get cover image (prefer album coverImageUrl, then first available media)
  const coverImage = album.coverImageUrl
    ? { fileUrl: album.coverImageUrl, altText: album.title }
    : media.find(m => m.fileUrl);

  const formatAlbumDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return 'Date TBD';
    }
  };

  const getMediaTypeIcon = (mediaType: string) => {
    if (mediaType.startsWith('video/')) {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    );
  };

  const getMediaTypeColor = (mediaType: string) => {
    if (mediaType.startsWith('video/')) {
      return 'text-red-600 bg-red-100';
    }
    return 'text-blue-600 bg-blue-100';
  };

  // Generate a colorful background based on album ID for consistency
  const getCardBackground = (albumId: number) => {
    const colors = [
      'bg-gradient-to-br from-blue-50 to-blue-100',
      'bg-gradient-to-br from-green-50 to-green-100',
      'bg-gradient-to-br from-purple-50 to-purple-100',
      'bg-gradient-to-br from-pink-50 to-pink-100',
      'bg-gradient-to-br from-yellow-50 to-yellow-100',
      'bg-gradient-to-br from-indigo-50 to-indigo-100',
      'bg-gradient-to-br from-red-50 to-red-100',
      'bg-gradient-to-br from-teal-50 to-teal-100'
    ];
    return colors[albumId % colors.length];
  };

  return (
    <>
      <div className={`${getCardBackground(album.id!)} rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-white/50 flex flex-col`}>
        {/* Cover Image */}
        <div className="relative h-48 bg-gray-200">
          {coverImage?.fileUrl ? (
            <Image
              src={coverImage.fileUrl}
              alt={coverImage.altText || album.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-100">
              <div className="text-center text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-sm">No image available</p>
              </div>
            </div>
          )}

          {/* Media count badge */}
          {totalMediaCount > 0 && (
            <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded-full text-xs font-medium">
              {totalMediaCount} {totalMediaCount === 1 ? 'item' : 'items'}
            </div>
          )}
        </div>

        {/* Album Info */}
        <div className="p-6 flex-grow flex flex-col">
          <h3 className="font-semibold text-gray-900 text-lg mb-2 overflow-hidden" style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}>
            {album.title}
          </h3>

          {album.createdAt && (
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatAlbumDate(album.createdAt)}
            </div>
          )}

          {album.description && (
            <p className="text-sm text-gray-600 mb-3 overflow-hidden" style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}>
              {album.description}
            </p>
          )}

          {/* Preview thumbnails */}
          {previewMedia.length > 0 && (
            <div className="mb-3">
              <div className="grid grid-cols-4 gap-1 h-16">
                {previewMedia.map((mediaItem, index) => (
                  <div key={mediaItem.id} className="relative bg-gray-100 rounded overflow-hidden">
                    {mediaItem.fileUrl ? (
                      <Image
                        src={mediaItem.fileUrl}
                        alt={mediaItem.altText || mediaItem.title}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        {getMediaTypeIcon(mediaItem.eventMediaType)}
                      </div>
                    )}

                    {/* Media type indicator */}
                    <div className={`absolute bottom-0 right-0 ${getMediaTypeColor(mediaItem.eventMediaType)} p-1 rounded-tl`}>
                      {getMediaTypeIcon(mediaItem.eventMediaType)}
                    </div>
                  </div>
                ))}

                {/* Show remaining count */}
                {remainingCount > 0 && (
                  <div className="flex items-center justify-center bg-gray-100 rounded text-xs font-medium text-gray-600">
                    +{remainingCount}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Spacer to push buttons down */}
          <div className="flex-grow"></div>
        </div>

        {/* Action buttons - Per icons_buttons_styles.mdc */}
        <div className="flex space-x-3 p-6 pt-0 mt-auto">
          {/* View Gallery Button - Full-width with icon + text pattern */}
          <button
            onClick={() => {
              console.log('View Gallery clicked for album:', album.title, 'Media count:', media.length);
              setShowSlideshow(true);
            }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 h-12 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold shadow-sm border-2 border-blue-400 hover:border-blue-500 disabled:bg-blue-100 disabled:border-blue-300 disabled:text-blue-500 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 hover:shadow-md"
            title="View Gallery"
            aria-label="View Gallery"
            disabled={media.length === 0}
            type="button"
          >
            <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-blue-200 flex items-center justify-center">
              {/* Eye/View Icon - Inline SVG per icons_buttons_styles.mdc */}
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <span className="text-sm">View Gallery</span>
          </button>
        </div>
      </div>

      {/* Slideshow Modal */}
      {showSlideshow && (
        <AlbumMediaSlideshow
          album={album}
          media={media}
          onClose={() => setShowSlideshow(false)}
        />
      )}
    </>
  );
}

