'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import AdminNavigation from '@/components/AdminNavigation';
import { useAdminTenantId } from '../../AdminTenantContext';
import type { GasStationLocationDTO, GasStationDailyMetricsDTO } from '@/types/gasStation';
import {
  fetchGasStationLocationsServer,
  fetchGasStationMetricsRangeServer,
} from '../ApiServerActions';

interface StationAggregate {
  stationId: number;
  stationLabel: string;
  region: string;
  days: number;
  expectedProfit: number;
  actualProfit: number;
  fuelGallons: number;
  fuelMarginAvg: number | null;
  inStoreSales: number;
  laborCost: number;
  wasteCost: number;
}

type SortKey = keyof Pick<
  StationAggregate,
  'expectedProfit' | 'actualProfit' | 'fuelGallons' | 'fuelMarginAvg' | 'inStoreSales' | 'laborCost' | 'wasteCost'
>;

function isoDaysAgo(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function formatUsd(value: number | null): string {
  if (value == null) return '—';
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

export default function GasStationComparePage() {
  const tenantId = useAdminTenantId();
  const [fromDate, setFromDate] = useState(() => isoDaysAgo(6));
  const [toDate, setToDate] = useState(() => isoDaysAgo(0));
  const [stations, setStations] = useState<GasStationLocationDTO[]>([]);
  const [metrics, setMetrics] = useState<GasStationDailyMetricsDTO[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>('actualProfit');
  const [sortDesc, setSortDesc] = useState(true);
  const [loading, setLoading] = useState(false);

  const tenantQuery = tenantId ? `?tenant=${encodeURIComponent(tenantId)}` : '';

  useEffect(() => {
    if (!tenantId) {
      setStations([]);
      setMetrics([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    Promise.all([
      fetchGasStationLocationsServer(tenantId),
      fetchGasStationMetricsRangeServer(fromDate, toDate, tenantId),
    ]).then(([s, m]) => {
      if (!cancelled) {
        setStations(s);
        setMetrics(m);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [tenantId, fromDate, toDate]);

  const aggregates = useMemo<StationAggregate[]>(() => {
    const byStation = new Map<number, GasStationDailyMetricsDTO[]>();
    for (const m of metrics) {
      const list = byStation.get(m.stationId) ?? [];
      list.push(m);
      byStation.set(m.stationId, list);
    }
    const rows: StationAggregate[] = [];
    for (const station of stations) {
      if (station.id == null) continue;
      const list = byStation.get(station.id) ?? [];
      const sum = (pick: (m: GasStationDailyMetricsDTO) => number | undefined) =>
        list.reduce((acc, m) => acc + (pick(m) ?? 0), 0);
      const margins = list
        .map((m) => m.fuelMarginCentsPerGallon)
        .filter((v): v is number => v != null);
      rows.push({
        stationId: station.id,
        stationLabel: `${station.stationCode} — ${station.stationName}`,
        region: station.region ?? '—',
        days: list.length,
        expectedProfit: sum((m) => m.expectedProfitUsd),
        actualProfit: sum((m) => m.actualProfitUsd),
        fuelGallons: sum((m) => m.fuelGallonsSold),
        fuelMarginAvg: margins.length ? margins.reduce((a, b) => a + b, 0) / margins.length : null,
        inStoreSales: sum((m) => m.inStoreSalesUsd),
        laborCost: sum((m) => m.laborCostUsd),
        wasteCost: sum((m) => (m.wasteCostUsd ?? 0) + (m.shrinkCostUsd ?? 0)),
      });
    }
    rows.sort((a, b) => {
      const av = a[sortKey] ?? -Infinity;
      const bv = b[sortKey] ?? -Infinity;
      return sortDesc ? Number(bv) - Number(av) : Number(av) - Number(bv);
    });
    return rows;
  }, [metrics, stations, sortKey, sortDesc]);

  const headerButton = (key: SortKey, label: string) => (
    <button
      type="button"
      onClick={() => {
        if (sortKey === key) setSortDesc((d) => !d);
        else {
          setSortKey(key);
          setSortDesc(true);
        }
      }}
      className={`text-xs font-medium uppercase tracking-wider ${
        sortKey === key ? 'text-blue-700' : 'text-gray-500'
      } hover:text-blue-800`}
    >
      {label}
      {sortKey === key ? (sortDesc ? ' ↓' : ' ↑') : ''}
    </button>
  );

  return (
    <div className="w-full overflow-x-hidden box-border" style={{ paddingTop: '120px' }}>
      <div className="w-full px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 mb-6 sm:mb-8">
        <AdminNavigation />
      </div>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-8 space-y-6">
        <nav className="flex" aria-label="Breadcrumb">
          <Link
            href={`/admin/gas-station${tenantQuery}`}
            className="text-sm font-medium text-gray-700 hover:text-blue-600"
          >
            ← Gas Station COO
          </Link>
        </nav>

        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            Station Comparison
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Rank one tenant&apos;s stores over a date range across profit, fuel, labor, and waste
          </p>
        </div>

        {!tenantId && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-sm text-amber-800">
            Comparison is tenant-specific. Enter a <strong>Tenant ID</strong> in the blue bar at the
            top of the admin area to rank that tenant&apos;s stations.
          </div>
        )}

        {tenantId && (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex flex-wrap items-end gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  From
                </label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="border border-gray-400 rounded-xl px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  To
                </label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="border border-gray-400 rounded-xl px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              {loading && <span className="text-sm text-gray-500 pb-2">Loading…</span>}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Station
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Region
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Days
                    </th>
                    <th className="px-4 py-3 text-left">{headerButton('actualProfit', 'Actual Profit')}</th>
                    <th className="px-4 py-3 text-left">{headerButton('expectedProfit', 'Expected Profit')}</th>
                    <th className="px-4 py-3 text-left">{headerButton('fuelGallons', 'Gallons')}</th>
                    <th className="px-4 py-3 text-left">{headerButton('fuelMarginAvg', 'Margin ¢/gal')}</th>
                    <th className="px-4 py-3 text-left">{headerButton('inStoreSales', 'In-store Sales')}</th>
                    <th className="px-4 py-3 text-left">{headerButton('laborCost', 'Labor')}</th>
                    <th className="px-4 py-3 text-left">{headerButton('wasteCost', 'Waste + Shrink')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {aggregates.length === 0 && (
                    <tr>
                      <td colSpan={10} className="px-4 py-6 text-sm text-gray-500 text-center">
                        {loading ? 'Loading…' : `No stations for tenant ${tenantId}.`}
                      </td>
                    </tr>
                  )}
                  {aggregates.map((row, index) => (
                    <tr
                      key={row.stationId}
                      className={index === 0 && row.days > 0 ? 'bg-emerald-50/50' : ''}
                    >
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                        {row.stationLabel}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{row.region}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{row.days}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">
                        {row.days ? formatUsd(row.actualProfit) : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {row.days ? formatUsd(row.expectedProfit) : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {row.days ? row.fuelGallons.toLocaleString() : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {row.fuelMarginAvg != null ? row.fuelMarginAvg.toFixed(1) : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {row.days ? formatUsd(row.inStoreSales) : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {row.days ? formatUsd(row.laborCost) : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-red-600">
                        {row.days ? formatUsd(row.wasteCost) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
