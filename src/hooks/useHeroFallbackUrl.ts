'use client';

import { useMemo } from 'react';
import { useTenantSettings } from '@/components/TenantSettingsProvider';
import { resolveSingleHeroFallbackUrl } from '@/lib/hero/defaultHeroImages';

/**
 * Client-side tenant-aware hero fallback URL (event URL preferred when provided).
 */
export function useHeroFallbackUrl(preferredEventUrl?: string | null): string {
  const { settings } = useTenantSettings();
  return useMemo(
    () => resolveSingleHeroFallbackUrl(settings, preferredEventUrl),
    [settings, preferredEventUrl]
  );
}
