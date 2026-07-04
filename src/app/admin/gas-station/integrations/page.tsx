'use client';

import React, { useEffect, useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import AdminNavigation from '@/components/AdminNavigation';
import { useAdminTenantId } from '../../AdminTenantContext';
import type {
  GasStationLocationDTO,
  GasStationIntegrationDTO,
  GasStationSystemType,
  GasStationConnectionMode,
} from '@/types/gasStation';
import {
  fetchGasStationLocationsServer,
  fetchGasStationIntegrationsServer,
  createGasStationIntegrationServer,
  updateGasStationIntegrationServer,
  deleteGasStationIntegrationServer,
} from '../ApiServerActions';

const SYSTEM_TYPES: { value: GasStationSystemType; label: string }[] = [
  { value: 'POS', label: 'Point of Sale (POS)' },
  { value: 'FUEL_CONTROLLER', label: 'Fuel Controller' },
  { value: 'INVENTORY', label: 'Inventory' },
  { value: 'PAYROLL_SCHEDULING', label: 'Payroll / Scheduling' },
  { value: 'ACCOUNTING', label: 'Accounting' },
  { value: 'LOTTERY', label: 'Lottery' },
  { value: 'CAR_WASH', label: 'Car Wash' },
  { value: 'FOODSERVICE', label: 'Foodservice' },
  { value: 'OTHER', label: 'Other' },
];

const CONNECTION_MODES: { value: GasStationConnectionMode; label: string }[] = [
  { value: 'API', label: 'Direct API' },
  { value: 'FILE_UPLOAD', label: 'File upload' },
  { value: 'SFTP', label: 'SFTP drop' },
  { value: 'MANUAL', label: 'Manual entry' },
];

type IntegrationForm = Omit<GasStationIntegrationDTO, 'id' | 'createdAt' | 'updatedAt'>;

export default function GasStationIntegrationsPage() {
  const tenantId = useAdminTenantId();
  const [stations, setStations] = useState<GasStationLocationDTO[]>([]);
  const [integrations, setIntegrations] = useState<GasStationIntegrationDTO[]>([]);
  const [form, setForm] = useState<IntegrationForm | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const tenantQuery = tenantId ? `?tenant=${encodeURIComponent(tenantId)}` : '';

  const reload = async () => {
    setLoading(true);
    const [s, i] = await Promise.all([
      fetchGasStationLocationsServer(tenantId),
      fetchGasStationIntegrationsServer(tenantId),
    ]);
    setStations(s);
    setIntegrations(i);
    setLoading(false);
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      fetchGasStationLocationsServer(tenantId),
      fetchGasStationIntegrationsServer(tenantId),
    ]).then(([s, i]) => {
      if (!cancelled) {
        setStations(s);
        setIntegrations(i);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [tenantId]);

  const stationById = useMemo(() => {
    const map = new Map<number, GasStationLocationDTO>();
    for (const s of stations) if (s.id != null) map.set(s.id, s);
    return map;
  }, [stations]);

  const stationLabel = (s: GasStationLocationDTO) =>
    tenantId ? `${s.stationCode} — ${s.stationName}` : `${s.tenantId} / ${s.stationCode} — ${s.stationName}`;

  const set = <K extends keyof IntegrationForm>(key: K, value: IntegrationForm[K]) =>
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));

  const startCreate = () => {
    const first = stations[0];
    setForm({
      tenantId: first?.tenantId ?? tenantId ?? '',
      stationId: first?.id ?? 0,
      systemType: 'POS',
      providerName: '',
      connectionMode: 'MANUAL',
      configJson: '',
      credentialsRef: '',
      syncFrequency: '',
      isEnabled: true,
    });
    setEditingId(null);
    setError('');
  };

  const startEdit = (integration: GasStationIntegrationDTO) => {
    const { id, createdAt, updatedAt, lastSyncAt, lastSyncStatus, ...rest } = integration;
    setForm({ ...rest });
    setEditingId(id ?? null);
    setError('');
  };

  const onStationChange = (stationIdValue: number) => {
    const station = stationById.get(stationIdValue);
    setForm((prev) =>
      prev ? { ...prev, stationId: stationIdValue, tenantId: station?.tenantId ?? prev.tenantId } : prev
    );
  };

  const submit = () => {
    if (!form) return;
    if (!form.stationId) {
      setError('Station is required — register a station first');
      return;
    }
    if (form.configJson?.trim()) {
      try {
        JSON.parse(form.configJson);
      } catch {
        setError('Config must be valid JSON');
        return;
      }
    }
    setError('');
    startTransition(async () => {
      const result = editingId
        ? await updateGasStationIntegrationServer(editingId, form)
        : await createGasStationIntegrationServer(form as IntegrationForm & { tenantId: string });
      if (!result) {
        setError('Save failed');
        return;
      }
      await reload();
      setForm(null);
    });
  };

  const remove = (integration: GasStationIntegrationDTO) => {
    if (integration.id == null) return;
    if (!window.confirm('Delete this integration registration?')) return;
    const id = integration.id;
    startTransition(async () => {
      const ok = await deleteGasStationIntegrationServer(id);
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
              System Integrations
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {tenantId
                ? `Connected source systems for tenant ${tenantId}`
                : 'Connected source systems across ALL tenants — set a Tenant ID in the top bar to filter'}
              . Credentials stay in the secrets manager; only references are stored here.
            </p>
          </div>
          <button
            type="button"
            onClick={startCreate}
            disabled={stations.length === 0}
            className="px-4 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-700 font-semibold transition-colors disabled:opacity-50"
          >
            + Add Integration
          </button>
        </div>

        {form && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {editingId ? 'Edit Integration' : 'New Integration'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Station *</label>
                <select
                  value={String(form.stationId)}
                  onChange={(e) => onStationChange(Number(e.target.value))}
                  className={inputClass}
                >
                  {stations.map((s) => (
                    <option key={s.id} value={String(s.id)}>
                      {stationLabel(s)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">System Type *</label>
                <select
                  value={form.systemType}
                  onChange={(e) => set('systemType', e.target.value as GasStationSystemType)}
                  className={inputClass}
                >
                  {SYSTEM_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Provider</label>
                <input
                  type="text"
                  value={form.providerName ?? ''}
                  onChange={(e) => set('providerName', e.target.value)}
                  className={inputClass}
                  placeholder="Verifone, Gilbarco, ADP…"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Connection Mode</label>
                <select
                  value={form.connectionMode ?? 'MANUAL'}
                  onChange={(e) => set('connectionMode', e.target.value as GasStationConnectionMode)}
                  className={inputClass}
                >
                  {CONNECTION_MODES.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Sync Frequency</label>
                <input
                  type="text"
                  value={form.syncFrequency ?? ''}
                  onChange={(e) => set('syncFrequency', e.target.value)}
                  className={inputClass}
                  placeholder="NIGHTLY, HOURLY…"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Credentials Reference</label>
                <input
                  type="text"
                  value={form.credentialsRef ?? ''}
                  onChange={(e) => set('credentialsRef', e.target.value)}
                  className={inputClass}
                  placeholder="secrets-manager reference (never the raw secret)"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700">Config (JSON)</label>
                <textarea
                  rows={3}
                  value={form.configJson ?? ''}
                  onChange={(e) => set('configJson', e.target.value)}
                  className={inputClass}
                  placeholder='{"storeNumber": "1234", "endpoint": "https://…"}'
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={Boolean(form.isEnabled)}
                onChange={(e) => set('isEnabled', e.target.checked)}
              />
              Enabled (the AI engine ingests from this system)
            </label>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setForm(null)}
                className="px-4 py-2 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={submit}
                className="px-4 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-700 font-semibold disabled:opacity-50"
              >
                {isPending ? 'Saving…' : editingId ? 'Update Integration' : 'Create Integration'}
              </button>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {['Tenant', 'Station', 'System', 'Provider', 'Mode', 'Sync', 'Last Sync', 'Status', ''].map(
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
              {!loading && integrations.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-6 text-sm text-gray-500 text-center">
                    No integrations registered.
                  </td>
                </tr>
              )}
              {integrations.map((i) => {
                const station = stationById.get(i.stationId);
                return (
                  <tr key={i.id}>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                      {i.tenantId}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                      {station ? station.stationCode : `#${i.stationId}`}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {SYSTEM_TYPES.find((t) => t.value === i.systemType)?.label ?? i.systemType}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                      {i.providerName || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                      {i.connectionMode ?? 'MANUAL'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                      {i.syncFrequency || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                      {i.lastSyncAt ? new Date(i.lastSyncAt).toLocaleString() : 'never'}
                      {i.lastSyncStatus ? ` (${i.lastSyncStatus})` : ''}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          i.isEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {i.isEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => startEdit(i)}
                        className="text-blue-600 hover:text-blue-800 font-medium mr-4"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(i)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
