/**
 * DATABASE-BACKED SATELLITE CONFIGURATION
 *
 * For enterprise scale (100+ satellites) - stores configuration in database
 * Allows runtime updates without redeployment
 *
 * Setup Instructions:
 * 1. Create satellites table in your database
 * 2. Configure database connection
 * 3. Import this module instead of satelliteConfig.ts
 */

import { SatelliteConfig } from './satelliteConfig';

// Example Prisma schema (add to schema.prisma):
/*
model Satellite {
  id          String   @id @default(cuid())
  domain      String   @unique
  hostname    String   @unique
  displayName String
  tenantId    String?
  enabled     Boolean  @default(true)
  addedDate   DateTime @default(now())
  metadata    Json?    // Additional metadata
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([enabled])
  @@index([hostname])
}
*/

// Cache for performance (5 minutes)
let satelliteCache: SatelliteConfig[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get satellite configurations from database
 * With built-in caching for performance
 */
export async function getSatelliteConfigsFromDB(): Promise<SatelliteConfig[]> {
  const now = Date.now();

  // Return cached data if still valid
  if (satelliteCache && now - cacheTimestamp < CACHE_TTL) {
    return satelliteCache;
  }

  try {
    // TODO: Replace with your actual database client (Prisma, Drizzle, etc.)
    // Example with Prisma:
    /*
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const satellites = await prisma.satellite.findMany({
      where: { enabled: true },
      orderBy: { displayName: 'asc' },
    });

    satelliteCache = satellites.map(sat => ({
      id: sat.id,
      domain: sat.domain,
      hostname: sat.hostname,
      displayName: sat.displayName,
      tenantId: sat.tenantId || undefined,
      enabled: sat.enabled,
      addedDate: sat.addedDate.toISOString(),
    }));
    */

    // Placeholder: Return empty array until database is configured
    console.warn('[SatelliteConfigDB] Database not configured. Using fallback.');
    satelliteCache = [];

    cacheTimestamp = now;
    return satelliteCache;
  } catch (error) {
    console.error('[SatelliteConfigDB] Error fetching satellites from database:', error);

    // Return stale cache on error (graceful degradation)
    return satelliteCache || [];
  }
}

/**
 * Add a new satellite domain (runtime configuration)
 */
export async function addSatelliteDomain(config: Omit<SatelliteConfig, 'id' | 'addedDate'>): Promise<SatelliteConfig> {
  try {
    // TODO: Replace with your actual database client
    /*
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const satellite = await prisma.satellite.create({
      data: {
        domain: config.domain,
        hostname: config.hostname,
        displayName: config.displayName,
        tenantId: config.tenantId,
        enabled: config.enabled,
      },
    });

    // Invalidate cache
    satelliteCache = null;

    return {
      id: satellite.id,
      domain: satellite.domain,
      hostname: satellite.hostname,
      displayName: satellite.displayName,
      tenantId: satellite.tenantId || undefined,
      enabled: satellite.enabled,
      addedDate: satellite.addedDate.toISOString(),
    };
    */

    throw new Error('Database not configured');
  } catch (error) {
    console.error('[SatelliteConfigDB] Error adding satellite:', error);
    throw error;
  }
}

/**
 * Update an existing satellite domain
 */
export async function updateSatelliteDomain(
  id: string,
  updates: Partial<Omit<SatelliteConfig, 'id' | 'addedDate'>>
): Promise<SatelliteConfig> {
  try {
    // TODO: Replace with your actual database client
    /*
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const satellite = await prisma.satellite.update({
      where: { id },
      data: updates,
    });

    // Invalidate cache
    satelliteCache = null;

    return {
      id: satellite.id,
      domain: satellite.domain,
      hostname: satellite.hostname,
      displayName: satellite.displayName,
      tenantId: satellite.tenantId || undefined,
      enabled: satellite.enabled,
      addedDate: satellite.addedDate.toISOString(),
    };
    */

    throw new Error('Database not configured');
  } catch (error) {
    console.error('[SatelliteConfigDB] Error updating satellite:', error);
    throw error;
  }
}

/**
 * Disable a satellite domain (soft delete)
 */
export async function disableSatelliteDomain(id: string): Promise<void> {
  await updateSatelliteDomain(id, { enabled: false });
}

/**
 * Clear cache (force refresh on next request)
 */
export function clearSatelliteCache(): void {
  satelliteCache = null;
  cacheTimestamp = 0;
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    cached: !!satelliteCache,
    count: satelliteCache?.length || 0,
    age: satelliteCache ? Date.now() - cacheTimestamp : 0,
    ttl: CACHE_TTL,
  };
}
