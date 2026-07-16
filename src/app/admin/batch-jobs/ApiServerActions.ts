'use server';

import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getApiBaseUrl, getTenantIdOptional } from '@/lib/env';

/** Spring Batch–style job execution row from `/api/admin/batch-jobs/*`. */
export interface BatchJobExecutionDTO {
  id: number | string;
  jobName?: string;
  jobInstanceId?: number | string;
  status?: string;
  startTime?: string | null;
  endTime?: string | null;
  createTime?: string | null;
  lastUpdated?: string | null;
  exitCode?: string | null;
  exitMessage?: string | null;
  tenantId?: string | null;
  parameters?: Record<string, unknown> | string | null;
  [key: string]: unknown;
}

export interface BatchJobSummaryDTO {
  totalExecutions?: number;
  completed?: number;
  failed?: number;
  running?: number;
  stopped?: number;
  unknown?: number;
  [key: string]: unknown;
}

export interface ConfiguredBatchJobDTO {
  name: string;
  description?: string | null;
  cronExpression?: string | null;
  enabled?: boolean;
  lastStatus?: string | null;
  lastExecutionId?: number | string | null;
  lastStartTime?: string | null;
  [key: string]: unknown;
}

export interface BatchJobExecutionsPage {
  executions: BatchJobExecutionDTO[];
  totalCount: number;
}

export interface BatchJobListFilters {
  status?: string;
  jobName?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
}

function adminBatchJobsBaseUrl(): string {
  return `${getApiBaseUrl()}/api/admin/batch-jobs`;
}

function tenantHeaders(): Record<string, string> {
  const tenantId = getTenantIdOptional();
  return tenantId ? { 'X-Tenant-ID': tenantId } : {};
}

function parseListPayload(data: unknown): BatchJobExecutionDTO[] {
  if (data == null) return [];
  if (Array.isArray(data)) return data as BatchJobExecutionDTO[];
  if (typeof data === 'object') {
    const o = data as Record<string, unknown>;
    if (Array.isArray(o.content)) return o.content as BatchJobExecutionDTO[];
    if (Array.isArray(o.executions)) return o.executions as BatchJobExecutionDTO[];
    if (Array.isArray(o.items)) return o.items as BatchJobExecutionDTO[];
    const embedded = o._embedded as Record<string, unknown> | undefined;
    if (embedded && typeof embedded === 'object') {
      for (const v of Object.values(embedded)) {
        if (Array.isArray(v)) return v as BatchJobExecutionDTO[];
      }
    }
  }
  return [];
}

function parseConfiguredJobs(data: unknown): ConfiguredBatchJobDTO[] {
  if (data == null) return [];
  if (Array.isArray(data)) return data as ConfiguredBatchJobDTO[];
  if (typeof data === 'object') {
    const o = data as Record<string, unknown>;
    if (Array.isArray(o.content)) return o.content as ConfiguredBatchJobDTO[];
    if (Array.isArray(o.jobs)) return o.jobs as ConfiguredBatchJobDTO[];
    if (Array.isArray(o.configuredJobs)) return o.configuredJobs as ConfiguredBatchJobDTO[];
  }
  return [];
}

function parseSummary(data: unknown): BatchJobSummaryDTO {
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    return data as BatchJobSummaryDTO;
  }
  return {};
}

async function fetchJsonWithTotal(
  url: string
): Promise<{ data: unknown; totalCount: number; ok: boolean; status: number }> {
  try {
    const res = await fetchWithJwtRetry(url, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        ...tenantHeaders(),
      },
    });

    if (!res.ok) {
      console.warn('[BatchJobs] Backend request failed:', { url, status: res.status });
      return { data: null, totalCount: 0, ok: false, status: res.status };
    }

    const data = await res.json();
    const totalHeader = res.headers.get('x-total-count') ?? res.headers.get('X-Total-Count');
    const parsed = totalHeader != null ? parseInt(totalHeader, 10) : NaN;
    let totalCount = Number.isFinite(parsed) ? parsed : 0;
    if (!Number.isFinite(parsed) && data && typeof data === 'object') {
      const o = data as Record<string, unknown>;
      if (typeof o.totalElements === 'number') totalCount = o.totalElements;
      else if (typeof o.totalCount === 'number') totalCount = o.totalCount;
      else totalCount = parseListPayload(data).length;
    }
    return { data, totalCount, ok: true, status: res.status };
  } catch (error) {
    console.error('[BatchJobs] Fetch error:', { url, error });
    return { data: null, totalCount: 0, ok: false, status: 0 };
  }
}

