'use client';

import { useState } from 'react';
import {
  fetchBatchJobExecutionsServer,
  fetchBatchJobExecutionByIdServer,
  fetchFailedBatchJobsServer,
  fetchRunningBatchJobsServer,
  fetchBatchJobSummaryServer,
  fetchConfiguredBatchJobsServer,
  type BatchJobExecutionDTO,
  type BatchJobSummaryDTO,
  type ConfiguredBatchJobDTO,
} from './ApiServerActions';

const STATUS_OPTIONS = ['', 'COMPLETED', 'FAILED', 'STARTED', 'STARTING', 'STOPPING', 'STOPPED', 'ABANDONED', 'UNKNOWN'] as const;

function formatDateTime(value?: string | null): string {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return String(value);
  }
}

function statusBadgeClass(status?: string): string {
  const s = (status || '').toUpperCase();
  if (s === 'COMPLETED') return 'bg-green-100 text-green-800 border-green-300';
  if (s === 'FAILED' || s === 'ABANDONED') return 'bg-red-100 text-red-800 border-red-300';
  if (s === 'STARTED' || s === 'STARTING') return 'bg-blue-100 text-blue-800 border-blue-300';
  if (s === 'STOPPING' || s === 'STOPPED') return 'bg-amber-100 text-amber-800 border-amber-300';
  return 'bg-gray-100 text-gray-700 border-gray-300';
}

function summaryNumber(summary: BatchJobSummaryDTO, keys: string[]): number {
  for (const key of keys) {
    const v = summary[key];
    if (typeof v === 'number' && Number.isFinite(v)) return v;
  }
  return 0;
}

interface BatchJobsClientProps {
  initialSummary: BatchJobSummaryDTO;
  initialExecutions: BatchJobExecutionDTO[];
  initialTotalCount: number;
  initialFailed: BatchJobExecutionDTO[];
  initialRunning: BatchJobExecutionDTO[];
  initialConfigured: ConfiguredBatchJobDTO[];
  initialBackendReachable: boolean;
  initialPageSize?: number;
}

