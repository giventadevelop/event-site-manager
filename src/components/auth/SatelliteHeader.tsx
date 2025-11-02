'use client';

import React from 'react';
import Link from 'next/link';
import { SatelliteBranding } from '@/lib/satelliteConfig';

interface SatelliteHeaderProps {
  branding: SatelliteBranding;
  satelliteDomain: string;
}

export default function SatelliteHeader({ branding, satelliteDomain }: SatelliteHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left side - Logo/Org Name */}
          <div className="flex items-center">
            <Link href={satelliteDomain} className="flex items-center">
              {branding.logo.type === 'text' ? (
                <div className="text-left">
                  <div
                    className="text-xl font-bold leading-snug"
                    style={{ color: branding.logo.primaryColor }}
                  >
                    {branding.orgName}
                  </div>
                  <div
                    className="text-[10px] font-medium uppercase tracking-wider"
                    style={{ color: branding.logo.secondaryColor }}
                  >
                    {branding.tagline}
                  </div>
                </div>
              ) : branding.logo.url ? (
                <img
                  src={branding.logo.url}
                  alt={branding.orgName}
                  className="h-12 w-auto"
                />
              ) : (
                <div className="text-left">
                  <div
                    className="text-xl font-bold leading-snug"
                    style={{ color: branding.logo.primaryColor }}
                  >
                    {branding.orgName}
                  </div>
                </div>
              )}
            </Link>
          </div>

          {/* Right side - Simple branding indicator */}
          <div className="flex items-center">
            <div className="text-sm text-gray-600">
              Secure Sign In
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
