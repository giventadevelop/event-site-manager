'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  loadAdminWorkspaceTenants,
  selectAdminSessionTenant,
} from '@/app/admin/adminSessionActions';
import { ADMIN_SESSION_ALL_TENANTS, type AdminWorkspaceTenant } from '@/lib/adminSessionTenant';

const CARD_COLORS = [
  { card: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-800', icon: 'bg-indigo-100', iconText: 'text-indigo-500', ring: 'ring-indigo-400' },
  { card: 'bg-teal-50 hover:bg-teal-100 text-teal-800', icon: 'bg-teal-100', iconText: 'text-teal-500', ring: 'ring-teal-400' },
  { card: 'bg-violet-50 hover:bg-violet-100 text-violet-800', icon: 'bg-violet-100', iconText: 'text-violet-500', ring: 'ring-violet-400' },
  { card: 'bg-amber-50 hover:bg-amber-100 text-amber-800', icon: 'bg-amber-100', iconText: 'text-amber-500', ring: 'ring-amber-400' },
  { card: 'bg-rose-50 hover:bg-rose-100 text-rose-800', icon: 'bg-rose-100', iconText: 'text-rose-500', ring: 'ring-rose-400' },
  { card: 'bg-cyan-50 hover:bg-cyan-100 text-cyan-800', icon: 'bg-cyan-100', iconText: 'text-cyan-500', ring: 'ring-cyan-400' },
  { card: 'bg-lime-50 hover:bg-lime-100 text-lime-800', icon: 'bg-lime-100', iconText: 'text-lime-500', ring: 'ring-lime-400' },
  { card: 'bg-fuchsia-50 hover:bg-fuchsia-100 text-fuchsia-800', icon: 'bg-fuchsia-100', iconText: 'text-fuchsia-500', ring: 'ring-fuchsia-400' },
] as const;

export default function AdminTenantWorkspacePicker({
  onSelectionChange,
}: {
  onSelectionChange?: (hasSelection: boolean) => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [tenants, setTenants] = useState<AdminWorkspaceTenant[]>([]);
  const [canQueryAllTenants, setCanQueryAllTenants] = useState(false);
  const [sessionTenantId, setSessionTenantId] = useState<string | null>(null);
  const [sessionAllTenants, setSessionAllTenants] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const didAutoSelectRef = useRef(false);
  const onSelectionChangeRef = useRef(onSelectionChange);
  onSelectionChangeRef.current = onSelectionChange;

  const hasSelection = sessionAllTenants || Boolean(sessionTenantId);

  const applyUrlTenant = useCallback(
    (tenantId: string | null) => {
      const next = new URLSearchParams(searchParams?.toString() ?? '');
      if (tenantId) {
        next.set('tenant', tenantId);
      } else {
        next.delete('tenant');
      }
      const qs = next.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
      router.refresh();
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const data = await loadAdminWorkspaceTenants();
        if (cancelled) return;
        const mapped = data.canQueryAllTenants
          ? data.tenants.filter((t) => t.mappedToUser)
          : data.tenants;
        setTenants(mapped);
        setCanQueryAllTenants(data.canQueryAllTenants);
        setSessionTenantId(data.sessionTenantId);
        setSessionAllTenants(data.sessionAllTenants);
        onSelectionChangeRef.current?.(data.sessionAllTenants || Boolean(data.sessionTenantId));

        if (!didAutoSelectRef.current && !data.sessionAllTenants && !data.sessionTenantId) {
          if (mapped.length === 1) {
            didAutoSelectRef.current = true;
            const only = mapped[0].tenantId;
            const result = await selectAdminSessionTenant(only);
            if (cancelled) return;
            if (result.ok) {
              setSessionTenantId(result.tenantId);
              setSessionAllTenants(result.allTenants);
              onSelectionChangeRef.current?.(true);
              applyUrlTenant(result.tenantId);
            }
          } else if (mapped.length === 0 && data.canQueryAllTenants) {
            didAutoSelectRef.current = true;
            const result = await selectAdminSessionTenant(ADMIN_SESSION_ALL_TENANTS);
            if (cancelled) return;
            if (result.ok) {
              setSessionTenantId(result.tenantId);
              setSessionAllTenants(result.allTenants);
              onSelectionChangeRef.current?.(true);
              applyUrlTenant(null);
            }
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load your organizations');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
    // Load once on mount — URL updates after auto-select must not re-fetch in a loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelect = async (tenantId: string) => {
    setSaving(tenantId);
    setError(null);
    try {
      const result = await selectAdminSessionTenant(tenantId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSessionTenantId(result.tenantId);
      setSessionAllTenants(result.allTenants);
      onSelectionChange?.(true);
      applyUrlTenant(result.tenantId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not select tenant');
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="mb-8 rounded-xl border-2 border-indigo-200 bg-indigo-50 px-4 py-6 text-center text-indigo-800">
        Loading the organizations mapped to your account…
      </div>
    );
  }

  return (
    <section className="mb-10" aria-labelledby="admin-workspace-heading">
      <div className="mb-4 text-center">
        <h2 id="admin-workspace-heading" className="text-lg sm:text-xl font-bold text-indigo-900">
          Choose an organization for this session
        </h2>
        <p className="mt-1 text-sm text-gray-600 max-w-2xl mx-auto">
          These are the tenant IDs mapped to your login. You can administer more than one organization;
          pick the tenant you want to work on now. You can switch at any time from this page.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {hasSelection && (
        <div className="mb-4 inline-flex w-full justify-center">
          <div className="inline-flex items-center gap-2 rounded-lg border-2 border-green-300 bg-green-50 px-4 py-2 text-sm text-green-800">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>
              Working on{' '}
              <span className="font-semibold">
                {sessionAllTenants
                  ? 'all tenants'
                  : tenants.find((t) => t.tenantId === sessionTenantId)?.organizationName ||
                    sessionTenantId}
              </span>
              {!sessionAllTenants && sessionTenantId ? (
                <span className="font-mono text-green-700"> ({sessionTenantId})</span>
              ) : null}
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {canQueryAllTenants && (
          <button
            type="button"
            onClick={() => handleSelect(ADMIN_SESSION_ALL_TENANTS)}
            disabled={saving !== null}
            className={`flex flex-col items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg shadow-md p-4 text-xs transition-all group ${
              sessionAllTenants ? 'ring-4 ring-blue-400' : ''
            }`}
            title="Work across all tenants"
            aria-label="Work across all tenants"
            aria-pressed={sessionAllTenants}
          >
            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-semibold text-center leading-tight">All tenants</span>
            <span className="mt-1 text-center opacity-80">Platform super admin</span>
          </button>
        )}

        {tenants.map((tenant, index) => {
          const colors = CARD_COLORS[index % CARD_COLORS.length];
          const selected = !sessionAllTenants && sessionTenantId === tenant.tenantId;
          return (
            <button
              key={tenant.tenantId}
              type="button"
              onClick={() => handleSelect(tenant.tenantId)}
              disabled={saving !== null}
              className={`flex flex-col items-center justify-center ${colors.card} rounded-lg shadow-md p-4 text-xs transition-all group ${
                selected ? `ring-4 ${colors.ring}` : ''
              }`}
              title={`Work on ${tenant.organizationName} (${tenant.tenantId})`}
              aria-label={`Work on ${tenant.organizationName} (${tenant.tenantId})`}
              aria-pressed={selected}
            >
              <div className={`flex-shrink-0 w-14 h-14 rounded-xl ${colors.icon} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                <svg className={`w-10 h-10 ${colors.iconText}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <span className="font-semibold text-center leading-tight">{tenant.organizationName}</span>
              <span className="mt-1 font-mono text-center break-all">{tenant.tenantId}</span>
              {tenant.domain ? (
                <span className="mt-0.5 text-center opacity-80">{tenant.domain}</span>
              ) : null}
              <span className="mt-1 font-medium">{tenant.role}</span>
              {saving === tenant.tenantId ? <span className="mt-1">Selecting…</span> : null}
            </button>
          );
        })}
      </div>

      {tenants.length === 0 && !canQueryAllTenants && (
        <div className="mt-4 rounded-lg border-2 border-orange-300 bg-orange-50 px-4 py-3 text-sm text-orange-800 text-center">
          No tenant IDs are mapped to this login. Ask a platform admin to grant you ADMIN on a tenant.
        </div>
      )}
    </section>
  );
}
