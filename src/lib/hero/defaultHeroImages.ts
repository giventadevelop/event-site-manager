import type { TenantSettingsDTO } from '@/types';

/** Platform-wide emergency fallback when tenant settings and S3 URLs are unavailable. */
export const BUNDLED_EMERGENCY_HERO_IMAGE =
  '/images/hero_section/hero_images/fallback/default-hero.webp';

export type DefaultHeroDisplayMode = 'slideshow' | 'random' | 'single';

export interface DefaultHeroSlide {
  url: string;
  active?: boolean;
  fileName?: string;
}

export interface TenantHeroConfig {
  urls: string[];
  displayMode: DefaultHeroDisplayMode;
  includeWithEvents: boolean;
}

export const MAX_LIBRARY_SLIDES = 20;
export const MAX_ACTIVE_SLIDES = 10;
export const DEFAULT_MAX_DISPLAY_COUNT = 6;
export const MAX_DISPLAY_COUNT = 6;
export const RANDOM_FALLBACK_COUNT = 3;

const DEFAULT_DISPLAY_MODE: DefaultHeroDisplayMode = 'slideshow';
const DEFAULT_INCLUDE_WITH_EVENTS = true;

function isNonEmptyUrl(url: unknown): url is string {
  return typeof url === 'string' && url.trim().length > 0;
}

function uniqueUrls(urls: string[]): string[] {
  const seen = new Set<string>();
  return urls.filter((url) => {
    const trimmed = url.trim();
    if (!trimmed || seen.has(trimmed)) return false;
    seen.add(trimmed);
    return true;
  });
}

export function isLegacyHeroSettings(
  jsonField?: string | null,
  imageUrls?: string[] | null
): boolean {
  if (Array.isArray(imageUrls) && imageUrls.length > 0) return true;
  if (!jsonField || !jsonField.trim()) return true;
  try {
    const parsed = JSON.parse(jsonField);
    if (!Array.isArray(parsed) || parsed.length === 0) return true;
    return parsed.every((item) => typeof item === 'string');
  } catch {
    return true;
  }
}

export function clampHeroMaxDisplayCount(count?: number | null): number {
  if (count == null || Number.isNaN(Number(count))) return DEFAULT_MAX_DISPLAY_COUNT;
  return Math.min(MAX_DISPLAY_COUNT, Math.max(1, Math.floor(Number(count))));
}

export function parseTenantDefaultHeroSlides(
  settings?: Pick<TenantSettingsDTO, 'defaultHeroImageUrls' | 'defaultHeroImageUrlsJson'> | null
): DefaultHeroSlide[] {
  if (!settings) return [];

  if (Array.isArray(settings.defaultHeroImageUrls) && settings.defaultHeroImageUrls.length > 0) {
    return uniqueUrls(settings.defaultHeroImageUrls.filter(isNonEmptyUrl)).map((url) => ({
      url,
      active: true,
    }));
  }

  const jsonField = settings.defaultHeroImageUrlsJson;
  if (typeof jsonField === 'string' && jsonField.trim()) {
    try {
      const parsed = JSON.parse(jsonField);
      if (Array.isArray(parsed)) {
        if (parsed.length === 0) return [];
        if (typeof parsed[0] === 'string') {
          return uniqueUrls(parsed.filter(isNonEmptyUrl)).map((url) => ({ url, active: true }));
        }
        const slides: DefaultHeroSlide[] = [];
        const seen = new Set<string>();
        for (const item of parsed) {
          if (item && typeof item === 'object' && isNonEmptyUrl((item as DefaultHeroSlide).url)) {
            const url = String((item as DefaultHeroSlide).url).trim();
            if (seen.has(url)) continue;
            seen.add(url);
            slides.push({
              url,
              active: Boolean((item as DefaultHeroSlide).active),
              fileName:
                typeof (item as DefaultHeroSlide).fileName === 'string'
                  ? (item as DefaultHeroSlide).fileName
                  : undefined,
            });
          }
        }
        return slides;
      }
    } catch {
      return uniqueUrls(
        jsonField
          .split(',')
          .map((s) => s.trim())
          .filter(isNonEmptyUrl)
      ).map((url) => ({ url, active: true }));
    }
  }

  return [];
}

