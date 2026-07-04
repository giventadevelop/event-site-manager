'use client';

import React, { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import AdminNavigation from '@/components/AdminNavigation';
import { useAdminTenantId } from '../../AdminTenantContext';
import type { GasStationLocationDTO } from '@/types/gasStation';
import {
  fetchGasStationLocationsServer,
  createGasStationLocationServer,
  updateGasStationLocationServer,
  deleteGasStationLocationServer,
} from '../ApiServerActions';

type StationForm = Omit<GasStationLocationDTO, 'id' | 'createdAt' | 'updatedAt'>;

const EMPTY_FORM: StationForm = {
  tenantId: '',
  stationName: '',
  stationCode: '',
  brand: '',
  region: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  stateProvince: '',
  zipCode: '',
  country: 'United States',
  latitude: undefined,
  longitude: undefined,
  timezone: 'America/New_York',
  sellsFuel: true,
  fuelDispenserCount: undefined,
  hasCarWash: false,
  hasFoodservice: false,
  hasLottery: false,
  is24Hours: false,
  isActive: true,
};

export default function GasStationStationsPage() {
  const tenantId = useAdminTenantId();
  const [stations, setStations] = useState<GasStationLocationDTO[]>([]);
  const [form, setForm] = useState<StationForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const tenantQuery = tenantId ? `?tenant=${encodeURIComponent(tenantId)}` : '';

  const reload = async () => {
    setLoading(true);
    setStations(await fetchGasStationLocationsServer(tenantId));
    setLoading(false);
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchGasStationLocationsServer(tenantId).then((s) => {
      if (!cancelled) {
        setStations(s);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [tenantId]);

  const set = <K extends keyof StationForm>(key: K, value: StationForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const startCreate = () => {
    setForm({ ...EMPTY_FORM, tenantId: tenantId ?? '' });
    setEditingId(null);
    setShowForm(true);
    setError('');
  };

  const startEdit = (station: GasStationLocationDTO) => {
    const { id, createdAt, updatedAt, ...rest } = station;
    setForm({ ...EMPTY_FORM, ...rest });
    setEditingId(id ?? null);
    setShowForm(true);
    setError('');
  };

  const submit = () => {
    if (!form.tenantId.trim()) {
      setError('Tenant ID is required — set it in the top bar or type it here');
      return;
    }
    if (!form.stationName.trim() || !form.stationCode.trim()) {
      setError('Station name and station code are required');
      return;
    }
    setError('');
    startTransition(async () => {
      const result = editingId
        ? await updateGasStationLocationServer(editingId, form)
        : await createGasStationLocationServer(form as StationForm & { tenantId: string });
      if (!result) {
        setError('Save failed — check that the station code is unique for this tenant');
        return;
      }
      await reload();
      setShowForm(false);
    });
  };

  const remove = (station: GasStationLocationDTO) => {
    if (station.id == null) return;
    if (
      !window.confirm(
        `Delete station ${station.stationCode} — ${station.stationName} (tenant ${station.tenantId})? Its integrations, metrics and recommendations will be removed.`
      )
    ) {
      return;
    }
    const id = station.id;
    startTransition(async () => {
      const ok = await deleteGasStationLocationServer(id);
      if (ok) await reload();
    });
  };

  const inputClass =
    'mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-2 text-base';

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

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              Stations
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {tenantId
                ? `Store locations for tenant ${tenantId}`
                : 'Store locations across ALL tenants — set a Tenant ID in the top bar to filter'}
            </p>
          </div>
          <button
            type="button"
            onClick={startCreate}
            className="px-4 py-2 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold transition-colors"
          >
            + Add Station
          </button>
        </div>

        {showForm && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {editingId ? 'Edit Station' : 'New Station'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tenant ID *</label>
                <input
                  type="text"
                  value={form.tenantId}
                  onChange={(e) => set('tenantId', e.target.value)}
                  disabled={editingId != null}
                  className={`${inputClass} disabled:bg-gray-100 disabled:text-gray-500`}
                  placeholder="e.g. demo_gas_station_001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Station Name *</label>
                <input
                  type="text"
                  value={form.stationName}
                  onChange={(e) => set('stationName', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Station Code *</label>
                <input
                  type="text"
                  value={form.stationCode}
                  onChange={(e) => set('stationCode', e.target.value)}
                  className={inputClass}
                  placeholder="ST-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Brand</label>
                <input
                  type="text"
                  value={form.brand ?? ''}
                  onChange={(e) => set('brand', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Region / District</label>
                <input
                  type="text"
                  value={form.region ?? ''}
                  onChange={(e) => set('region', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Timezone</label>
                <input
                  type="text"
                  value={form.timezone ?? ''}
                  onChange={(e) => set('timezone', e.target.value)}
                  className={inputClass}
                  placeholder="America/New_York"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Address Line 1</label>
                <input
                  type="text"
                  value={form.addressLine1 ?? ''}
                  onChange={(e) => set('addressLine1', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input
                  type="text"
                  value={form.city ?? ''}
                  onChange={(e) => set('city', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">State / Province</label>
                <input
                  type="text"
                  value={form.stateProvince ?? ''}
                  onChange={(e) => set('stateProvince', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">ZIP</label>
                <input
                  type="text"
                  value={form.zipCode ?? ''}
                  onChange={(e) => set('zipCode', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fuel Dispensers</label>
                <input
                  type="number"
                  min="0"
                  value={form.fuelDispenserCount ?? ''}
                  onChange={(e) =>
                    set(
                      'fuelDispenserCount',
                      e.target.value === '' ? undefined : Number(e.target.value)
                    )
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Latitude</label>
                <input
                  type="number"
                  step="0.0000001"
                  value={form.latitude ?? ''}
                  onChange={(e) =>
                    set('latitude', e.target.value === '' ? undefined : Number(e.target.value))
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Longitude</label>
                <input
                  type="number"
                  step="0.0000001"
                  value={form.longitude ?? ''}
                  onChange={(e) =>
                    set('longitude', e.target.value === '' ? undefined : Number(e.target.value))
                  }
                  className={inputClass}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-6 pt-2">
              {(
                [
                  ['sellsFuel', 'Sells fuel'],
                  ['hasCarWash', 'Car wash'],
                  ['hasFoodservice', 'Foodservice'],
                  ['hasLottery', 'Lottery'],
                  ['is24Hours', 'Open 24 hours'],
                  ['isActive', 'Active'],
                ] as [keyof StationForm, string][]
              ).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={Boolean(form[key])}
                    onChange={(e) => set(key, e.target.checked as StationForm[typeof key])}
                  />
                  {label}
                </label>
              ))}
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={submit}
                className="px-4 py-2 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold disabled:opacity-50"
              >
                {isPending ? 'Saving…' : editingId ? 'Update Station' : 'Create Station'}
              </button>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {['Tenant', 'Code', 'Name', 'Brand', 'Region', 'City', 'Capabilities', 'Status', ''].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading && (
                <tr>
                  <td colSpan={9} className="px-4 py-6 text-sm text-gray-500 text-center">
                    Loading…
                  </td>
                </tr>
              )}
              {!loading && stations.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-6 text-sm text-gray-500 text-center">
                    {tenantId ? `No stations for tenant ${tenantId}.` : 'No stations registered on the platform yet.'}
                  </td>
                </tr>
              )}
              {stations.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                    {s.tenantId}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                    {s.stationCode}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{s.stationName}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{s.brand || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{s.region || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{s.city || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                    {[
                      s.sellsFuel ? 'Fuel' : null,
                      s.hasCarWash ? 'Car wash' : null,
                      s.hasFoodservice ? 'Food' : null,
                      s.hasLottery ? 'Lottery' : null,
                      s.is24Hours ? '24h' : null,
                    ]
                      .filter(Boolean)
                      .join(', ') || '—'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        s.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {s.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => startEdit(s)}
                      className="text-blue-600 hover:text-blue-800 font-medium mr-4"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(s)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
