'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { extractSatelliteConfig } from '@/lib/satelliteConfig';

type Props = {
  /** `redirect_url` query when signing in on primary to return to a satellite (e.g. https://www.mosc-temp.com). */
  redirectUrl: string | null | undefined;
  className?: string;
};

/**
 * Slim header above Clerk on auth pages: shows satellite branding from `config/satellites.json`
 * when `redirect_url` matches a known satellite. Not a separate deploy — same app, config-driven.
 */
export default function SatelliteAuthBranding({ redirectUrl, className = '' }: Props) {
  const satellite = useMemo(() => {
    if (!redirectUrl || !redirectUrl.startsWith('http')) return null;
    return extractSatelliteConfig(redirectUrl);
  }, [redirectUrl]);

  if (!satellite?.branding || satellite.branding.showOnAuth?.header === false) {
    return null;
  }

  const b = satellite.branding;
  const logo = b.logo ?? { type: 'text' as const, primaryColor: '#111827', secondaryColor: '#6b7280' };

  return (
    <header
      className={`w-full border-b border-gray-200/80 bg-gradient-to-b from-white to-gray-50/90 backdrop-blur-sm ${className}`}
      role="banner"
    >
      <div className="mx-auto max-w-lg px-4 py-6 text-center">
        {logo.type === 'image' && logo.url ? (
          <div className="flex justify-center">
            <Image
              src={logo.url}
              alt={b.orgName}
              width={200}
              height={64}
              className="h-14 w-auto max-w-[min(100%,280px)] object-contain"
              unoptimized
            />
          </div>
        ) : (
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
        )}
      </div>
    </header>
  );
}
