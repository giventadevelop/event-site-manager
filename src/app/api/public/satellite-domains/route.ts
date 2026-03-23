import { NextResponse } from 'next/server';
import { getMergedSatelliteConfigs } from '@/lib/satelliteConfigRuntime';
import {
  getAllowedRedirectOrigins,
  getSatelliteBareDomains,
  getSatelliteConfigsSync,
} from '@/lib/satelliteConfig';

/**
 * Single public endpoint for satellite configuration (App Router only — do not duplicate
 * under pages/api; Next.js forbids the same path in both routers).
 *
 * Data flow (matches satelliteConfigRuntime):
 * 1. Enabled rows from backend `/api/satellite-domains` (service JWT via fetchWithJwtRetry)
 * 2. Next.js `unstable_cache` (revalidate 300s + tag for admin invalidation)
 * 3. Fallback to config/satellites.json + env when API returns no rows or errors
 *
 * Used by: signout-redirect allowlist, Header sign-out, SatelliteAuthBranding (satellites JSON).
 */
export async function GET() {
  const headers = new Headers();
  // CDN / browser: align with unstable_cache revalidate (300s) + SWR
  headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');

  try {
    const configs = await getMergedSatelliteConfigs();
    let domains = getSatelliteBareDomains(configs);
    const origins = getAllowedRedirectOrigins(configs);

    // Dev parity with former Pages handler: ensure localhost is allowlisted for local testing
    if (!domains.includes('localhost')) {
      domains = [...domains, 'localhost'];
    }

    return NextResponse.json(
      {
        domains,
        origins,
        satellites: configs,
        count: domains.length,
        source: 'merged',
      },
      { status: 200, headers }
    );
  } catch (e) {
    console.error('[api/public/satellite-domains]', e);

    // Sync JSON/env fallback so clients never get an empty allowlist (sign-out / redirects)
    const syncConfigs = getSatelliteConfigsSync();
    let domains = getSatelliteBareDomains(syncConfigs);
    const origins = getAllowedRedirectOrigins(syncConfigs);
    if (!domains.includes('localhost')) {
      domains = [...domains, 'localhost'];
    }

    headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');

    return NextResponse.json(
      {
        domains,
        origins,
        satellites: syncConfigs,
        count: domains.length,
        source: 'fallback',
        error: 'Merged satellite config failed; using JSON/env fallback',
      },
      { status: 200, headers }
    );
  }
}
