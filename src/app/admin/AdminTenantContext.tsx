'use client';

import React, { createContext, useContext } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import AdminTenantFilterField from './AdminTenantFilterField';

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
 * Pages that already render `AdminTenantFilterField` in their search form.
 * Hide the layout top bar there to avoid two identical typeaheads fighting over focus / debounce.
 * (Shared field already searches organizationName + tenantId + domain — see typeahead_search_combobox.mdc.)
 */
function hasInlineTenantFilter(pathname: string | null): boolean {
  if (!pathname) return false;
  return (
    pathname.includes('/manage-usage') ||
    pathname.includes('/gallery/albums') ||
    pathname.includes('/manage-events') ||
    pathname.includes('/executive-committee') ||
    pathname.includes('/event-sponsors') ||
    pathname.includes('/event-contacts') ||
    pathname.includes('/event-featured-performers') ||
    pathname.includes('/event-program-directors') ||
    pathname.includes('/event-emails') ||
    pathname.includes('/newsletter-emails') ||
    pathname.includes('/promotion-emails') ||
    pathname.includes('/tenant-email-addresses') ||
    pathname.includes('/manual-payments') ||
    pathname.includes('/satellite-domains') ||
    pathname.includes('/tenant-management/settings')
  );
}

/**
 * Provides selected tenant from URL (?tenant=) and optional tenant selector bar.
 * When showTenantSelector (all-tenants-admin mode), renders a bar with typeahead Tenant ID filter.
 * Admin pages use useAdminTenantId() and pass it to server actions.
 */
export function AdminTenantLayoutClient({ showTenantSelector, children }: AdminTenantLayoutClientProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const showTopTenantBar = showTenantSelector && !hasInlineTenantFilter(pathname);
  const tenantFromUrl = searchParams.get('tenant') ?? '';
  const tenantId = tenantFromUrl || undefined;

  return (
    <AdminTenantContext.Provider value={tenantId}>
      {showTopTenantBar && (
        <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 border-b border-blue-200 text-sm">
          <span className="font-medium text-blue-800 whitespace-nowrap">
            Tenant ID (optional – leave empty for all):
          </span>
          <AdminTenantFilterField
            variant="compact"
            inputId="admin-tenant-id"
            className="flex-1 min-w-0 max-w-md"
          />
        </div>
      )}
      {children}
    </AdminTenantContext.Provider>
  );
}
