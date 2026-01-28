'use client';

import React, { createContext, useContext, useCallback } from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';

const AdminTenantContext = createContext<string | undefined>(undefined);

export function useAdminTenantId(): string | undefined {
  const ctx = useContext(AdminTenantContext);
  return ctx;
}

interface AdminTenantLayoutClientProps {
  showTenantSelector: boolean;
  children: React.ReactNode;
}

/**
 * Provides selected tenant from URL (?tenant=) and optional tenant selector bar.
 * When showTenantSelector (all-tenants-admin mode), renders a bar with tenant ID input.
 * Admin pages use useAdminTenantId() and pass it to server actions.
 */
export function AdminTenantLayoutClient({ showTenantSelector, children }: AdminTenantLayoutClientProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const tenantId = searchParams.get('tenant') ?? undefined;

  const setTenantId = useCallback(
    (value: string) => {
      const next = new URLSearchParams(searchParams.toString());
      if (value.trim()) {
        next.set('tenant', value.trim());
      } else {
        next.delete('tenant');
      }
      const qs = next.toString();
      router.replace(pathname + (qs ? `?${qs}` : ''), { scroll: false });
    },
    [pathname, router, searchParams]
  );

  return (
    <AdminTenantContext.Provider value={tenantId}>
      {showTenantSelector && (
        <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 border-b border-blue-200 text-sm">
          <label htmlFor="admin-tenant-id" className="font-medium text-blue-800 whitespace-nowrap">
            Tenant ID (optional – leave empty for all):
          </label>
          <input
            id="admin-tenant-id"
            type="text"
            value={tenantId ?? ''}
            onChange={(e) => setTenantId(e.target.value)}
            placeholder="e.g. tenant_demo_001"
            className="flex-1 min-w-0 max-w-xs border border-blue-300 rounded-lg px-3 py-1.5 text-blue-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-label="Filter by tenant ID"
          />
        </div>
      )}
      {children}
    </AdminTenantContext.Provider>
  );
}
