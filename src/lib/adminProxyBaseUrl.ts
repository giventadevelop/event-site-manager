import { headers } from 'next/headers';
import { getAppUrl, getRequestOriginFromHeaders } from '@/lib/env';

/**
 * Base URL for server-side calls to this Next app's `/api/proxy/*` from admin server actions.
 * Prefer the incoming request host (correct dev port, e.g. 3001) over `NEXT_PUBLIC_APP_URL` defaults.
 */
export async function getAdminProxyBaseUrl(): Promise<string> {
  const h = await headers();
  return getRequestOriginFromHeaders(h) || getAppUrl();
}
