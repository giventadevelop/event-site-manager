/**
 * Satellite Domain Configuration Management
 *
 * This module provides scalable configuration management for satellite domains.
 * It supports multiple sources with fallback priority:
 * 1. JSON configuration file (recommended for 10+ domains)
 * 2. Environment variable (fallback for simple setups)
 * 3. Database (for enterprise scale - implemented separately)
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
 * Get all enabled satellite configurations
 * Priority: JSON file > Environment variable
 */
export function getSatelliteConfigs(): SatelliteConfig[] {
  // Try JSON file first
  const jsonSatellites = getSatellitesFromJson();

  if (jsonSatellites.length > 0) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[SatelliteConfig] Loaded ${jsonSatellites.length} satellites from JSON config`);
    }
    return jsonSatellites;
  }

  // Fallback to environment variable
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
 * Get satellite configuration by hostname
 */
export function getSatelliteByHostname(hostname: string): SatelliteConfig | null {
  const satellites = getSatelliteConfigs();
  return satellites.find(sat => sat.hostname === hostname) || null;
}

/**
 * Get satellite configuration by ID
 */
export function getSatelliteById(id: string): SatelliteConfig | null {
  const satellites = getSatelliteConfigs();
  return satellites.find(sat => sat.id === id) || null;
}

/**
 * Get array of satellite domain URLs (with protocol)
 * Compatible with existing getSatelliteDomains() function
 */
export function getSatelliteDomains(): string[] {
  return getSatelliteConfigs().map(sat => sat.domain);
}

/**
 * Get array of satellite hostnames (without protocol)
 * Compatible with existing getSatelliteHostnames() function
 */
export function getSatelliteHostnames(): string[] {
  return getSatelliteConfigs().map(sat => sat.hostname);
}

/**
 * Extract satellite configuration from a redirect URL
 * Returns the SatelliteConfig if the URL is from a known satellite domain
 * Returns null if not a satellite domain
 */
export function extractSatelliteConfig(redirectUrl: string): SatelliteConfig | null {
  if (!redirectUrl) return null;

  try {
    // Handle relative URLs
    if (!redirectUrl.startsWith('http')) {
      return null;
    }

    const url = new URL(redirectUrl);
    return getSatelliteByHostname(url.hostname);
  } catch (error) {
    console.error('[SatelliteConfig] Error parsing redirect URL:', error);
    return null;
  }
}

/**
 * Check if a given URL is from a satellite domain
 */
export function isSatelliteDomain(url: string): boolean {
  return extractSatelliteConfig(url) !== null;
}

/**
 * Get statistics about satellite configuration
 */
export function getSatelliteStats() {
  const all = getSatelliteConfigs();
  return {
    total: all.length,
    enabled: all.filter(s => s.enabled).length,
    withTenantId: all.filter(s => s.tenantId).length,
  };
}
