import type { TenantSettingsDTO } from '@/types';

/** Platform-wide emergency fallback when tenant settings and S3 URLs are unavailable. */
export const BUNDLED_EMERGENCY_HERO_IMAGE =
  '/images/hero_section/hero_images/fallback/default-hero.webp';

export type DefaultHeroDisplayMode = 'slideshow' | 'random' | 'single';

export interface TenantHeroConfig {
  urls: string[];
  displayMode: DefaultHeroDisplayMode;
  includeWithEvents: boolean;
}

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

/**
 * Parse tenant default hero URLs from settings.
 * Backend may return `defaultHeroImageUrls` as an array or `defaultHeroImageUrlsJson` as a JSON string.
 */
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
        return uniqueUrls(parsed.filter(isNonEmptyUrl));
      }
    } catch {
      // Fall through — treat as comma-separated list
      return uniqueUrls(
        jsonField.split(',').map((s) => s.trim()).filter(isNonEmptyUrl)
      );
    }
  }

  return [];
}

export function getTenantHeroConfig(
  settings?: Pick<
    TenantSettingsDTO,
    'defaultHeroImageUrls' | 'defaultHeroImageUrlsJson' | 'defaultHeroDisplayMode' | 'defaultHeroIncludeWithEvents'
  > | null
): TenantHeroConfig {
  const urls = parseTenantDefaultHeroUrls(settings);
  const displayMode = settings?.defaultHeroDisplayMode ?? DEFAULT_DISPLAY_MODE;
  const includeWithEvents = settings?.defaultHeroIncludeWithEvents ?? DEFAULT_INCLUDE_WITH_EVENTS;
  return { urls, displayMode, includeWithEvents };
}

/**
 * Apply display mode to a tenant default URL pool (used when there are no event hero images).
 */
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
    'defaultHeroImageUrls' | 'defaultHeroImageUrlsJson' | 'defaultHeroDisplayMode' | 'defaultHeroIncludeWithEvents'
  > | null;
}

export interface ResolveHeroImagesResult {
  imageUrls: string[];
  durationsMs: number[];
  /** True when the last slide(s) are tenant/bundled defaults (no linked event). */
  defaultSlideCount: number;
}

const DEFAULT_SLIDE_DURATION_MS = 8000;

/**
 * Resolve homepage hero slideshow URLs: event media → tenant defaults → bundled emergency.
 */
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

  const durationsMs = imageUrls.map((_, index) => {
    const isDefaultSlide = index >= imageUrls.length - defaultSlideCount;
    return isDefaultSlide ? DEFAULT_SLIDE_DURATION_MS : DEFAULT_SLIDE_DURATION_MS;
  });

  return { imageUrls, durationsMs, defaultSlideCount };
}

/**
 * Single URL fallback for event pages, checkout, success screens, etc.
 */
export function resolveSingleHeroFallbackUrl(
  tenantSettings?: Pick<TenantSettingsDTO, 'defaultHeroImageUrls' | 'defaultHeroImageUrlsJson' | 'defaultHeroDisplayMode'> | null,
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

/** Serialize tenant default URLs for backend JSON column. */
export function serializeDefaultHeroImageUrls(urls: string[]): string {
  return JSON.stringify(uniqueUrls(urls.filter(isNonEmptyUrl)));
}
