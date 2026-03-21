/**
 * Satellite Domain Configuration Management
 *
 * This module provides scalable configuration management for satellite domains.
 * Sync helpers read JSON / env only. Runtime merged list (DB + cache + JSON fallback)
 * lives in `satelliteConfigRuntime.ts` (used by root layout and `/api/public/satellite-domains`).
 */

import satellitesConfig from '../../config/satellites.json';

export interface SatelliteBranding {
  orgName: string;
  fullName: string;
  tagline: string;
  logo: {
    type: 'text' | 'image';
    url?: string;
    primaryColor: string;
    secondaryColor: string;
  };
  theme: {
    primaryColor: string;
    hoverColor: string;
    activeColor: string;
  };
  contact: {
    address: string;
    phone: string;
    tollFree?: string;
    email: string;
  };
  social: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
  };
  showOnAuth: {
    header: boolean;
    footer: boolean;
  };
}

export interface SatelliteConfig {
  id: string;
  domain: string;
  hostname: string;
  displayName: string;
  tenantId?: string;
  enabled: boolean;
  addedDate: string;
  branding?: SatelliteBranding;
}

/**
 * Get satellite configurations from JSON file
 * This is cached at build time for performance
 */
function getSatellitesFromJson(): SatelliteConfig[] {
  try {
    return satellitesConfig.satellites.filter(sat => sat.enabled);
  } catch (error) {
    console.error('[SatelliteConfig] Error loading satellites.json:', error);
    return [];
  }
}

/**
 * Get satellite configurations from environment variable (legacy/fallback)
 */
function getSatellitesFromEnv(): SatelliteConfig[] {
  const satellitesEnv = process.env.NEXT_PUBLIC_SATELLITE_DOMAINS || '';

  if (!satellitesEnv.trim()) {
    return [];
  }

  // Parse comma-separated list and convert to SatelliteConfig format
  return satellitesEnv
    .split(',')
    .map(domain => domain.trim())
    .filter(domain => domain.length > 0)
    .map((domain, index) => {
      try {
        const url = new URL(domain);
        const hostname = url.hostname;

        // Extract name from hostname
        const baseName = hostname.replace(/^www\./, '').split('.')[0];
        const displayName = baseName
          .split(/[-_]/)
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        return {
          id: `env-${index}`,
          domain,
          hostname,
          displayName,
          enabled: true,
          addedDate: new Date().toISOString(),
        };
      } catch {
        // If domain doesn't have protocol, assume it's just a hostname
        const hostname = domain.replace(/^https?:\/\//, '');
        const baseName = hostname.replace(/^www\./, '').split('.')[0];
        const displayName = baseName
          .split(/[-_]/)
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        return {
          id: `env-${index}`,
          domain: `https://${hostname}`,
          hostname,
          displayName,
          enabled: true,
          addedDate: new Date().toISOString(),
        };
      }
    });
}

/**
 * Static-only satellite list: JSON file, then NEXT_PUBLIC_SATELLITE_DOMAINS.
 * Prefer `getMergedSatelliteConfigs()` in `satelliteConfigRuntime.ts` for runtime (DB + cache + this fallback).
 */
export function getSatelliteConfigsSync(): SatelliteConfig[] {
  const jsonSatellites = getSatellitesFromJson();

  if (jsonSatellites.length > 0) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[SatelliteConfig] Loaded ${jsonSatellites.length} satellites from JSON config`);
    }
    return jsonSatellites;
  }

  const envSatellites = getSatellitesFromEnv();

  if (envSatellites.length > 0) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[SatelliteConfig] Loaded ${envSatellites.length} satellites from environment variable`);
    }
    return envSatellites;
  }

  console.warn('[SatelliteConfig] No satellite domains configured');
  return [];
}

/**
 * @deprecated Prefer async getMergedSatelliteConfigs when possible. Sync JSON/env only.
 */
export function getSatelliteConfigs(): SatelliteConfig[] {
  return getSatelliteConfigsSync();
}

/**
 * Get satellite configuration by hostname
 */
/** Normalize host for matching (case-insensitive; www vs bare). */
function normalizeHostnameForMatch(hostname: string): string {
  return hostname.toLowerCase().replace(/^www\./, '');
}

