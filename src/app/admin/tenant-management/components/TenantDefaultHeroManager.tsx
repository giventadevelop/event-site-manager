'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import SaveStatusDialog, { type SaveStatus } from '@/components/SaveStatusDialog';
import type { DefaultHeroDisplayMode } from '@/lib/hero/defaultHeroImages';
import { serializeDefaultHeroImageUrls } from '@/lib/hero/defaultHeroImages';
import {
  patchTenantSetting,
  uploadDefaultHeroImageClient,
} from '@/app/admin/tenant-management/settings/ApiServerActions';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_SLIDES = 20;
const PREVIEW_ROTATE_MS = 4000;

interface HeroSlide {
  id: string;
  url: string;
  fileName?: string;
}

export interface TenantDefaultHeroManagerProps {
  settingsId?: number;
  tenantIdForUpload?: string;
  initialUrls?: string[];
  displayMode: DefaultHeroDisplayMode;
  includeWithEvents: boolean;
  onUrlsChange: (urls: string[]) => void;
  onDisplayModeChange: (mode: DefaultHeroDisplayMode) => void;
  onIncludeWithEventsChange: (value: boolean) => void;
  disabled?: boolean;
  mode: 'create' | 'edit';
}

function urlsToSlides(urls: string[]): HeroSlide[] {
  return urls.map((url, index) => ({
    id: `slide-${index}-${url.slice(-24)}`,
    url,
  }));
}

function validateImageFile(file: File): string | null {
  if (!file.type.startsWith('image/')) {
    return 'Please select an image file (PNG, JPG, JPEG, WEBP, GIF).';
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return 'File size must be less than 10MB.';
  }
  return null;
}