export function serializeDefaultHeroSlides(slides: DefaultHeroSlide[]): string {
  return JSON.stringify(
    slides
      .filter((s) => isNonEmptyUrl(s.url))
      .map((s) => ({
        url: s.url.trim(),
        active: Boolean(s.active),
        ...(s.fileName ? { fileName: s.fileName } : {}),
      }))
  );
}

export function parseTenantDefaultHeroUrls(
  settings?: Pick<TenantSettingsDTO, 'defaultHeroImageUrls' | 'defaultHeroImageUrlsJson'> | null
): string[] {
  if (!settings) return [];

  if (Array.isArray(settings.defaultHeroImageUrls) && settings.defaultHeroImageUrls.length > 0) {
    return uniqueUrls(settings.defaultHeroImageUrls.filter(isNonEmptyUrl));
  }

  const jsonField = settings.defaultHeroImageUrlsJson;
  if (typeof jsonField === 'string' && jsonField.trim()) {
    try {
      const parsed = JSON.parse(jsonField);
      if (Array.isArray(parsed)) {
        if (parsed.length > 0 && typeof parsed[0] === 'object' && parsed[0] !== null) {
          return parseTenantDefaultHeroSlides(settings).map((s) => s.url);
        }
        return uniqueUrls(parsed.filter(isNonEmptyUrl));
      }
    } catch {
      return uniqueUrls(
        jsonField
          .split(',')
          .map((s) => s.trim())
          .filter(isNonEmptyUrl)
      );
    }
  }

  return [];
}

export function pickRandomSlidesFromLibrary(slides: DefaultHeroSlide[], count: number): string[] {
  const library = slides.filter((s) => isNonEmptyUrl(s.url)).map((s) => s.url.trim());
  if (library.length === 0) return [];

  const pool = [...library];
  const picked: string[] = [];
  const n = Math.min(count, pool.length);

  for (let i = 0; i < n; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    picked.push(pool[idx]);
    pool.splice(idx, 1);
  }

  return picked;
}

export function resolveTenantDefaultHeroUrlsForDisplay(
  settings?: Pick<
    TenantSettingsDTO,
    'defaultHeroImageUrls' | 'defaultHeroImageUrlsJson' | 'defaultHeroMaxDisplayCount'
  > | null
): string[] {
  if (
    isLegacyHeroSettings(settings?.defaultHeroImageUrlsJson, settings?.defaultHeroImageUrls ?? undefined)
  ) {
    return parseTenantDefaultHeroUrls(settings);
  }

  const slides = parseTenantDefaultHeroSlides(settings);
  if (slides.length === 0) return [];

  const maxDisplay = clampHeroMaxDisplayCount(settings?.defaultHeroMaxDisplayCount);
  const activeUrls = slides.filter((s) => s.active && isNonEmptyUrl(s.url)).map((s) => s.url.trim());

  if (activeUrls.length > 0) {
    return activeUrls.slice(0, maxDisplay);
  }

  return pickRandomSlidesFromLibrary(slides, RANDOM_FALLBACK_COUNT);
}

export function resolveTenantDefaultHeroUrlsForPreview(
  slides: DefaultHeroSlide[],
  maxDisplayCount?: number | null
): string[] {
  if (slides.length === 0) return [];

  const maxDisplay = clampHeroMaxDisplayCount(maxDisplayCount);
  const activeUrls = slides.filter((s) => s.active && isNonEmptyUrl(s.url)).map((s) => s.url.trim());

  if (activeUrls.length > 0) {
    return activeUrls.slice(0, maxDisplay);
  }

  return pickRandomSlidesFromLibrary(slides, RANDOM_FALLBACK_COUNT);
}

