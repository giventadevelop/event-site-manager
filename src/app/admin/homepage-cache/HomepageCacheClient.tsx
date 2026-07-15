'use client';

import { useState, useEffect, useCallback } from 'react';
import type { TenantSettingsDTO } from '@/app/admin/tenant-management/types';
import AdminTenantFilterField from '../AdminTenantFilterField';
import { useAdminTenantId } from '../AdminTenantContext';
import {
  fetchHomepageCacheSettingsPage,
  refreshHomepageCacheServer,
  type HomepageCacheListFilters,
} from './ApiServerActions';
import {
  HOMEPAGE_CACHE_INVALIDATE_CHANNEL,
  clearHomepageCaches,
} from '@/lib/homepageCacheKeys';

interface HomepageCacheClientProps {
  initialSettings: TenantSettingsDTO[];
  initialTotalCount: number;
  initialPageSize: number;
}

export default function HomepageCacheClient({
  initialSettings,
  initialTotalCount,
  initialPageSize,
}: HomepageCacheClientProps) {
  const tenantId = useAdminTenantId();
  const [settings, setSettings] = useState(initialSettings);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [pageSize] = useState(initialPageSize);
  const [page, setPage] = useState(0);
  const [listLoading, setListLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [sort, setSort] = useState('tenantId,asc');

  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadListAt = useCallback(
    async (targetPage: number) => {
      setListLoading(true);
      try {
        const filters: HomepageCacheListFilters = {
          tenantId,
          sort: sort.trim() || 'tenantId,asc',
        };
        const q = searchQuery.trim();
        if (q && /^\d+$/.test(q)) filters.id = q;

        const { settings: rows, totalCount: tc } = await fetchHomepageCacheSettingsPage(
          targetPage,
          pageSize,
          filters
        );
        setSettings(rows);
        setTotalCount(tc);
      } catch (e) {
        console.error('[HomepageCacheClient] loadListAt failed:', e);
      } finally {
        setListLoading(false);
      }
    },
    [tenantId, searchQuery, sort, pageSize]
  );

  useEffect(() => {
    void loadListAt(page);
  }, [page, loadListAt]);

  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const isPrevDisabled = page === 0 || listLoading;
  const isNextDisabled = page >= totalPages - 1 || listLoading;
  const startItem = totalCount > 0 ? page * pageSize + 1 : 0;
  const endItem =
    totalCount > 0 ? page * pageSize + Math.min(pageSize, totalCount - page * pageSize) : 0;

  const handleApplySearch = () => {
    if (page === 0) void loadListAt(0);
    else setPage(0);
  };

  const handleRefresh = async (row: TenantSettingsDTO) => {
    const id = row.id;
    if (id == null) return;
    setLoadingId(id);
    setMessage(null);
    try {
      const result = await refreshHomepageCacheServer(id);
      setMessage({
        type: 'success',
        text: `Cache refreshed for ${row.tenantId}. New version: ${result.version}`,
      });
      setSettings((prev) =>
        prev.map((s) => (s.id === id ? { ...s, homepageCacheVersion: result.version } : s))
      );
      clearHomepageCaches();
      if (typeof BroadcastChannel !== 'undefined') {
        try {
          new BroadcastChannel(HOMEPAGE_CACHE_INVALIDATE_CHANNEL).postMessage('invalidate');
        } catch {
          /* ignore */
        }
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to refresh cache',
      });
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="text-lg font-semibold text-blue-800 mb-4">Search cache records</div>
          <div className="flex flex-wrap gap-4 items-end">
            <AdminTenantFilterField />
            <div>
              <label className="block text-xs font-semibold mb-1">Settings ID</label>
              <input
                type="number"
                className="border px-3 py-2 rounded w-48 min-w-[12rem]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleApplySearch();
                }}
                placeholder="Exact numeric id"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Sort</label>
              <select
                className="border px-3 py-2 rounded w-48"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="tenantId,asc">Tenant ID (A–Z)</option>
                <option value="tenantId,desc">Tenant ID (Z–A)</option>
                <option value="updatedAt,desc">Updated (newest)</option>
                <option value="id,asc">Settings ID</option>
              </select>
            </div>
            <button
              type="button"
              onClick={handleApplySearch}
              disabled={listLoading}
              className="h-10 px-4 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold border-2 border-blue-400 disabled:opacity-50"
            >
              {listLoading ? 'Loading…' : 'Apply'}
            </button>
          </div>
          <p className="mt-3 text-xs text-gray-500">
            Use Tenant ID typeahead to filter by organization / tenantId / domain. Leave empty for
            default JWT tenant context (no tenantId.equals on the list request).
          </p>
        </div>
      </div>

      {message && (
        <div
          className={`rounded-lg border p-4 ${
            message.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex flex-wrap justify-between items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Cache records ({totalCount})
          {listLoading && <span className="ml-2 text-sm text-gray-500 font-normal">Refreshing…</span>}
        </h2>
        <button
          type="button"
          onClick={() => {
            setMessage(null);
            if (page === 0) void loadListAt(0);
            else setPage(0);
          }}
          disabled={listLoading}
          className="flex-shrink-0 h-14 rounded-xl bg-amber-100 hover:bg-amber-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6 disabled:opacity-50"
          title="Reload data from database"
          aria-label="Reload data from database"
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-amber-200 flex items-center justify-center">
            {listLoading ? (
              <svg className="animate-spin w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            )}
          </div>
          <span className="font-semibold text-amber-700">
            {listLoading ? 'Reloading…' : 'Reload from database'}
          </span>
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
            <tr>
              <th className="px-4 py-3 text-left">Settings ID</th>
              <th className="px-4 py-3 text-left">Tenant ID</th>
              <th className="px-4 py-3 text-left">Cache version</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {settings.map((row) => (
              <tr key={row.id ?? row.tenantId}>
                <td className="px-4 py-3 font-mono text-xs">{row.id ?? '—'}</td>
                <td className="px-4 py-3 font-mono text-xs">{row.tenantId}</td>
                <td className="px-4 py-3">
                  {typeof row.homepageCacheVersion === 'number' ? row.homepageCacheVersion : '0'}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => handleRefresh(row)}
                    disabled={loadingId !== null}
                    className="inline-flex h-10 px-4 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold text-sm items-center justify-center gap-2 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    title="Refresh cache records for this tenant"
                    aria-label="Refresh cache records for this tenant"
                  >
                    {loadingId === row.id ? (
                      <>
                        <svg className="animate-spin w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        <span>Refreshing…</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                        <span>Refresh cache records</span>
                      </>
                    )}
                  </button>
                </td>
              </tr>
            ))}
            {settings.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  {listLoading
                    ? 'Loading…'
                    : 'No tenant settings found. Create tenant settings first or adjust Tenant ID filter.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-8">
        <div className="flex justify-between items-center">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={isPrevDisabled}
            className="px-5 py-2.5 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-lg shadow-sm border-2 border-blue-400 hover:border-blue-500 disabled:bg-blue-100 disabled:border-blue-300 disabled:text-blue-500 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-md"
            title="Previous Page"
            aria-label="Previous Page"
            type="button"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Previous</span>
          </button>

          <div className="px-4 py-2 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-sm">
            <span className="text-sm font-bold text-blue-700">
              Page <span className="text-blue-600">{page + 1}</span> of{' '}
              <span className="text-blue-600">{totalPages}</span>
            </span>
          </div>

          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={isNextDisabled}
            className="px-5 py-2.5 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-lg shadow-sm border-2 border-blue-400 hover:border-blue-500 disabled:bg-blue-100 disabled:border-blue-300 disabled:text-blue-500 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-md"
            title="Next Page"
            aria-label="Next Page"
            type="button"
          >
            <span>Next</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <div className="text-center mt-3">
          {totalCount > 0 ? (
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-sm">
              <span className="text-sm text-gray-700">
                Showing <span className="font-bold text-blue-600">{startItem}</span> to{' '}
                <span className="font-bold text-blue-600">{endItem}</span> of{' '}
                <span className="font-bold text-blue-600">{totalCount}</span> records
              </span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border-2 border-orange-300 rounded-lg shadow-sm">
              <span className="text-sm font-medium text-orange-700">No cache records found</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
