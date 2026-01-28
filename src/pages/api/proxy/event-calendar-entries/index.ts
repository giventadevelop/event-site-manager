import { createProxyHandler } from '@/lib/proxyHandler';

/** Tenant-agnostic: proxy never injects tenantId; add tenantId.equals only when caller passes it (e.g. ?tenant=). */
export default createProxyHandler({ backendPath: '/api/event-calendar-entries', injectTenantId: false });