export async function fetchBatchJobExecutionsServer(
  filters: BatchJobListFilters = {}
): Promise<BatchJobExecutionsPage> {
  const page = Math.max(0, filters.page ?? 0);
  const pageSize = Math.max(1, filters.pageSize ?? 10);
  const params = new URLSearchParams({
    page: String(page),
    size: String(pageSize),
    sort: filters.sort?.trim() || 'startTime,desc',
  });
  if (filters.status?.trim()) params.set('status.equals', filters.status.trim());
  if (filters.jobName?.trim()) params.set('jobName.contains', filters.jobName.trim());

  const { data, totalCount, ok } = await fetchJsonWithTotal(
    `${adminBatchJobsBaseUrl()}/executions?${params.toString()}`
  );
  if (!ok) return { executions: [], totalCount: 0 };
  const executions = parseListPayload(data);
  return {
    executions,
    totalCount: totalCount || executions.length,
  };
}

export async function fetchBatchJobExecutionByIdServer(
  id: string | number
): Promise<BatchJobExecutionDTO | null> {
  const { data, ok } = await fetchJsonWithTotal(`${adminBatchJobsBaseUrl()}/executions/${id}`);
  if (!ok || data == null) return null;
  if (typeof data === 'object' && !Array.isArray(data)) {
    return data as BatchJobExecutionDTO;
  }
  return null;
}

export async function fetchFailedBatchJobsServer(
  pageSize = 10
): Promise<BatchJobExecutionDTO[]> {
  const params = new URLSearchParams({ page: '0', size: String(pageSize), sort: 'startTime,desc' });
  const { data, ok } = await fetchJsonWithTotal(
    `${adminBatchJobsBaseUrl()}/executions/failed?${params.toString()}`
  );
  if (!ok) return [];
  return parseListPayload(data);
}

export async function fetchRunningBatchJobsServer(
  pageSize = 10
): Promise<BatchJobExecutionDTO[]> {
  const params = new URLSearchParams({ page: '0', size: String(pageSize), sort: 'startTime,desc' });
  const { data, ok } = await fetchJsonWithTotal(
    `${adminBatchJobsBaseUrl()}/executions/running?${params.toString()}`
  );
  if (!ok) return [];
  return parseListPayload(data);
}

export async function fetchBatchJobSummaryServer(): Promise<BatchJobSummaryDTO> {
  const { data, ok } = await fetchJsonWithTotal(`${adminBatchJobsBaseUrl()}/summary`);
  if (!ok) return {};
  return parseSummary(data);
}

export async function fetchConfiguredBatchJobsServer(): Promise<ConfiguredBatchJobDTO[]> {
  const { data, ok } = await fetchJsonWithTotal(`${adminBatchJobsBaseUrl()}/configured-jobs`);
  if (!ok) return [];
  return parseConfiguredJobs(data);
}

export async function fetchBatchJobsDashboardServer(pageSize = 10): Promise<{
  summary: BatchJobSummaryDTO;
  executions: BatchJobExecutionDTO[];
  totalCount: number;
  failed: BatchJobExecutionDTO[];
  running: BatchJobExecutionDTO[];
  configured: ConfiguredBatchJobDTO[];
  backendReachable: boolean;
}> {
  const [summary, executionsPage, failed, running, configured] = await Promise.all([
    fetchBatchJobSummaryServer(),
    fetchBatchJobExecutionsServer({ page: 0, pageSize }),
    fetchFailedBatchJobsServer(pageSize),
    fetchRunningBatchJobsServer(pageSize),
    fetchConfiguredBatchJobsServer(),
  ]);

  const backendReachable =
    Object.keys(summary).length > 0 ||
    executionsPage.totalCount > 0 ||
    executionsPage.executions.length > 0 ||
    failed.length > 0 ||
    running.length > 0 ||
    configured.length > 0;

  return {
    summary,
    executions: executionsPage.executions,
    totalCount: executionsPage.totalCount,
    failed,
    running,
    configured,
    backendReachable,
  };
}
