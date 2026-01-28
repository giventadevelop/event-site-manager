'use client';

import React from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';

/**
 * In-form Tenant ID filter control for admin list/search pages.
 * Syncs with ?tenant= in the URL so useAdminTenantId() and all API calls stay in sync.
 * Combine with other filters (e.g. First Name, Status, Role) for "users with this first name in this tenant".
 */
export default function AdminTenantFilterField() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const value = searchParams.get('tenant') ?? '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.trim();
    const next = new URLSearchParams(searchParams.toString());
    if (v) {
      next.set('tenant', v);
    } else {
      next.delete('tenant');
    }
    const qs = next.toString();
    router.replace(pathname + (qs ? `?${qs}` : ''), { scroll: false });
  };

  return (
    <div className="flex flex-col min-w-0">
      <label htmlFor="admin-filter-tenant-id" className="block text-sm font-medium text-gray-700 mb-1 whitespace-nowrap">
        Tenant ID
      </label>
      <input
        id="admin-filter-tenant-id"
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Search by Tenant ID (optional)"
        className="block w-full border border-gray-400 rounded-xl focus:ring-blue-500 focus:border-blue-500 px-4 py-3 text-base min-h-[48px]"
        aria-label="Filter by Tenant ID"
        title="Filter results by tenant ID. Leave empty for all tenants."
      />
    </div>
  );
}
