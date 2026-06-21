import type { EventMediaDTO } from '@/types';
import {
  getOfficialDocumentProxyThumbnailPath,
  isAwsPresignedQueryUrl,
  isPresignedUrlExpired,
} from '@/lib/officialDocumentDownload';

export type EventMediaThumbnailInput = Pick<
  EventMediaDTO,
  'fileUrl' | 'thumbnailUrl' | 'thumbnailPreSignedUrl' | 'fileDataContentType' | 'contentType' | 'title'
> & {
  fileName?: string;
};

export type OfficialDocumentPlaceholderKind = 'pdf' | 'word' | 'excel' | 'image' | 'generic';

/** Card preview frame on /mosc-redesign/downloads (Tailwind aspect-[16/10]). */
export const OFFICIAL_DOCUMENT_CARD_THUMBNAIL_ASPECT = '16 / 10';

/** Recommended upload size for download card thumbnails (2× desktop ~400px width). */
export const OFFICIAL_DOCUMENT_CARD_THUMBNAIL_RECOMMENDED = {
  width: 800,
  height: 500,
  label: '800×500 px (16:10)',
} as const;

function mimeFromMedia(media: EventMediaThumbnailInput): string {
  const mime = (media.fileDataContentType || media.contentType || '').toLowerCase();
  if (mime) return mime;
  const name = media.fileName || media.title || media.fileUrl || '';
  const ext = name.split('.').pop()?.toLowerCase() || '';
  if (ext === 'pdf') return 'application/pdf';
  if (['doc', 'docx'].includes(ext)) return 'application/msword';
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'application/vnd.ms-excel';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) return `image/${ext === 'jpg' ? 'jpeg' : ext}`;
  return '';
}

export function isImageMime(mime: string): boolean {
  return mime.startsWith('image/');
}

function pickUsableUrl(
  preSigned?: string | null,
  stable?: string | null,
  expiresAtIso?: string | null
): string | null {
  const pre = preSigned?.trim();
  if (pre && !isPresignedUrlExpired(pre, expiresAtIso)) {
    return pre;
  }

  const stableUrl = stable?.trim();
  if (!stableUrl) {
    return null;
  }

  if (isAwsPresignedQueryUrl(stableUrl)) {
    return isPresignedUrlExpired(stableUrl, expiresAtIso) ? null : stableUrl;
  }

  return stableUrl;
}

/** Resolved URL for card/list preview, or null when a placeholder should be shown. */
export function getEventMediaDisplayThumbnailUrl(
  media: EventMediaThumbnailInput,
  options?: {
    thumbnailExpiresAtIso?: string | null;
    fileExpiresAtIso?: string | null;
  }
): string | null {
  const uploadedThumb = pickUsableUrl(
    media.thumbnailPreSignedUrl,
    media.thumbnailUrl,
    options?.thumbnailExpiresAtIso
  );
  if (uploadedThumb) {
    return uploadedThumb;
  }

  const mime = mimeFromMedia(media);
  if (isImageMime(mime) && media.fileUrl) {
    const fileUrl = media.fileUrl.trim();
    if (isAwsPresignedQueryUrl(fileUrl)) {
      return isPresignedUrlExpired(fileUrl, options?.fileExpiresAtIso) ? null : fileUrl;
    }
    return fileUrl;
  }

  return null;
}

/** True when the record may have a preview image (uploaded thumb or image main file). */
export function hasOfficialDocumentDisplayThumbnail(
  media: EventMediaThumbnailInput,
  options?: {
    thumbnailExpiresAtIso?: string | null;
    fileExpiresAtIso?: string | null;
  }
): boolean {
  if (media.thumbnailUrl?.trim() || media.thumbnailPreSignedUrl?.trim()) {
    return true;
  }
  return isImageMime(mimeFromMedia(media));
}

/**
 * Prefer the same-origin thumbnail proxy when a media id is available so cards never
 * rely on expired presigned URLs stored in event_media.
 */
export function getOfficialDocumentCardThumbnailSrc(
  mediaId: number | null | undefined,
  media: EventMediaThumbnailInput,
  options?: {
    thumbnailExpiresAtIso?: string | null;
    fileExpiresAtIso?: string | null;
  }
): string | null {
  if (mediaId != null && hasOfficialDocumentDisplayThumbnail(media, options)) {
    return getOfficialDocumentProxyThumbnailPath(mediaId);
  }
  return getEventMediaDisplayThumbnailUrl(media, options);
}

export function getOfficialDocumentPlaceholderKind(
  media: EventMediaThumbnailInput
): OfficialDocumentPlaceholderKind {
  const mime = mimeFromMedia(media);
  if (isImageMime(mime)) return 'image';
  if (mime.includes('pdf')) return 'pdf';
  if (mime.includes('word') || mime.includes('msword') || mime.includes('document')) return 'word';
  if (mime.includes('excel') || mime.includes('spreadsheet') || mime.includes('csv')) return 'excel';
  const name = (media.fileName || media.title || '').toLowerCase();
  if (name.endsWith('.pdf')) return 'pdf';
  if (name.endsWith('.doc') || name.endsWith('.docx')) return 'word';
  if (name.endsWith('.xls') || name.endsWith('.xlsx') || name.endsWith('.csv')) return 'excel';
  return 'generic';
}

export function placeholderGradient(kind: OfficialDocumentPlaceholderKind): string {
  switch (kind) {
    case 'pdf':
      return 'from-red-50 via-red-100 to-orange-50';
    case 'word':
      return 'from-blue-50 via-blue-100 to-indigo-50';
    case 'excel':
      return 'from-emerald-50 via-green-100 to-teal-50';
    case 'image':
      return 'from-violet-50 via-purple-100 to-fuchsia-50';
    default:
      return 'from-slate-50 via-gray-100 to-slate-100';
  }
}

export function placeholderLabel(kind: OfficialDocumentPlaceholderKind): string {
  switch (kind) {
    case 'pdf':
      return 'PDF';
    case 'word':
      return 'DOC';
    case 'excel':
      return 'XLS';
    case 'image':
      return 'IMG';
    default:
      return 'FILE';
  }
}