export default function TenantDefaultHeroManager({
  settingsId,
  tenantIdForUpload,
  initialUrls = [],
  displayMode,
  includeWithEvents,
  onUrlsChange,
  onDisplayModeChange,
  onIncludeWithEventsChange,
  disabled = false,
  mode,
}: TenantDefaultHeroManagerProps) {
  const [slides, setSlides] = useState<HeroSlide[]>(() => urlsToSlides(initialUrls));
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragSlideId, setDragSlideId] = useState<string | null>(null);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [showManualUrls, setShowManualUrls] = useState(false);
  const [manualUrlsText, setManualUrlsText] = useState('');
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadDialogStatus, setUploadDialogStatus] = useState<SaveStatus>('saving');
  const [uploadDialogTitle, setUploadDialogTitle] = useState('');
  const [uploadDialogMessage, setUploadDialogMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const slidesRef = useRef(slides);
  slidesRef.current = slides;

  const uploadDisabled = disabled || !settingsId || mode === 'create';

  useEffect(() => {
    const next = urlsToSlides(initialUrls);
    slidesRef.current = next;
    setSlides(next);
  }, [initialUrls.join('|')]);

  useEffect(() => {
    if (settingsId && initialUrls.length === 0 && mode === 'edit') {
      const key = `tenantHeroWalkthroughDismissed:${settingsId}`;
      setShowWalkthrough(typeof window !== 'undefined' && !localStorage.getItem(key));
    } else {
      setShowWalkthrough(false);
    }
  }, [settingsId, initialUrls.length, mode]);

  useEffect(() => {
    if (displayMode !== 'slideshow' || slides.length < 2) {
      setPreviewIndex(0);
      return;
    }
    const timer = setInterval(() => {
      setPreviewIndex((i) => (i + 1) % slides.length);
    }, PREVIEW_ROTATE_MS);
    return () => clearInterval(timer);
  }, [displayMode, slides.length]);

  const persistUrls = useCallback(
    async (urls: string[]) => {
      if (!settingsId) return;
      await patchTenantSetting(settingsId, {
        defaultHeroImageUrlsJson: serializeDefaultHeroImageUrls(urls),
      });
    },
    [settingsId]
  );

  const updateSlides = useCallback(
    (next: HeroSlide[], persist = false) => {
      setSlides(next);
      const urls = next.map((s) => s.url);
      onUrlsChange(urls);
      if (persist && settingsId) {
        void persistUrls(urls).catch((err: Error) => {
          setUploadError(err.message || 'Failed to save hero image order.');
        });
      }
    },
    [onUrlsChange, persistUrls, settingsId]
  );

  const processFiles = async (fileList: FileList | File[]) => {
    if (uploadDisabled) return;

    const files = Array.from(fileList);
    if (files.length === 0) return;

    const currentCount = slidesRef.current.length;
    if (currentCount + files.length > MAX_SLIDES) {
      setUploadError(`Maximum ${MAX_SLIDES} hero slides allowed. Remove some slides before uploading more.`);
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadDialogOpen(true);
    setUploadDialogStatus('saving');
    setUploadDialogTitle('Uploading...');
    setUploadDialogMessage(`Preparing to upload ${files.length} file(s)...`);

    const newSlides: HeroSlide[] = [...slidesRef.current];
    let uploaded = 0;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const validationError = validateImageFile(file);
        if (validationError) {
          throw new Error(`${file.name}: ${validationError}`);
        }

        setUploadProgress(`Uploading ${i + 1} of ${files.length}...`);
        setUploadDialogMessage(`Uploading ${i + 1} of ${files.length}: ${file.name}`);

        const result = await uploadDefaultHeroImageClient(file, tenantIdForUpload);
        if (!result.url) {
          throw new Error(`${file.name}: Upload succeeded but no URL was returned.`);
        }

        newSlides.push({
          id: `slide-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 9)}`,
          url: result.url,
          fileName: file.name,
        });
        uploaded += 1;
      }

      updateSlides(newSlides, false);
      await persistUrls(newSlides.map((s) => s.url));

      setUploadDialogStatus('success');
      setUploadDialogTitle('Uploaded Successfully!');
      setUploadDialogMessage(
        uploaded === 1
          ? 'Hero image uploaded and saved.'
          : `${uploaded} hero images uploaded and saved.`
      );
      setTimeout(() => setUploadDialogOpen(false), 2000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      setUploadError(message);
      setUploadDialogStatus('error');
      setUploadDialogTitle('Upload Failed');
      setUploadDialogMessage(message);
      if (newSlides.length > slidesRef.current.length) {
        updateSlides(newSlides, true);
      }
    } finally {
      setUploading(false);
      setUploadProgress('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!uploadDisabled && !uploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (uploadDisabled || uploading) return;
    const files = e.dataTransfer.files;
    if (files?.length) {
      await processFiles(files);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.length) {
      await processFiles(files);
    }
  };

  const handleRemoveSlide = async (slideId: string) => {
    const next = slides.filter((s) => s.id !== slideId);
    updateSlides(next, false);
    if (settingsId) {
      try {
        await persistUrls(next.map((s) => s.url));
      } catch (err: unknown) {
        setUploadError(err instanceof Error ? err.message : 'Failed to remove slide.');
      }
    }
  };

  const handleSlideDragStart = (e: React.DragEvent, slideId: string) => {
    setDragSlideId(slideId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleSlideDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!dragSlideId || dragSlideId === targetId) return;

    const current = [...slidesRef.current];
    const fromIndex = current.findIndex((s) => s.id === dragSlideId);
    const toIndex = current.findIndex((s) => s.id === targetId);
    if (fromIndex < 0 || toIndex < 0) return;

    const [moved] = current.splice(fromIndex, 1);
    current.splice(toIndex, 0, moved);
    slidesRef.current = current;
    setSlides(current);
    onUrlsChange(current.map((s) => s.url));
  };

  const handleSlideDragEnd = () => {
    if (dragSlideId && settingsId) {
      const urls = slidesRef.current.map((s) => s.url);
      void persistUrls(urls).catch((err: Error) => {
        setUploadError(err.message || 'Failed to save slide order.');
      });
    }
    setDragSlideId(null);
  };

  const handleMergeManualUrls = () => {
    const parsed = manualUrlsText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.startsWith('https://'));

    if (parsed.length === 0) {
      setUploadError('Enter at least one valid HTTPS URL (one per line).');
      return;
    }

    const existing = new Set(slides.map((s) => s.url));
    const merged = [...slides];
    for (const url of parsed) {
      if (!existing.has(url) && merged.length < MAX_SLIDES) {
        merged.push({
          id: `slide-manual-${Date.now()}-${merged.length}`,
          url,
        });
        existing.add(url);
      }
    }

    updateSlides(merged, true);
    setManualUrlsText('');
    setUploadError(null);
  };

  const dismissWalkthrough = () => {
    if (settingsId) {
      localStorage.setItem(`tenantHeroWalkthroughDismissed:${settingsId}`, '1');
    }
    setShowWalkthrough(false);
  };

  const previewUrl =
    slides.length > 0
      ? displayMode === 'slideshow' && slides.length >= 2
        ? slides[previewIndex]?.url
        : slides[0]?.url
      : null;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Default Homepage Hero Images</h3>
        <p className="text-sm text-gray-500 mt-1">
          Shown when no upcoming event hero media exists, or as trailing slides when enabled below.
        </p>
      </div>

      {showWalkthrough && (
        <div className="rounded-lg border border-teal-200 bg-teal-50 p-4">
          <div className="flex justify-between items-start gap-4">
            <div>
              <p className="font-semibold text-teal-900 mb-2">Quick setup (3 steps)</p>
              <ol className="list-decimal pl-5 text-sm text-teal-800 space-y-1">
                <li>Upload one or more hero slides (drag and drop or browse).</li>
                <li>Choose display mode: slideshow, random, or single.</li>
                <li>Click <strong>Update Settings</strong> at the bottom, or uploads auto-save.</li>
              </ol>
              <Link
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-3 text-sm font-medium text-teal-700 hover:text-teal-900 underline"
              >
                View homepage in new tab
              </Link>
            </div>
            <button
              type="button"
              onClick={dismissWalkthrough}
              className="text-xs text-teal-600 hover:text-teal-800 whitespace-nowrap"
              title="Dismiss setup guide"
              aria-label="Dismiss setup guide"
            >
              Don&apos;t show again
            </button>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
        <strong>Fallback order:</strong> upcoming event hero images → tenant default slides (this page) →
        bundled emergency image (
        <code className="text-xs">/images/hero_section/hero_images/fallback/default-hero.webp</code>).
      </div>

      {mode === 'create' && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Save settings first, then return to edit this tenant to upload hero images.
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Upload hero images</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileInputChange}
          disabled={uploadDisabled || uploading}
          className="hidden"
        />
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !uploadDisabled && !uploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors w-full ${
            uploadDisabled || uploading
              ? 'opacity-50 cursor-not-allowed border-gray-300 bg-gray-50'
              : isDragging
                ? 'border-teal-500 bg-teal-50 cursor-pointer'
                : 'border-gray-300 hover:border-teal-500 cursor-pointer'
          }`}
          title={uploadDisabled ? 'Save settings before uploading' : 'Upload hero images'}
          aria-label={uploadDisabled ? 'Upload disabled until settings are saved' : 'Upload one or more hero images'}
          role="button"
          tabIndex={uploadDisabled ? -1 : 0}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !uploadDisabled && !uploading) {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
        >
          <div
            className={`flex-shrink-0 w-14 h-14 rounded-xl mx-auto mb-3 flex items-center justify-center ${
              isDragging ? 'bg-teal-100' : 'bg-gray-100'
            }`}
          >
            {uploading ? (
              <svg className="animate-spin w-10 h-10 text-teal-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <svg className="w-10 h-10 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            )}
          </div>
          <p className={`text-sm ${isDragging ? 'text-teal-700 font-semibold' : 'text-gray-600'}`}>
            {uploading
              ? uploadProgress || 'Uploading...'
              : isDragging
                ? 'Drop images here'
                : 'Upload one or more images. Drag and drop or click to browse.'}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            PNG, JPG, JPEG, WEBP, GIF — max 10MB each. Recommended: 2000×800 (5:2 landscape).
          </p>
          {slides.length === 0 && !uploading && (
            <p className="text-xs text-gray-500 mt-3">
              No default hero images yet. Homepage uses the platform emergency image until you upload slides or
              upcoming events provide hero media.
            </p>
          )}
        </div>
        {uploadError && (
          <p className="mt-2 text-sm text-red-600" role="alert">
            {uploadError}
          </p>
        )}
      </div>

      {slides.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">
            Slides ({slides.length}/{MAX_SLIDES}) — drag to reorder
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                draggable
                onDragStart={(e) => handleSlideDragStart(e, slide.id)}
                onDragOver={(e) => handleSlideDragOver(e, slide.id)}
                onDragEnd={handleSlideDragEnd}
                className={`relative rounded-lg border overflow-hidden bg-gray-100 ${
                  dragSlideId === slide.id ? 'border-teal-500 ring-2 ring-teal-300' : 'border-gray-300'
                }`}
              >
                <div className="relative h-24 w-full">
                  <img
                    src={slide.url}
                    alt={`Hero slide ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <span className="absolute top-1 left-1 bg-black/60 text-white text-xs font-semibold px-2 py-0.5 rounded">
                    {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      void handleRemoveSlide(slide.id);
                    }}
                    className="absolute top-1 right-1 flex-shrink-0 w-8 h-8 rounded-lg bg-red-100 hover:bg-red-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
                    title={`Remove slide ${index + 1}`}
                    aria-label={`Remove slide ${index + 1}`}
                  >
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
                {slide.fileName && (
                  <p className="text-xs text-gray-500 truncate px-2 py-1" title={slide.fileName}>
                    {slide.fileName}
                  </p>
                )}
                <div
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 cursor-grab active:cursor-grabbing text-gray-400"
                  title="Drag to reorder"
                  aria-hidden
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 6h2v2H8V6zm0 5h2v2H8v-2zm0 5h2v2H8v-2zm5-10h2v2h-2V6zm0 5h2v2h-2v-2zm0 5h2v2h-2v-2z" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="defaultHeroDisplayMode" className="block text-sm font-medium text-gray-700 mb-2">
            Display mode
          </label>
          <select
            id="defaultHeroDisplayMode"
            value={displayMode}
            onChange={(e) => onDisplayModeChange(e.target.value as DefaultHeroDisplayMode)}
            className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-teal-500 focus:ring-teal-500 px-4 py-3 text-base"
            title="Default hero display mode"
            aria-label="Default hero display mode"
          >
            <option value="slideshow">Slideshow (rotate all URLs)</option>
            <option value="random">Random (one URL per page load)</option>
            <option value="single">Single (first URL only)</option>
          </select>
        </div>
        <div className="flex items-center pt-8">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={includeWithEvents}
              onChange={(e) => onIncludeWithEventsChange(e.target.checked)}
              className="h-5 w-5 rounded border-gray-400 text-teal-600 focus:ring-teal-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Include default slides when event hero images exist
            </span>
          </label>
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Live preview</p>
        <div
          className="relative w-full rounded-xl overflow-hidden border border-gray-300"
          style={{ backgroundColor: '#1a0a2e', minHeight: '160px' }}
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Hero preview"
              className="w-full h-auto max-h-48 object-contain mx-auto block"
            />
          ) : (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
              Upload slides to see preview
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <button
          type="button"
          onClick={() => setShowManualUrls(!showManualUrls)}
          className="text-sm font-medium text-teal-700 hover:text-teal-900 flex items-center gap-2"
          title="Toggle manual URL entry"
          aria-label="Toggle manual URL entry"
          aria-expanded={showManualUrls}
        >
          <svg
            className={`w-4 h-4 transition-transform ${showManualUrls ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          Add URLs manually (advanced)
        </button>
        {showManualUrls && (
          <div className="mt-3 space-y-3">
            <textarea
              value={manualUrlsText}
              onChange={(e) => setManualUrlsText(e.target.value)}
              rows={4}
              className="block w-full border border-gray-400 rounded-xl focus:border-teal-500 focus:ring-teal-500 px-4 py-3 text-base font-mono text-sm"
              placeholder="https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/tenants/your-tenant/hero-defaults/slide-01.webp"
              title="Manual hero image URLs"
              aria-label="Manual hero image URLs"
            />
            <button
              type="button"
              onClick={handleMergeManualUrls}
              className="flex-shrink-0 h-12 rounded-xl bg-teal-100 hover:bg-teal-200 flex items-center justify-center gap-2 px-4 transition-all duration-300 hover:scale-105"
              title="Merge URLs into slide list"
              aria-label="Merge URLs into slide list"
            >
              <span className="font-semibold text-teal-700 text-sm">Merge URLs into slides</span>
            </button>
          </div>
        )}
      </div>

      <SaveStatusDialog
        isOpen={uploadDialogOpen}
        status={uploadDialogStatus}
        title={uploadDialogTitle}
        message={uploadDialogMessage}
        onClose={() => {
          if (uploadDialogStatus === 'error') {
            setUploadDialogOpen(false);
          }
        }}
      />
    </div>
  );
}
