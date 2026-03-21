'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState, startTransition } from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';

const AdminTenantContext = createContext<string | undefined>(undefined);

export function useAdminTenantId(): string | undefined {
  const ctx = useContext(AdminTenantContext);
  return ctx;
}

const DEBOUNCE_MS = 450;

interface AdminTenantLayoutClientProps {
  showTenantSelector: boolean;
  children: React.ReactNode;
}

/**
 * Provides selected tenant from URL (?tenant=) and optional tenant selector bar.
 * When showTenantSelector (all-tenants-admin mode), renders a bar with tenant ID input.
 * Admin pages use useAdminTenantId() and pass it to server actions.
 *
 * The top bar input uses local state + debounced URL updates (same as AdminTenantFilterField)
 * so typing does not call router.replace on every keystroke (avoids list flicker / layout jump).
 */
export function AdminTenantLayoutClient({ showTenantSelector, children }: AdminTenantLayoutClientProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  /** Manage Usage has its own `AdminTenantFilterField`; hide duplicate top bar to avoid two out-of-sync inputs during debounce. */
  const showTopTenantBar = showTenantSelector && !pathname?.includes('/manage-usage');
  const router = useRouter();
  const tenantFromUrl = searchParams.get('tenant') ?? '';

  const [inputValue, setInputValue] = useState(tenantFromUrl);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastCommittedRef = useRef(tenantFromUrl);

  const tenantId = tenantFromUrl || undefined;

  useEffect(() => {
    if (tenantFromUrl === lastCommittedRef.current) return;
    lastCommittedRef.current = tenantFromUrl;
    setInputValue(tenantFromUrl);
  }, [tenantFromUrl]);

  const commitToUrl = useCallback(
    (raw: string) => {
      const v = raw.trim();
      if (v === (searchParams.get('tenant') ?? '').trim()) {
        lastCommittedRef.current = v;
        return;
      }
      const next = new URLSearchParams(searchParams.toString());
      if (v) {
        next.set('tenant', v);
      } else {
        next.delete('tenant');
      }
      const qs = next.toString();
      const url = pathname + (qs ? `?${qs}` : '');
      lastCommittedRef.current = v;
      startTransition(() => {
        router.replace(url, { scroll: false });
      });
    },
    [pathname, router, searchParams]
  );

  const scheduleCommit = useCallback(
    (raw: string) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        debounceTimerRef.current = null;
        commitToUrl(raw);
      }, DEBOUNCE_MS);
    },
    [commitToUrl]
  );

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const setTenantId = useCallback(
    (value: string) => {
      setInputValue(value);
      scheduleCommit(value);
    },
    [scheduleCommit]
  );

  const handleBlur = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    commitToUrl(inputValue);
  }, [commitToUrl, inputValue]);

  return (
    <AdminTenantContext.Provider value={tenantId}>
      {showTopTenantBar && (
        <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 border-b border-blue-200 text-sm">
          <label htmlFor="admin-tenant-id" className="font-medium text-blue-800 whitespace-nowrap">
            Tenant ID (optional – leave empty for all):
          </label>
          <input
            id="admin-tenant-id"
            type="text"
            value={inputValue}
            onChange={(e) => setTenantId(e.target.value)}
            onBlur={handleBlur}
            placeholder="e.g. tenant_demo_001"
            className="flex-1 min-w-0 max-w-xs border border-blue-300 rounded-lg px-3 py-1.5 text-blue-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-label="Filter by tenant ID"
            autoComplete="off"
            spellCheck={false}
          />
        </div>
      )}
      {children}
    </AdminTenantContext.Provider>
  );
}