export default function BatchJobsClient({
  initialSummary,
  initialExecutions,
  initialTotalCount,
  initialFailed,
  initialRunning,
  initialConfigured,
  initialBackendReachable,
  initialPageSize = 10,
}: BatchJobsClientProps) {
  const [summary, setSummary] = useState(initialSummary);
  const [executions, setExecutions] = useState(initialExecutions);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [failed, setFailed] = useState(initialFailed);
  const [running, setRunning] = useState(initialRunning);
  const [configured, setConfigured] = useState(initialConfigured);
  const [backendReachable, setBackendReachable] = useState(initialBackendReachable);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(initialPageSize);
  const [statusFilter, setStatusFilter] = useState('');
  const [jobNameFilter, setJobNameFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selected, setSelected] = useState<BatchJobExecutionDTO | null>(null);
  const [error, setError] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize) || 1);
  const isPrevDisabled = page <= 0 || loading;
  const isNextDisabled = page >= totalPages - 1 || loading || totalCount === 0;
  const startItem = totalCount > 0 ? page * pageSize + 1 : 0;
  const endItem =
    totalCount > 0 ? page * pageSize + Math.min(pageSize, totalCount - page * pageSize) : 0;

  const completed = summaryNumber(summary, ['completed', 'COMPLETED', 'completedCount']);
  const failedCount = summaryNumber(summary, ['failed', 'FAILED', 'failedCount']);
  const runningCount = summaryNumber(summary, ['running', 'RUNNING', 'STARTED', 'runningCount', 'started']);
  const totalExec = summaryNumber(summary, ['totalExecutions', 'total', 'totalCount']) || totalCount;

  const reloadAll = async (nextPage = page, nextStatus = statusFilter, nextJobName = jobNameFilter) => {
    setLoading(true);
    setError(null);
    try {
      const [nextSummary, pageResult, nextFailed, nextRunning, nextConfigured] = await Promise.all([
        fetchBatchJobSummaryServer(),
        fetchBatchJobExecutionsServer({
          page: nextPage,
          pageSize,
          status: nextStatus || undefined,
          jobName: nextJobName || undefined,
        }),
        fetchFailedBatchJobsServer(pageSize),
        fetchRunningBatchJobsServer(pageSize),
        fetchConfiguredBatchJobsServer(),
      ]);

      setSummary(nextSummary);
      setExecutions(pageResult.executions);
      setTotalCount(pageResult.totalCount);
      setFailed(nextFailed);
      setRunning(nextRunning);
      setConfigured(nextConfigured);
      setBackendReachable(
        Object.keys(nextSummary).length > 0 ||
          pageResult.totalCount > 0 ||
          pageResult.executions.length > 0 ||
          nextFailed.length > 0 ||
          nextRunning.length > 0 ||
          nextConfigured.length > 0
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reload batch jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = async () => {
    setPage(0);
    await reloadAll(0, statusFilter, jobNameFilter);
  };

  const handlePrevPage = async () => {
    if (isPrevDisabled) return;
    const next = page - 1;
    setPage(next);
    await reloadAll(next);
  };

  const handleNextPage = async () => {
    if (isNextDisabled) return;
    const next = page + 1;
    setPage(next);
    await reloadAll(next);
  };

  const openDetail = async (row: BatchJobExecutionDTO) => {
    setSelected(row);
    setDetailLoading(true);
    try {
      const full = await fetchBatchJobExecutionByIdServer(row.id);
      if (full) setSelected(full);
    } catch {
      // keep list row as fallback
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {!backendReachable && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
          <p className="text-amber-900 font-medium">Backend batch-job APIs not reachable yet</p>
          <p className="text-amber-800 text-sm mt-1">
            Expected routes under <code className="bg-amber-100 px-1 rounded">/api/admin/batch-jobs/*</code>.
            The dashboard will populate automatically once the Rust/Spring admin endpoints are live.
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">{error}</div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-5 shadow-sm">
          <p className="text-sm font-semibold text-blue-700">Total executions</p>
          <p className="text-3xl font-bold text-blue-800 mt-1">{totalExec}</p>
        </div>
        <div className="rounded-xl border-2 border-green-200 bg-green-50 p-5 shadow-sm">
          <p className="text-sm font-semibold text-green-700">Completed</p>
          <p className="text-3xl font-bold text-green-800 mt-1">{completed}</p>
        </div>
        <div className="rounded-xl border-2 border-red-200 bg-red-50 p-5 shadow-sm">
          <p className="text-sm font-semibold text-red-700">Failed</p>
          <p className="text-3xl font-bold text-red-800 mt-1">{failedCount || failed.length}</p>
        </div>
        <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50 p-5 shadow-sm">
          <p className="text-sm font-semibold text-indigo-700">Running</p>
          <p className="text-3xl font-bold text-indigo-800 mt-1">{runningCount || running.length}</p>
        </div>
      </div>

      {/* Filters + reload */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-end">
          <div className="flex-1">
            <label htmlFor="jobNameFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Job name
            </label>
            <input
              id="jobNameFilter"
              type="text"
              value={jobNameFilter}
              onChange={(e) => setJobNameFilter(e.target.value)}
              placeholder="Contains…"
              className="w-full border border-gray-400 rounded-xl px-4 py-3 text-base focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="w-full lg:w-56">
            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-gray-400 rounded-xl px-4 py-3 text-base focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All statuses</option>
              {STATUS_OPTIONS.filter(Boolean).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={handleApplyFilters}
            disabled={loading}
            className="flex-shrink-0 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6 disabled:opacity-50"
            title="Apply filters"
            aria-label="Apply filters"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <span className="font-semibold text-blue-700">Filter</span>
          </button>
          <button
            type="button"
            onClick={() => reloadAll()}
            disabled={loading}
            className="flex-shrink-0 h-14 rounded-xl bg-amber-100 hover:bg-amber-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6 disabled:opacity-50"
            title="Reload"
            aria-label="Reload"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-amber-200 flex items-center justify-center">
              {loading ? (
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
            <span className="font-semibold text-amber-700">{loading ? 'Loading…' : 'Reload'}</span>
          </button>
        </div>
      </div>

      {/* Executions table */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-3">Job executions</h2>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Job</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Started</th>
                <th className="px-4 py-3 text-left">Ended</th>
                <th className="px-4 py-3 text-left">Exit</th>
                <th className="px-4 py-3 text-right">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {executions.map((row) => (
                <tr key={String(row.id)} className="hover:bg-blue-50/40">
                  <td className="px-4 py-3 font-mono text-xs">{row.id}</td>
                  <td className="px-4 py-3 font-medium">{row.jobName || '—'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${statusBadgeClass(
                        row.status
                      )}`}
                    >
                      {row.status || 'UNKNOWN'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatDateTime(row.startTime)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatDateTime(row.endTime)}</td>
                  <td className="px-4 py-3 font-mono text-xs">{row.exitCode || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => openDetail(row)}
                      className="inline-flex h-10 px-4 rounded-lg bg-green-100 hover:bg-green-200 text-green-700 font-semibold text-sm items-center justify-center gap-2 transition-all duration-300 hover:scale-105"
                      title="View execution detail"
                      aria-label="View execution detail"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {executions.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No job executions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-8">
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevPage}
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
              onClick={handleNextPage}
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
                  <span className="font-bold text-blue-600">{totalCount}</span> executions
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border-2 border-orange-300 rounded-lg shadow-sm">
                <span className="text-sm font-medium text-orange-700">No executions found</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Running / Failed / Configured */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <JobListPanel title="Running now" rows={running} empty="No running jobs" onView={openDetail} accent="indigo" />
        <JobListPanel title="Recent failures" rows={failed} empty="No failed jobs" onView={openDetail} accent="red" />
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Configured jobs</h3>
          {configured.length === 0 ? (
            <p className="text-sm text-gray-500">No configured jobs returned</p>
          ) : (
            <ul className="space-y-3">
              {configured.map((job, idx) => (
                <li
                  key={`${job.name}-${idx}`}
                  className="border border-gray-100 rounded-lg p-3 bg-gray-50"
                >
                  <p className="font-semibold text-gray-900">{job.name}</p>
                  {job.description && <p className="text-xs text-gray-600 mt-1">{job.description}</p>}
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    {job.cronExpression && (
                      <span className="px-2 py-1 rounded bg-purple-100 text-purple-800 font-mono">
                        {job.cronExpression}
                      </span>
                    )}
                    {typeof job.enabled === 'boolean' && (
                      <span
                        className={`px-2 py-1 rounded font-semibold ${
                          job.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {job.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    )}
                    {job.lastStatus && (
                      <span className={`px-2 py-1 rounded border ${statusBadgeClass(job.lastStatus)}`}>
                        {job.lastStatus}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
              <div>
                <h3 className="text-lg font-bold">Execution #{String(selected.id)}</h3>
                <p className="text-sm text-blue-100">{selected.jobName || 'Unknown job'}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="w-10 h-10 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center"
                title="Close"
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              {detailLoading && (
                <p className="text-sm text-blue-600">Loading full execution details…</p>
              )}
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <DetailItem label="Status" value={selected.status || '—'} />
                <DetailItem label="Exit code" value={selected.exitCode || '—'} />
                <DetailItem label="Started" value={formatDateTime(selected.startTime)} />
                <DetailItem label="Ended" value={formatDateTime(selected.endTime)} />
                <DetailItem label="Created" value={formatDateTime(selected.createTime)} />
                <DetailItem label="Last updated" value={formatDateTime(selected.lastUpdated)} />
              </dl>
              {selected.exitMessage && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Exit message</p>
                  <pre className="text-xs bg-red-50 border border-red-200 rounded-lg p-3 whitespace-pre-wrap text-red-900">
                    {selected.exitMessage}
                  </pre>
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Raw payload</p>
                <pre className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-3 overflow-x-auto max-h-64">
                  {JSON.stringify(selected, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-lg border border-gray-100 p-3">
      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</dt>
      <dd className="mt-1 font-semibold text-gray-900 break-words">{value}</dd>
    </div>
  );
}

function JobListPanel({
  title,
  rows,
  empty,
  onView,
  accent,
}: {
  title: string;
  rows: BatchJobExecutionDTO[];
  empty: string;
  onView: (row: BatchJobExecutionDTO) => void;
  accent: 'indigo' | 'red';
}) {
  const rowClass =
    accent === 'indigo'
      ? 'border-indigo-100 bg-indigo-50/40'
      : 'border-red-100 bg-red-50/40';
  const btnClass =
    accent === 'indigo'
      ? 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
      : 'bg-red-100 text-red-800 hover:bg-red-200';

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      <h3 className="text-lg font-bold text-gray-900 mb-3">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-sm text-gray-500">{empty}</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((row) => (
            <li
              key={`${title}-${row.id}`}
              className={`flex items-center justify-between gap-2 border rounded-lg p-3 ${rowClass}`}
            >
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{row.jobName || `Job #${row.id}`}</p>
                <p className="text-xs text-gray-600">{formatDateTime(row.startTime)}</p>
              </div>
              <button
                type="button"
                onClick={() => onView(row)}
                className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg ${btnClass}`}
              >
                View
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
