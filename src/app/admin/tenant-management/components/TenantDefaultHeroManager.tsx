'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import SaveStatusDialog, { type SaveStatus } from '@/components/SaveStatusDialog';
import type { DefaultHeroDisplayMode, DefaultHeroSlide } from '@/lib/hero/defaultHeroImages';
import {
  DEFAULT_MAX_DISPLAY_COUNT,
  MAX_ACTIVE_SLIDES,
  MAX_DISPLAY_COUNT,
  MAX_LIBRARY_SLIDES,
  clampHeroMaxDisplayCount,
  resolveTenantDefaultHeroUrlsForPreview,
  serializeDefaultHeroSlides,
} from '@/lib/hero/defaultHeroImages';
import {
  patchTenantSetting,
  uploadDefaultHeroImageClient,
} from '@/app/admin/tenant-management/settings/ApiServerActions';
import AdminHelpDialog from '@/components/admin/AdminHelpDialog';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

const PREVIEW_ROTATE_MS = 4000;

interface HeroSlide extends DefaultHeroSlide {
  id: string;
}

export interface TenantDefaultHeroManagerProps {
  settingsId?: number;
  tenantIdForUpload?: string;
  initialSlides?: DefaultHeroSlide[];
  maxDisplayCount?: number;
  displayMode: DefaultHeroDisplayMode;
  includeWithEvents: boolean;
  onSlidesChange: (slides: DefaultHeroSlide[]) => void;
  onMaxDisplayCountChange: (count: number) => void;
  onDisplayModeChange: (mode: DefaultHeroDisplayMode) => void;
  onIncludeWithEventsChange: (value: boolean) => void;
  disabled?: boolean;
  mode: 'create' | 'edit';
}

function slidesToState(slides: DefaultHeroSlide[]): HeroSlide[] {
  return slides.map((slide, index) => ({
    ...slide,
    id: `slide-${index}-${slide.url.slice(-24)}`,
    active: Boolean(slide.active),
  }));
}

