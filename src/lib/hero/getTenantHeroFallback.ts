import { getTenantId } from '@/lib/env';
import { getTenantSettings } from '@/lib/tenantSettingsCache';
import {
  BUNDLED_EMERGENCY_HERO_IMAGE,
  resolveSingleHeroFallbackUrl,
} from '@/lib/hero/defaultHeroImages';

/**
 * Server-side: resolve tenant-aware single hero fallback URL (for checkout, events, API routes).
 */
export async function getTenantHeroFallbackUrl(preferredEventUrl?: string | null): Promise<string> {
  try {
    const tenantId = getTenantId();
    const settings = await getTenantSettings(tenantId);
    return resolveSingleHeroFallbackUrl(settings, preferredEventUrl);
  } catch (error) {
    console.warn('[getTenantHeroFallbackUrl] Failed to load tenant settings, using bundled fallback:', error);
    if (preferredEventUrl?.trim()) return preferredEventUrl.trim();
    return BUNDLED_EMERGENCY_HERO_IMAGE;
  }
}
