'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { extractSatelliteConfig, type SatelliteConfig } from '@/lib/satelliteConfig';

type Props = {
  /** `redirect_url` query when signing in on primary to return to a satellite (e.g. https://www.mosc-temp.com). */
  redirectUrl: string | null | undefined;
  className?: string;
};

/**
 * Slim header above Clerk on auth pages: satellite branding from the public API
 * (DB + tenant logo, cached) with sync JSON fallback when `redirect_url` matches a satellite.
 */
export default function SatelliteAuthBranding({ redirectUrl, className = '' }: Props) {
  const [runtimeConfigs, setRuntimeConfigs] = useState<SatelliteConfig[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/public/satellite-domains', { cache: 'no-store' });
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (!cancelled && Array.isArray(data?.satellites) && data.satellites.length > 0) {
          setRuntimeConfigs(data.satellites as SatelliteConfig[]);
        }
      } catch {
        /* keep null → extractSatelliteConfig falls back to sync JSON */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const satellite = useMemo(() => {
    if (!redirectUrl || !redirectUrl.startsWith('http')) return null;
    return extractSatelliteConfig(redirectUrl, runtimeConfigs ?? undefined);
  }, [redirectUrl, runtimeConfigs]);

  if (!satellite?.branding || satellite.branding.showOnAuth?.header === false) {
    return null;
  }

  const b = satellite.branding;
  const logo = b.logo ?? { type: 'text' as const, primaryColor: '#111827', secondaryColor: '#6b7280' };

  const hasBrandingText = Boolean(
    (b.orgName && b.orgName.trim()) || (b.fullName && b.fullName.trim()) || (b.tagline && b.tagline.trim())
  );

  /** Shared text block: org name, full name, tagline (same as text-logo mode, also shown under image logos). */
  const brandingTextBlock = hasBrandingText ? (
    <div className="space-y-1">
      {b.orgName?.trim() ? (
        <p
          className="text-2xl font-bold tracking-tight sm:text-3xl"
          style={{ color: logo.primaryColor }}
        >
          {b.orgName.trim()}
        </p>
      ) : null}
      {b.fullName?.trim() ? (
        <p className="text-sm text-gray-700 sm:text-base">{b.fullName.trim()}</p>
      ) : null}
      {b.tagline?.trim() ? (
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-gray-500 sm:text-xs">
          {b.tagline.trim()}
        </p>
      ) : null}
    </div>
  ) : null;

  return (
    <header
      className={`w-full border-b border-gray-200/80 bg-gradient-to-b from-white to-gray-50/90 backdrop-blur-sm ${className}`}
      role="banner"
    >
      <div className="mx-auto max-w-lg px-4 py-6 text-center">
        {logo.type === 'image' && logo.url ? (
          <div className="flex flex-col items-center gap-4">
            <div className="flex justify-center">
              <Image
                src={logo.url}
                alt={b.orgName?.trim() || b.fullName?.trim() || 'Organization logo'}
                width={280}
                height={80}
                className="h-16 w-auto max-w-[min(100%,320px)] object-contain sm:h-20"
                unoptimized
              />
            </div>
            {brandingTextBlock}
          </div>
        ) : (
          brandingTextBlock ?? (
            <div className="space-y-1">
              <p
                className="text-2xl font-bold tracking-tight sm:text-3xl"
                style={{ color: logo.primaryColor }}
              >
                {b.orgName}
              </p>
              <p className="text-sm text-gray-700 sm:text-base">{b.fullName}</p>
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-gray-500 sm:text-xs">
                {b.tagline}
              </p>
            </div>
          )
        )}
      </div>
    </header>
  );
}
