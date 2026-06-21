'use server';

import {
  buildTenantId,
  formatTenantIdSequence,
  getNextTenantIdSequence,
  isValidTenantIdPrefix,
  normalizeTenantIdPrefix,
} from '@/lib/tenantIdGeneration';
import { fetchTenantOrganizations } from '@/app/admin/tenant-management/organizations/ApiServerActions';

export interface NextTenantIdPreview {
  prefix: string;
  sequenceNumber: number;
  formattedSequence: string;
  tenantId: string;
}

async function fetchAllTenantOrganizationIds(): Promise<string[]> {
  const tenantIds: string[] = [];
  let page = 0;
  const pageSize = 200;

  try {
    while (true) {
      const result = await fetchTenantOrganizations({ page, pageSize }, { sortBy: 'createdAt', sortOrder: 'asc' });
      for (const org of result.data) {
        if (org.tenantId?.trim()) {
          tenantIds.push(org.tenantId.trim());
        }
      }
      if (result.data.length < pageSize || page + 1 >= result.totalPages) {
        break;
      }
      page += 1;
    }
  } catch (error) {
    console.error(
      '[tenantIdServerActions] Could not load existing tenant IDs from the API. ' +
        'Tenant ID preview will assume no prior organizations (sequence starts at 1). ' +
        'If the backend returns 500, apply Liquibase migrations 20260620120000 / 20260620120001 and restart the API.',
      error,
    );
  }

  return tenantIds;
}

/** Returns the next global sequence number based on existing tenant_organization.tenant_id values. */
export async function getNextTenantSequenceNumberServer(): Promise<number> {
  const existingIds = await fetchAllTenantOrganizationIds();
  return getNextTenantIdSequence(existingIds);
}

/** Builds `{prefix}_{paddedSequence}` using the next available global sequence. */
export async function previewNextTenantIdServer(rawPrefix: string): Promise<NextTenantIdPreview | null> {
  const prefix = normalizeTenantIdPrefix(rawPrefix);
  if (!isValidTenantIdPrefix(prefix)) {
    return null;
  }

  const existingIds = await fetchAllTenantOrganizationIds();
  const sequenceNumber = getNextTenantIdSequence(existingIds);
  const formattedSequence = formatTenantIdSequence(sequenceNumber);
  const tenantId = buildTenantId(prefix, sequenceNumber);

  return {
    prefix,
    sequenceNumber,
    formattedSequence,
    tenantId,
  };
}
