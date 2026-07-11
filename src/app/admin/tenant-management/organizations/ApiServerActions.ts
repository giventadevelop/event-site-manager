import { appendTenantIfPresent, effectiveTenantId, getApiBaseUrl } from '@/lib/env';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { withTenantId } from '@/lib/withTenantId';
import { normalizeTenantDomain } from '@/lib/tenantDomainValidation';
import { normalizeWebsiteUrl } from '@/lib/websiteUrlValidation';
import type {
  TenantOrganizationDTO,
  TenantOrganizationFormDTO,
  TenantOrganizationFilters,
  PaginationParams,
  PaginatedResponse
} from '@/app/admin/tenant-management/types';

const API_BASE_URL = getApiBaseUrl();

const OPTIONAL_STRING_FIELDS = [
  'logoUrl',
  'contactPhone',
  'stripeCustomerId',
  'subscriptionPlan',
  'subscriptionStatus',
  'subscriptionStartDate',
  'subscriptionEndDate',
  'description',
  'addressLine1',
  'addressLine2',
  'city',
  'stateProvince',
  'zipCode',
  'country',
  'websiteUrl',
] as const;

/** Empty optional strings → null; domain is required and normalized (never null). */
function normalizeTenantOrganizationPayload<T extends Partial<TenantOrganizationFormDTO>>(data: T): T {
  const normalized = { ...data };
  for (const field of OPTIONAL_STRING_FIELDS) {
    const value = normalized[field];
    if (typeof value === 'string') {
      const trimmed = value.trim();
      (normalized as Record<string, unknown>)[field] = trimmed === '' ? null : trimmed;
    }
  }
  if (typeof normalized.domain === 'string') {
    normalized.domain = normalizeTenantDomain(normalized.domain);
  }
  if (typeof normalized.websiteUrl === 'string') {
    const trimmed = normalized.websiteUrl.trim();
    normalized.websiteUrl = trimmed === '' ? null : normalizeWebsiteUrl(trimmed);
  }
  return normalized;
}

function parseTenantOrganizationApiError(errorText: string, action: 'create' | 'update'): string {
  const lower = errorText.toLowerCase();
  if (lower.includes('tenant_organization_domain_key') || (lower.includes('duplicate key') && lower.includes('domain'))) {
    return 'An organization with this domain already exists. Use a different domain or leave Domain empty.';
  }
  if (lower.includes('duplicate key')) {
    return 'A record with these values already exists. Check tenant ID and domain for duplicates.';
  }
  try {
    const parsed = JSON.parse(errorText) as { detail?: string; title?: string };
    if (parsed.detail) return parsed.detail;
    if (parsed.title) return parsed.title;
  } catch {
    // not JSON
  }
  return action === 'create' ? 'Failed to create tenant organization' : 'Failed to update tenant organization';
}

/**
 * Fetch paginated list of tenant organizations
 */
export async function fetchTenantOrganizations(
  pagination: PaginationParams,
  filters: TenantOrganizationFilters = {}
): Promise<PaginatedResponse<TenantOrganizationDTO>> {
  try {
    const params = new URLSearchParams();

    // Add pagination parameters
    params.append('page', pagination.page.toString());
    params.append('size', pagination.pageSize.toString());

    // Add filters
    if (filters.search) {
      params.append('organizationName.contains', filters.search);
    }
    // Partial tenant ID match for typeahead (distinct from tenantId.equals scoping)
    if (filters.tenantIdContains?.trim()) {
      params.append('tenantId.contains', filters.tenantIdContains.trim());
    }
    appendTenantIfPresent(params, effectiveTenantId(filters.tenantId));
    if (filters.subscriptionStatus) {
      params.append('subscriptionStatus.equals', filters.subscriptionStatus);
    }
    if (filters.isActive !== undefined) {
      params.append('isActive.equals', filters.isActive.toString());
    }

    // Add sorting
    if (filters.sortBy) {
      const sortDirection = filters.sortOrder || 'asc';
      params.append('sort', `${filters.sortBy},${sortDirection}`);
    }

    const response = await fetchWithJwtRetry(
      `${API_BASE_URL}/api/tenant-organizations?${params.toString()}`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      console.error('[fetchTenantOrganizations] Backend error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorBody.slice(0, 2000),
      });
      throw new Error(
        `Failed to fetch tenant organizations: ${response.statusText}${errorBody ? ` — ${errorBody.slice(0, 500)}` : ''}`,
      );
    }

    const data = await response.json();
    const totalCount = parseInt(response.headers.get('x-total-count') || '0');

    return {
      data: Array.isArray(data) ? data : [],
      totalCount,
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalPages: Math.ceil(totalCount / pagination.pageSize)
    };
  } catch (error) {
    console.error('Error fetching tenant organizations:', error);
    throw new Error('Failed to fetch tenant organizations');
  }
}