export function getTenantHeroConfig(
  settings?: Pick<
    TenantSettingsDTO,
    | 'defaultHeroImageUrls'
    | 'defaultHeroImageUrlsJson'
    | 'defaultHeroDisplayMode'
    | 'defaultHeroIncludeWithEvents'
    | 'defaultHeroMaxDisplayCount'
  > | null
): TenantHeroConfig {
  const urls = resolveTenantDefaultHeroUrlsForDisplay(settings);
  const displayMode = settings?.defaultHeroDisplayMode ?? DEFAULT_DISPLAY_MODE;
  const includeWithEvents = settings?.defaultHeroIncludeWithEvents ?? DEFAULT_INCLUDE_WITH_EVENTS;
  return { urls, displayMode, includeWithEvents };
}

export function applyTenantDisplayMode(
  urls: string[],
  mode: DefaultHeroDisplayMode = DEFAULT_DISPLAY_MODE
): string[] {
  if (urls.length === 0) return [];
  if (mode === 'single') return [urls[0]];
  if (mode === 'random') {
    const index = Math.floor(Math.random() * urls.length);
    return [urls[index]];
  }
  return urls;
}

export interface ResolveHeroImagesInput {
  eventImageUrls?: string[];
  tenantSettings?: Pick<
    TenantSettingsDTO,
    | 'defaultHeroImageUrls'
    | 'defaultHeroImageUrlsJson'
    | 'defaultHeroDisplayMode'
    | 'defaultHeroIncludeWithEvents'
    | 'defaultHeroMaxDisplayCount'
  > | null;
}

export interface ResolveHeroImagesResult {
  imageUrls: string[];
  durationsMs: number[];
  defaultSlideCount: number;
}

const DEFAULT_SLIDE_DURATION_MS = 8000;

export function resolveHeroImages(input: ResolveHeroImagesInput): ResolveHeroImagesResult {
  const eventUrls = uniqueUrls((input.eventImageUrls ?? []).filter(isNonEmptyUrl));
  const { urls: tenantUrls, displayMode, includeWithEvents } = getTenantHeroConfig(input.tenantSettings);

  let imageUrls: string[] = [];
  let defaultSlideCount = 0;

  if (eventUrls.length > 0) {
    imageUrls = [...eventUrls];
    if (includeWithEvents && tenantUrls.length > 0) {
      const tenantSlides = applyTenantDisplayMode(tenantUrls, displayMode);
      imageUrls.push(...tenantSlides);
      defaultSlideCount = tenantSlides.length;
    } else if (includeWithEvents) {
      imageUrls.push(BUNDLED_EMERGENCY_HERO_IMAGE);
      defaultSlideCount = 1;
    }
  } else {
    const tenantSlides =
      tenantUrls.length > 0
        ? applyTenantDisplayMode(tenantUrls, displayMode)
        : [BUNDLED_EMERGENCY_HERO_IMAGE];
    imageUrls = tenantSlides;
    defaultSlideCount = tenantSlides.length;
  }

  if (imageUrls.length === 0) {
    imageUrls = [BUNDLED_EMERGENCY_HERO_IMAGE];
    defaultSlideCount = 1;
  }

  const durationsMs = imageUrls.map(() => DEFAULT_SLIDE_DURATION_MS);

  return { imageUrls, durationsMs, defaultSlideCount };
}

export function resolveSingleHeroFallbackUrl(
  tenantSettings?: Pick<
    TenantSettingsDTO,
    | 'defaultHeroImageUrls'
    | 'defaultHeroImageUrlsJson'
    | 'defaultHeroDisplayMode'
    | 'defaultHeroMaxDisplayCount'
  > | null,
  preferredEventUrl?: string | null
): string {
  if (isNonEmptyUrl(preferredEventUrl)) return preferredEventUrl.trim();

  const { urls, displayMode } = getTenantHeroConfig(tenantSettings);
  if (urls.length > 0) {
    const applied = applyTenantDisplayMode(urls, displayMode);
    return applied[0] ?? BUNDLED_EMERGENCY_HERO_IMAGE;
  }

  return BUNDLED_EMERGENCY_HERO_IMAGE;
}

/** @deprecated Use serializeDefaultHeroSlides for enriched JSON. */
export function serializeDefaultHeroImageUrls(urls: string[]): string {
  return JSON.stringify(uniqueUrls(urls.filter(isNonEmptyUrl)));
}
