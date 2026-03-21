'use client';

import React, { useCallback, useEffect, useRef, useState, startTransition } from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';

/** Wait after last keystroke before syncing ?tenant= (avoids router churn / list refetch flicker). */
const DEBOUNCE_MS = 450;

/**
 * In-form Tenant ID filter control for admin list/search pages.
 * Syncs with ?tenant= in the URL so useAdminTenantId() and all API calls stay in sync.
 *
 * Input is controlled locally; URL updates are debounced so typing does not trigger
 * a navigation + full re-fetch on every character (which caused jumpy/flickery UI).
 */
export default function AdminTenantFilterField() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const tenantFromUrl = searchParams.get('tenant') ?? '';

  const [inputValue, setInputValue] = useState(tenantFromUrl);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastCommittedRef = useRef(tenantFromUrl);

  // URL → input when the query changes without typing here (initial load, back/forward, other controls)
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setInputValue(raw);
    scheduleCommit(raw);
  };

  const handleBlur = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    commitToUrl(inputValue);
  };

  return (
    <div className="flex flex-col min-w-0">
      <label htmlFor="admin-filter-tenant-id" className="block text-sm font-medium text-gray-700 mb-1 whitespace-nowrap">
        Tenant ID
      </label>
      <input
        id="admin-filter-tenant-id"
        type="text"
        value={inputValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="Search by Tenant ID (optional)"
        className="block w-full border border-gray-400 rounded-xl focus:ring-blue-500 focus:border-blue-500 px-4 py-3 text-base min-h-[48px]"
        aria-label="Filter by Tenant ID"
        title="Filter results by tenant ID. Leave empty for all tenants."
        autoComplete="off"
        spellCheck={false}
      />
    </div>
  );
}
