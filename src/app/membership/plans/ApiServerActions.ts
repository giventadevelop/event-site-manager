"use server";
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getAppUrl, getTenantId } from '@/lib/env';
import type { MembershipPlanDTO } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface FetchMembershipPlansFilters {
  isActive?: boolean;
  planType?: string;
  billingInterval?: string;
  sort?: string;
}

/**
 * Fetch membership plans with optional filtering
 */
export async function fetchMembershipPlansServer(
  filters: FetchMembershipPlansFilters = {}
): Promise<MembershipPlanDTO[]> {
  if (!API_BASE_URL) {
    throw new Error('API base URL not configured');
  }

  const params = new URLSearchParams();
  params.append('tenantId.equals', getTenantId());

  if (filters.isActive !== undefined) {
    params.append('isActive.equals', String(filters.isActive));
  }
  if (filters.planType) {
    params.append('planType.equals', filters.planType);
  }
  if (filters.billingInterval) {
    params.append('billingInterval.equals', filters.billingInterval);
  }
  if (filters.sort) {
    params.append('sort', filters.sort);
  }

  const url = `${getAppUrl()}/api/proxy/membership-plans?${params.toString()}`;
  const res = await fetchWithJwtRetry(url, {
    method: 'GET',
    cache: 'no-store',
  });

  if (!res.ok) {
    console.error('Failed to fetch membership plans:', res.status, await res.text());
    return [];
  }

  return res.json();
}