function resolveSatelliteList(configs?: SatelliteConfig[]): SatelliteConfig[] {
  return configs ?? getSatelliteConfigsSync();
}

export function getSatelliteByHostname(hostname: string, configs?: SatelliteConfig[]): SatelliteConfig | null {
  const satellites = resolveSatelliteList(configs);
  const key = normalizeHostnameForMatch(hostname);
  return satellites.find(sat => normalizeHostnameForMatch(sat.hostname) === key) || null;
}

/**
 * Get satellite configuration by ID
 */
export function getSatelliteById(id: string, configs?: SatelliteConfig[]): SatelliteConfig | null {
  const satellites = resolveSatelliteList(configs);
  return satellites.find(sat => sat.id === id) || null;
}

/**
 * Get array of satellite domain URLs (with protocol)
 * Compatible with existing getSatelliteDomains() function
 */
export function getSatelliteDomains(configs?: SatelliteConfig[]): string[] {
  return resolveSatelliteList(configs).map(sat => sat.domain);
}

/**
 * Get array of satellite hostnames (without protocol)
 * Compatible with existing getSatelliteHostnames() function
 */
export function getSatelliteHostnames(configs?: SatelliteConfig[]): string[] {
  return resolveSatelliteList(configs).map(sat => sat.hostname);
}

/**
 * Extract satellite configuration from a redirect URL
 * Returns the SatelliteConfig if the URL is from a known satellite domain
 * Returns null if not a satellite domain
 */
export function extractSatelliteConfig(redirectUrl: string, configs?: SatelliteConfig[]): SatelliteConfig | null {
  if (!redirectUrl) return null;

  try {
    // Handle relative URLs
    if (!redirectUrl.startsWith('http')) {
      return null;
    }

    const url = new URL(redirectUrl);
    return getSatelliteByHostname(url.hostname, configs);
  } catch (error) {
    console.error('[SatelliteConfig] Error parsing redirect URL:', error);
    return null;
  }
}

/**
 * Check if a given URL is from a satellite domain
 */
export function isSatelliteDomain(url: string, configs?: SatelliteConfig[]): boolean {
  return extractSatelliteConfig(url, configs) !== null;
}

/**
 * Get Clerk-compatible allowedRedirectOrigins for the primary domain's ClerkProvider.
 * Returns both www and non-www variants plus localhost for dev.
 * Used by layout.tsx to dynamically allow redirects from all satellites.
 */
export function getAllowedRedirectOrigins(configs?: SatelliteConfig[]): string[] {
  const origins: string[] = [];
  for (const sat of resolveSatelliteList(configs)) {
    // Add the configured domain URL (e.g. "https://www.mosc-temp.com")
    origins.push(sat.domain);
    // Also add the non-www or www variant
    const bare = sat.hostname.replace(/^www\./, '');
    if (sat.hostname.startsWith('www.')) {
      origins.push(`https://${bare}`);
    } else {
      origins.push(`https://www.${bare}`);
    }
  }
  return origins;
}

/**
 * Check if a given hostname belongs to a known satellite domain.
 * Matches against the bare domain (e.g. "mosc-temp.com" matches "www.mosc-temp.com").
 * Used by middleware and signout-redirect to validate redirect targets.
 */
export function isKnownSatelliteHost(hostname: string, configs?: SatelliteConfig[]): boolean {
  const bare = hostname.replace(/^www\./, '');
  return resolveSatelliteList(configs).some(sat => {
    const satBare = sat.hostname.replace(/^www\./, '');
    return bare === satBare || hostname === sat.hostname;
  });
}

/**
 * Get the bare domain names (without www) for all satellites.
 * Useful for simple string-includes checks in client components.
 * e.g. ["mosc-temp.com", "mcefee-temp.com", "md-strikers.com"]
 */
export function getSatelliteBareDomains(configs?: SatelliteConfig[]): string[] {
  return resolveSatelliteList(configs).map(sat => sat.hostname.replace(/^www\./, ''));
}

/**
 * Get statistics about satellite configuration
 */
export function getSatelliteStats(configs?: SatelliteConfig[]) {
  const all = resolveSatelliteList(configs);
  return {
    total: all.length,
    enabled: all.filter(s => s.enabled).length,
    withTenantId: all.filter(s => s.tenantId).length,
  };
}