/**
 * Fetch a single tenant organization by ID
 */
export async function fetchTenantOrganization(id: number): Promise<TenantOrganizationDTO | null> {
  try {
    const response = await fetchWithJwtRetry(
      `${API_BASE_URL}/api/tenant-organizations/${id}`,
      { cache: 'no-store' }
    );

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch tenant organization: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching tenant organization:', error);
    throw new Error('Failed to fetch tenant organization');
  }
}

/**
 * Create a new tenant organization
 */
export async function createTenantOrganization(data: TenantOrganizationFormDTO): Promise<TenantOrganizationDTO> {
  try {
    const payload = withTenantId({
      ...normalizeTenantOrganizationPayload(data),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const response = await fetchWithJwtRetry(`${API_BASE_URL}/api/tenant-organizations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(parseTenantOrganizationApiError(errorText, 'create'));
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating tenant organization:', error);
    if (error instanceof Error && error.message !== 'Failed to create tenant organization') {
      throw error;
    }
    throw new Error('Failed to create tenant organization');
  }
}

/**
 * Update an existing tenant organization
 */
export async function updateTenantOrganization(
  id: number,
  data: Partial<TenantOrganizationFormDTO>
): Promise<TenantOrganizationDTO> {
  try {
    // First fetch the existing tenant organization to get the original createdAt
    const existingOrganization = await fetchTenantOrganization(id);

    const payload = withTenantId({
      ...normalizeTenantOrganizationPayload(data),
      id,
      createdAt: existingOrganization.createdAt, // Preserve original createdAt
      updatedAt: new Date().toISOString(),
    });

    const response = await fetchWithJwtRetry(`${API_BASE_URL}/api/tenant-organizations/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(parseTenantOrganizationApiError(errorText, 'update'));
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating tenant organization:', error);
    if (error instanceof Error && error.message !== 'Failed to update tenant organization') {
      throw error;
    }
    throw new Error('Failed to update tenant organization');
  }
}

/**
 * Partially update an existing tenant organization
 */
export async function patchTenantOrganization(
  id: number,
  data: Partial<TenantOrganizationFormDTO>
): Promise<TenantOrganizationDTO> {
  try {
    const payload = withTenantId({
      ...normalizeTenantOrganizationPayload(data),
      id,
      updatedAt: new Date().toISOString(),
    });

    const response = await fetchWithJwtRetry(`${API_BASE_URL}/api/tenant-organizations/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/merge-patch+json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(parseTenantOrganizationApiError(errorText, 'update'));
    }

    return await response.json();
  } catch (error) {
    console.error('Error patching tenant organization:', error);
    if (error instanceof Error && error.message !== 'Failed to update tenant organization') {
      throw error;
    }
    throw new Error('Failed to update tenant organization');
  }
}

/**
 * Delete a tenant organization
 */
export async function deleteTenantOrganization(id: number): Promise<void> {
  try {
    const response = await fetchWithJwtRetry(`${API_BASE_URL}/api/tenant-organizations/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete tenant organization: ${errorText}`);
    }
  } catch (error) {
    console.error('Error deleting tenant organization:', error);
    throw new Error('Failed to delete tenant organization');
  }
}

/**
 * Toggle the active status of a tenant organization
 */
export async function toggleTenantOrganizationStatus(id: number, isActive: boolean): Promise<TenantOrganizationDTO> {
  try {
    const payload = withTenantId({
      id,
      isActive,
      updatedAt: new Date().toISOString(),
    });

    const response = await fetchWithJwtRetry(`${API_BASE_URL}/api/tenant-organizations/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/merge-patch+json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to toggle tenant organization status: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error toggling tenant organization status:', error);
    throw new Error('Failed to toggle tenant organization status');
  }
}


/**
 * List tenant organizations whose site type is one of the given archetypes
 * (e.g. ['GAS_STATION'] or ['PERSONAL_PROFILE', 'HYBRID']).
 * Used by module dashboards to offer a tenant picker for their category.
 */
export async function fetchTenantOrganizationsBySiteTypes(
  siteTypes: string[]
): Promise<TenantOrganizationDTO[]> {
  try {
    const params = new URLSearchParams({
      sort: 'organizationName,asc',
      size: '200',
    });
    for (const siteType of siteTypes) {
      params.append('siteType.in', siteType);
    }

    const response = await fetchWithJwtRetry(
      `${API_BASE_URL}/api/tenant-organizations?${params.toString()}`,
      { cache: 'no-store' }
    );
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching tenant organizations by site type:', error);
    return [];
  }
}
