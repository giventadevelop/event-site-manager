import { NextResponse } from 'next/server';
import { getMergedSatelliteConfigs } from '@/lib/satelliteConfigRuntime';
import { getAllowedRedirectOrigins, getSatelliteBareDomains } from '@/lib/satelliteConfig';

/**
 * Public read-only satellite list for:
 * - signout-redirect allowlist (domains)
 * - SatelliteAuthBranding / Header (full configs)
 * Data source: backend API + cache, with JSON fallback inside getMergedSatelliteConfigs.
 */
export async function GET() {
  try {
    const configs = await getMergedSatelliteConfigs();
    const domains = getSatelliteBareDomains(configs);
    const origins = getAllowedRedirectOrigins(configs);

    return NextResponse.json({
      domains,
      origins,
      satellites: configs,
    });
  } catch (e) {
    console.error('[api/public/satellite-domains]', e);
    return NextResponse.json({ domains: [], origins: [], satellites: [] }, { status: 200 });
  }
}