function toDefaultSlides(slides: HeroSlide[]): DefaultHeroSlide[] {
  return slides.map(({ url, active, fileName }) => ({ url, active: Boolean(active), fileName }));
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
  initialSlides = [],
  maxDisplayCount = DEFAULT_MAX_DISPLAY_COUNT,
  displayMode,
  includeWithEvents,
  onSlidesChange,
  onMaxDisplayCountChange,
  onDisplayModeChange,
  onIncludeWithEventsChange,
  disabled = false,
  mode,
}: TenantDefaultHeroManagerProps) {
  const [slides, setSlides] = useState<HeroSlide[]>(() => slidesToState(initialSlides));
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
    const next = slidesToState(initialSlides);
    slidesRef.current = next;
    setSlides(next);
  }, [JSON.stringify(initialSlides)]);

  useEffect(() => {
    if (settingsId && initialSlides.length === 0 && mode === 'edit') {
      const key = `tenantHeroWalkthroughDismissed:${settingsId}`;
      setShowWalkthrough(typeof window !== 'undefined' && !localStorage.getItem(key));
    } else {
      setShowWalkthrough(false);
    }
  }, [settingsId, initialSlides.length, mode]);

  useEffect(() => {
    const pool = resolveTenantDefaultHeroUrlsForPreview(toDefaultSlides(slides), maxDisplayCount);
    const rotateCount = pool.length > 0 ? pool.length : slides.length > 0 ? 1 : 0;
    if (displayMode !== 'slideshow' || rotateCount < 2) {
      setPreviewIndex(0);
      return;
    }
    const timer = setInterval(() => {
      setPreviewIndex((i) => (i + 1) % rotateCount);
    }, PREVIEW_ROTATE_MS);
    return () => clearInterval(timer);
  }, [displayMode, slides, maxDisplayCount]);

  const persistSlides = useCallback(
    async (nextSlides: HeroSlide[], nextMaxDisplay?: number) => {
      if (!settingsId) return;
      const payload: Record<string, unknown> = {
        defaultHeroImageUrlsJson: serializeDefaultHeroSlides(nextSlides),
      };
      if (nextMaxDisplay != null) {
        payload.defaultHeroMaxDisplayCount = clampHeroMaxDisplayCount(nextMaxDisplay);
      }
      await patchTenantSetting(settingsId, payload);
    },
    [settingsId]
  );

  const updateSlides = useCallback(
    (next: HeroSlide[], persist = false) => {
      setSlides(next);
      const defaultSlides = toDefaultSlides(next);
      onSlidesChange(defaultSlides);
      if (persist && settingsId) {
        void persistSlides(next).catch((err: Error) => {
          setUploadError(err.message || 'Failed to save hero slides.');
        });
      }
    },
    [onSlidesChange, persistSlides, settingsId]
  );

  const processFiles = async (fileList: FileList | File[]) => {
    if (uploadDisabled) return;

    const files = Array.from(fileList);
    if (files.length === 0) return;

    const currentCount = slidesRef.current.length;
    if (currentCount + files.length > MAX_LIBRARY_SLIDES) {
      setUploadError(`Maximum ${MAX_LIBRARY_SLIDES} hero slides allowed. Remove some slides before uploading more.`);
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
          active: false,
        });
        uploaded += 1;
      }

      updateSlides(newSlides, false);
      await persistSlides(newSlides);

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
        await persistSlides(next);
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
    onSlidesChange(toDefaultSlides(current));
  };

  const handleSlideDragEnd = () => {
    if (dragSlideId && settingsId) {
void persistSlides(slidesRef.current).catch((err: Error) => {
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
      if (!existing.has(url) && merged.length < MAX_LIBRARY_SLIDES) {
        merged.push({
          id: `slide-manual-${Date.now()}-${merged.length}`,
          url,
          active: false,
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

  const activeCount = slides.filter((s) => s.active).length;
  const previewPool = resolveTenantDefaultHeroUrlsForPreview(toDefaultSlides(slides), maxDisplayCount);
  const previewSlides =
    previewPool.length > 0
      ? previewPool
      : slides.length > 0
        ? [slides[0].url]
        : [];

  const previewUrl =
    previewSlides.length > 0
      ? displayMode === 'slideshow' && previewSlides.length >= 2
        ? previewSlides[previewIndex % previewSlides.length]
        : previewSlides[0]
      : null;

  const handleToggleActive = (slideId: string) => {
    const current = slidesRef.current;
    const target = current.find((s) => s.id === slideId);
    if (!target) return;

    const activating = !target.active;
    const currentActiveCount = current.filter((s) => s.active).length;
    if (activating && currentActiveCount >= MAX_ACTIVE_SLIDES) {
      setUploadError(`Maximum ${MAX_ACTIVE_SLIDES} slides can be marked active for the homepage.`);
      return;
    }

    setUploadError(null);
    const next = current.map((s) => (s.id === slideId ? { ...s, active: activating } : s));
    updateSlides(next, true);
  };

  const handleMaxDisplayChange = (value: number) => {
    const clamped = clampHeroMaxDisplayCount(value);
    onMaxDisplayCountChange(clamped);
    if (settingsId) {
      void persistSlides(slidesRef.current, clamped).catch((err: Error) => {
        setUploadError(err.message || 'Failed to save display count.');
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium text-gray-900">Default Homepage Hero Images</h3>
          <AdminHelpDialog
            title="Default Hero Images — Guidelines & Assistance"
            ariaLabel="Default hero images guidelines and assistance"
            documentationUrl="/documentation/default_hero_images_rotation/DEFAULT_HERO_IMAGES_ADMIN_GUIDELINES.html"
            accent="teal"
          />
        </div>
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
                <li>Mark slides <strong>Active</strong> for the homepage (max {MAX_ACTIVE_SLIDES}). Set rotation count (1–{MAX_DISPLAY_COUNT}).</li>
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
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <p className="text-sm font-medium text-gray-700">
              Library ({slides.length}/{MAX_LIBRARY_SLIDES}) — drag to reorder
            </p>
            <p className="text-sm text-gray-600">
              Active for homepage: <span className="font-semibold text-teal-700">{activeCount}</span>/
              {MAX_ACTIVE_SLIDES}
              {activeCount === 0 && slides.length > 0 && (
                <span className="text-amber-700 ml-2">(homepage will show 3 random from library)</span>
              )}
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                draggable
                onDragStart={(e) => handleSlideDragStart(e, slide.id)}
                onDragOver={(e) => handleSlideDragOver(e, slide.id)}
                onDragEnd={handleSlideDragEnd}
                className={`relative rounded-lg border overflow-hidden bg-gray-100 ${
                  dragSlideId === slide.id
                    ? 'border-teal-500 ring-2 ring-teal-300'
                    : slide.active
                      ? 'border-green-200'
                      : 'border-orange-300'
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
                      handleToggleActive(slide.id);
                    }}
                    className={`absolute bottom-1 left-1 text-xs font-semibold px-2 py-0.5 rounded transition-colors ${
                      slide.active
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-orange-500 text-white hover:bg-orange-600'
                    }`}
                    title={slide.active ? 'Mark inactive for homepage' : 'Mark active for homepage'}
                    aria-label={slide.active ? 'Mark slide inactive for homepage' : 'Mark slide active for homepage'}
                  >
                    {slide.active ? 'Active' : 'Inactive'}
                  </button>
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


      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <option value="slideshow">Slideshow (ordered rotation)</option>
            <option value="random">Random (shuffle each visit)</option>
            <option value="single">Single (first slide only)</option>
          </select>
        </div>
        <div>
          <label htmlFor="defaultHeroMaxDisplayCount" className="block text-sm font-medium text-gray-700 mb-2">
            Images in homepage rotation
          </label>
          <select
            id="defaultHeroMaxDisplayCount"
            value={clampHeroMaxDisplayCount(maxDisplayCount)}
            onChange={(e) => handleMaxDisplayChange(Number(e.target.value))}
            className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-teal-500 focus:ring-teal-500 px-4 py-3 text-base"
            title="Maximum active slides shown on homepage"
            aria-label="Maximum active slides shown on homepage"
          >
            {Array.from({ length: MAX_DISPLAY_COUNT }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? 'image' : 'images'}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            When slides are active, show up to this many in order (max {MAX_DISPLAY_COUNT}).
          </p>
        </div>
        <div className="flex items-start md:pt-8">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={includeWithEvents}
              onChange={(e) => onIncludeWithEventsChange(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-400 text-teal-600 focus:ring-teal-500"
            />
            <span className="text-sm text-gray-700">
              Show default hero slides on the homepage (active slides only). When enabled, slides
              are appended after upcoming event hero images when those exist.
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
