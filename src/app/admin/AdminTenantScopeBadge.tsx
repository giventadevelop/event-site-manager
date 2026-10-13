'use client';

import React, { useEffect, useState } from 'react';
import { searchTenantOrganizationsForSelectServer } from '@/app/admin/tenant-management/organizations/organizationSelectServerActions';
import { useAdminAccess } from './AdminTenantContext';

/**
 * Shows which tenant workspace an admin list page is scoped to
 * (URL ?tenant= first, then the admin_session_tenant workspace pick).
 */
export default function AdminTenantScopeBadge({ className = '' }: { className?: string }) {
  const { tenantId, canQueryAllTenants } = useAdminAccess();
  const [organizationName, setOrganizationName] = useState<string | null>(null);

  useEffect(() => {
    setOrganizationName(null);
    if (!tenantId) return;
    let cancelled = false;
    searchTenantOrganizationsForSelectServer(tenantId)
      .then((orgs) => {
        if (cancelled) return;
        const match = orgs.find((org) => org.tenantId === tenantId);
        setOrganizationName(match?.organizationName?.trim() || null);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [tenantId]);

  if (!tenantId && !canQueryAllTenants) return null;

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-lg border-2 border-green-300 bg-green-50 px-4 py-2 text-sm text-green-800 ${className}`}
    >
      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      <span>
        Working on{' '}
        {tenantId ? (
          <>
            <span className="font-semibold">{organizationName || tenantId}</span>
            {organizationName ? <span className="font-mono text-green-700"> ({tenantId})</span> : null}
          </>
        ) : (
          <span className="font-semibold">all tenants</span>
        )}
      </span>
    </div>
  );
}
