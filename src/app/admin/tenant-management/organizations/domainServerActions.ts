'use server';

import { getApiBaseUrl } from '@/lib/env';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import {
  getTenantDomainFormatError,
  normalizeTenantDomain,
} from '@/lib/tenantDomainValidation';
import type { TenantOrganizationDTO } from '@/app/admin/tenant-management/types';

export interface TenantDomainAvailabilityResult {
  available: boolean;
  normalized: string;
  message?: string;
}

/** Returns whether the domain is free for create/update (case-insensitive exact match). */
export async function isTenantOrganizationDomainAvailableServer(
  rawDomain: string,
  excludeOrganizationId?: number,
): Promise<TenantDomainAvailabilityResult> {
  const formatError = getTenantDomainFormatError(rawDomain);
  const normalized = normalizeTenantDomain(rawDomain);

  if (formatError) {
    return { available: false, normalized, message: formatError };
  }

  try {
    const params = new URLSearchParams({
      'domain.equals': normalized,
      size: '1',
      page: '0',
    });

    const response = await fetchWithJwtRetry(
      `${getApiBaseUrl()}/api/tenant-organizations?${params.toString()}`,
      { cache: 'no-store' },
    );

    if (!response.ok) {
      return {
        available: false,
        normalized,
        message: 'Could not verify domain availability. Try again.',
      };
    }

    const data = await response.json();
    const matches: TenantOrganizationDTO[] = Array.isArray(data) ? data : data ? [data] : [];
    const conflict = matches.find(
      (org) => org.id !== excludeOrganizationId && org.domain?.toLowerCase() === normalized,
    );

    if (conflict) {
      return {
        available: false,
        normalized,
        message: `This domain is already registered to "${conflict.organizationName}".`,
      };
    }

    return { available: true, normalized };
  } catch (error) {
    console.error('[isTenantOrganizationDomainAvailableServer]', error);
    return {
      available: false,
      normalized,
      message: 'Could not verify domain availability. Try again.',
    };
  }
}
