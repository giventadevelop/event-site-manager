/**
 * Lazily loads API JWT user from environment variables, prioritizing AMPLIFY_ prefix for AWS Amplify.
 */
export function getApiJwtUser() {
  return (
    process.env.AMPLIFY_API_JWT_USER ||
    process.env.API_JWT_USER ||
    process.env.NEXT_PUBLIC_API_JWT_USER
  );
}

/**
 * Lazily loads API JWT password from environment variables, prioritizing AMPLIFY_ prefix for AWS Amplify.
 */
export function getApiJwtPass() {
  return (
    process.env.AMPLIFY_API_JWT_PASS ||
    process.env.API_JWT_PASS ||
    process.env.NEXT_PUBLIC_API_JWT_PASS
  );
}

/**
 * Lazily loads tenant ID from environment variables (NEXT_PUBLIC_TENANT_ID).
 * Throws an error if not set.
 */
export function getTenantId() {
  const tenantId = process.env.NEXT_PUBLIC_TENANT_ID;
  if (!tenantId) {
    throw new Error('NEXT_PUBLIC_TENANT_ID is not set in environment variables');
  }
  return tenantId;
}

/**
 * Get the app URL for port-agnostic configuration
 * This is used for server-side API calls to ensure the application works on any port
 * Returns the full URL including protocol (e.g., "http://localhost:3000" or "https://mcefee.org")
 *
 * IMPORTANT: This function should NOT have hardcoded fallbacks. The actual host should be
 * determined from the request context or environment variables to avoid hardcoding issues.
 */
export function getAppUrl(): string {
  // In production, use the actual domain from environment variable
  if (process.env.NODE_ENV === 'production') {
    return process.env.NEXT_PUBLIC_APP_URL || '';
  }
  // In development, use localhost with dynamic port detection
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

/**
 * Get the email host URL prefix for QR code generation
 * This is used to ensure QR codes work properly in email contexts
 * Returns the full URL including protocol (e.g., "http://localhost:3000" or "https://mcefee.org")
 *
 * IMPORTANT: This function should NOT have hardcoded fallbacks. The actual host should be
 * determined from the request context or environment variables to avoid hardcoding issues.
 */
export function getEmailHostUrlPrefix(): string {
  // In production, use the actual domain from environment variable
  if (process.env.NODE_ENV === 'production') {
    return process.env.NEXT_PUBLIC_APP_URL || '';
  }
  // In development, use localhost with dynamic port detection
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

/**
 * Satellite Domain Management
 *
 * IMPORTANT: For scalability, satellite configuration has been moved to:
 * - JSON config file: config/satellites.json (recommended for 10-100 domains)
 * - Environment variable: NEXT_PUBLIC_SATELLITE_DOMAINS (fallback for <10 domains)
 *
 * See src/lib/satelliteConfig.ts for the new implementation
 */

import {
  getSatelliteDomains as getDomainsFromConfig,
  getSatelliteHostnames as getHostnamesFromConfig,
  extractSatelliteConfig,
  isSatelliteDomain as checkIsSatellite,
} from './satelliteConfig';

/**
 * Get the list of satellite domains from environment variables or JSON config
 * Returns an array of domain URLs (with protocol)
 *
 * @deprecated Use satelliteConfig module directly for better type safety and metadata access
 */
export function getSatelliteDomains(): string[] {
  return getDomainsFromConfig();
}

/**
 * Get the list of satellite domain hostnames (without protocol)
 * Example: ["www.mosc-temp.com", "www.md-strikers.com"]
 *
 * @deprecated Use satelliteConfig module directly for better type safety and metadata access
 */
export function getSatelliteHostnames(): string[] {
  return getHostnamesFromConfig();
}

/**
 * Extract satellite domain information from a redirect URL
 * Returns the hostname if the URL is from a known satellite domain
 * Returns null if not a satellite domain
 */
export function extractSatelliteDomain(redirectUrl: string): string | null {
  const config = extractSatelliteConfig(redirectUrl);
  return config ? config.hostname : null;
}

/**
 * Get a friendly display name for a satellite domain
 * Converts hostname to a readable name
 * Example: "www.mosc-temp.com" -> "MOSC Temp"
 */
export function getSatelliteDomainName(hostname: string): string {
  if (!hostname) return 'Unknown Domain';

  // Try to get from config first (has custom display names)
  const configs = getDomainsFromConfig();
  const config = extractSatelliteConfig(`https://${hostname}`);

  if (config && config.displayName) {
    return config.displayName;
  }

  // Fallback: generate name from hostname
  const cleanHost = hostname.replace(/^www\./, '');
  const baseName = cleanHost.split('.')[0];

  return baseName
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Check if a given URL is from a satellite domain
 */
export function isSatelliteDomain(url: string): boolean {
  return checkIsSatellite(url);
}