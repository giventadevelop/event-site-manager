/**
 * Lazily loads API JWT user from environment variables, prioritizing AMPLIFY_ prefix for AWS Amplify.
 */
export function getApiJwtUser() {
  return (
    process.env.AMPLIFY_API_JWT_USER ||
    process.env.API_JWT_USER ||
    process.env.NEXT_PUBLIC_API_JWT_USER
  );
}

/**
 * Lazily loads API JWT password from environment variables, prioritizing AMPLIFY_ prefix for AWS Amplify.
 */
export function getApiJwtPass() {
  return (
    process.env.AMPLIFY_API_JWT_PASS ||
    process.env.API_JWT_PASS ||
    process.env.NEXT_PUBLIC_API_JWT_PASS
  );
}

/**
 * Returns true when the app is configured as a super-admin dashboard for all tenants.
 * When true, the proxy and fetchWithJwtRetry do not inject tenantId by default;
 * callers may pass tenantId explicitly to scope by tenant, or omit for wildcard (all tenants).
 * Set NEXT_PUBLIC_ALL_TENANTS_ADMIN=true (or AMPLIFY_NEXT_PUBLIC_ALL_TENANTS_ADMIN in Amplify) to enable.
 */
export function isAllTenantsAdmin(): boolean {
  return (
    process.env.AMPLIFY_NEXT_PUBLIC_ALL_TENANTS_ADMIN === 'true' ||
    process.env.NEXT_PUBLIC_ALL_TENANTS_ADMIN === 'true'
  );
}

/**
 * Returns tenant ID from environment when set, or undefined. Never throws.
 * Use when tenant is optional (e.g. layout/header in super-admin, or when caller supplies tenant).
 * When isAllTenantsAdmin() is true, prefer passing tenant from UI/context; this can still return
 * env value if set (e.g. as default selected tenant in super-admin).
 */
export function getTenantIdOptional(): string | undefined {
  const v =
    process.env.AMPLIFY_NEXT_PUBLIC_TENANT_ID ||
    process.env.NEXT_PUBLIC_TENANT_ID;
  return v && v.trim() ? v : undefined;
}

/**
 * Lazily loads tenant ID from environment variables, prioritizing AMPLIFY_ prefix for AWS Amplify.
 * Throws an error if not set.
 */
export function getTenantId() {
  const tenantId =
    process.env.AMPLIFY_NEXT_PUBLIC_TENANT_ID ||
    process.env.NEXT_PUBLIC_TENANT_ID;
  if (!tenantId) {
    throw new Error('NEXT_PUBLIC_TENANT_ID is not set in environment variables. Check AMPLIFY_NEXT_PUBLIC_TENANT_ID or NEXT_PUBLIC_TENANT_ID');
  }
  return tenantId;
}

/**
 * Client-safe tenant ID for use in browser (cache keys, data attributes, etc.).
 * Returns empty string if not set; does not throw. Prefer getTenantId() server-side.
 */
export function getClientTenantId(): string {
  return (
    process.env.AMPLIFY_NEXT_PUBLIC_TENANT_ID ||
    process.env.NEXT_PUBLIC_TENANT_ID ||
    ''
  );
}

/**
 * Lazily loads Payment Method Domain ID from environment variables, prioritizing AMPLIFY_ prefix for AWS Amplify.
 * Throws an error if not set.
 * This is used to identify the Stripe Payment Method Domain (pmd_*) associated with this tenant.
 */
export function getPaymentMethodDomainId() {
  const paymentMethodDomainId =
    process.env.AMPLIFY_NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID ||
    process.env.NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID;
  if (!paymentMethodDomainId) {
    throw new Error('NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID is not set in environment variables. Check AMPLIFY_NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID or NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID');
  }
  return paymentMethodDomainId;
}

function isLoopbackHostname(hostname: string): boolean {
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '[::1]' ||
    hostname === '::1' ||
    hostname === '0.0.0.0'
  );
}

function hostnameFromHostHeader(host: string): string {
  if (host.startsWith('[')) {
    const end = host.indexOf(']');
    return end > 0 ? host.slice(1, end) : host;
  }
  return host.split(':')[0] || host;
}

function parsePortFromProcessArgs(argv: readonly string[]): string | undefined {
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if ((arg === '-p' || arg === '--port') && argv[i + 1] && /^\d+$/.test(argv[i + 1])) {
      return argv[i + 1];
    }
    const matched = arg.match(/^--port=(\d+)$/);
    if (matched) return matched[1];
  }
  return undefined;
}

function configuredPublicAppUrl(): string | undefined {
  return process.env.AMPLIFY_NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_APP_URL || undefined;
}

/**
 * Port this Next.js process is listening on.
 * Never read from NEXT_PUBLIC_APP_URL — that value is a stale snapshot (e.g. 3002)
 * while `npm run dev:clean -- -p 3003` binds a different port.
 */
export function getDevListenPort(): string {
  if (process.env.PORT && /^\d+$/.test(process.env.PORT)) {
    return process.env.PORT;
  }
  const argvPort = parsePortFromProcessArgs(process.argv);
  if (argvPort) return argvPort;
  if (process.env.npm_config_port && /^\d+$/.test(process.env.npm_config_port)) {
    return process.env.npm_config_port;
  }
  return '3000';
}

/** Build `http(s)://host[:port]` from a request Host header. */
export function originFromRequestHost(host: string, forwardedProto?: string | null): string {
  const hostname = hostnameFromHostHeader(host);
  const proto =
    forwardedProto?.split(',')[0]?.trim() ||
    (isLoopbackHostname(hostname) || hostname.startsWith('127.') ? 'http' : 'https');
  return `${proto}://${host}`;
}

function getLocalDevAppOrigin(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/$/, '');
  }
  const nextPrivateOrigin = process.env['__NEXT_PRIVATE_ORIGIN'];
  if (nextPrivateOrigin) {
    return nextPrivateOrigin.replace(/\/$/, '');
  }
  return `http://localhost:${getDevListenPort()}`;
}

/**
 * Origin of this Next.js app.
 *
 * Local development never uses the port from NEXT_PUBLIC_APP_URL (it is ignored
 * when the host is localhost / 127.0.0.1). Resolution order:
 * 1. Browser tab origin (`window.location.origin`)
 * 2. Live listen port (`PORT`, `next dev -p`, or `__NEXT_PRIVATE_ORIGIN`)
 * Production still uses AMPLIFY_NEXT_PUBLIC_APP_URL / NEXT_PUBLIC_APP_URL (real domain).
 *
 * Prefer {@link getAppUrlFromRequestHeaders} or {@link getRequestOriginFromHeaders}
 * in a request — those follow the Host header (correct even when Next auto-picks
 * 3001 because 3000 is busy). For admin server actions that must hit this app's
 * `/api/proxy/*`, use `getAdminProxyBaseUrl()`.
 */
export function getAppUrl(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/$/, '');
  }

  const configured = configuredPublicAppUrl();

  if (process.env.NODE_ENV === 'production') {
    if (!configured) {
      console.error('[getAppUrl] CRITICAL: NEXT_PUBLIC_APP_URL not set in production. Check AMPLIFY_NEXT_PUBLIC_APP_URL or NEXT_PUBLIC_APP_URL environment variable.');
    }
    return configured?.replace(/\/$/, '') || '';
  }

  if (!configured) {
    return getLocalDevAppOrigin();
  }
  try {
    const parsed = new URL(configured);
    if (isLoopbackHostname(parsed.hostname)) {
      return getLocalDevAppOrigin();
    }
    return configured.replace(/\/$/, '');
  } catch {
    return getLocalDevAppOrigin();
  }
}

/**
 * Origin of the current request to this Next.js app (server-side).
 * Uses `Host` / `X-Forwarded-Host` and `X-Forwarded-Proto` so server `fetch` to same-origin
 * `/api/proxy/*` targets the port the user actually hit (e.g. dev on :3004), avoiding
 * `ECONNREFUSED` when `NEXT_PUBLIC_APP_URL` still points at a stale localhost port.
 *
 * @returns `null` if Host is missing — fall back to {@link getAppUrl}.
 */
export function getRequestOriginFromHeaders(headersLike: {
  get(name: string): string | null | undefined;
}): string | null {
  const hostRaw = headersLike.get('x-forwarded-host') || headersLike.get('host');
  const host = hostRaw?.trim();
  if (!host) return null;
  return originFromRequestHost(host, headersLike.get('x-forwarded-proto'));
}

/**
 * Same-origin base for server fetches to this Next app (`/api/proxy/*`, emails, Clerk).
 * Uses the incoming request host/port so `next dev -p 3003` works regardless of .env.
 * Falls back to {@link getAppUrl} when `headers()` is not available.
 * Admin CRUD that must hit `/api/proxy/*` should still use `getAdminProxyBaseUrl()`.
 */
export async function getAppUrlFromRequestHeaders(): Promise<string> {
  try {
    const { headers } = await import('next/headers');
    const headersList = await headers();
    return getRequestOriginFromHeaders(headersList) || getAppUrl();
  } catch {
    // headers() unavailable outside a request (e.g. static generation)
  }
  return getAppUrl();
}

/**
 * Email / QR host prefix. Same resolution as {@link getAppUrl} so local ports stay live.
 */
export function getEmailHostUrlPrefix(): string {
  return getAppUrl();
}

/**
 * Get Clerk Backend API URL
 * Returns the Clerk API endpoint for backend authentication
 */
export function getClerkBackendUrl(): string {
  const raw = process.env.CLERK_BACKEND_API_URL || 'https://api.clerk.com';
  // Safety: only allow Clerk host and normalize to origin without path
  try {
    const u = new URL(raw);
    if (!/clerk\.com$/i.test(u.hostname)) return 'https://api.clerk.com';
    // Always force api.clerk.com origin, strip any path (/v1 etc.)
    return 'https://api.clerk.com';
  } catch {
    return 'https://api.clerk.com';
  }
}

/**
 * Get Clerk Secret Key for backend API authentication
 * Throws an error if not set as this is required for backend Clerk integration
 */
export function getClerkSecretKey(): string {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    throw new Error('CLERK_SECRET_KEY is not set in environment variables');
  }
  return secretKey;
}

/**
 * Get Clerk Publishable Key for frontend (if needed for hybrid approach)
 */
export function getClerkPublishableKey(): string | undefined {
  return process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
}

/**
 * Get Auth JWT Secret for signing access/refresh tokens
 * Prioritize Amplify prefixed vars in production
 */
export function getAuthJwtSecret(): string {
  const secret =
    process.env.AMPLIFY_JWT_SECRET ||
    process.env.JWT_SECRET ||
    process.env.AUTH_JWT_SECRET;
  if (!secret) {
    throw new Error('JWT secret not set. Configure AMPLIFY_JWT_SECRET or JWT_SECRET');
  }
  return secret;
}

/**
 * Get Backend API Base URL for OAuth and API calls
 * Returns the backend server URL (e.g., "http://localhost:8080" or "https://api.yourdomain.com")
 * Amplify may expose this as AMPLIFY_NEXT_PUBLIC_API_BASE_URL at runtime.
 */
export function getBackendApiUrl(): string {
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.AMPLIFY_NEXT_PUBLIC_API_BASE_URL ||
    'http://localhost:8080'
  );
}

/** Same as {@link getBackendApiUrl} — name aligned with project API rules (`getApiBaseUrl`). */
export const getApiBaseUrl = getBackendApiUrl;

/**
 * Get feature flag for Stripe Checkout migration
 * Returns true if we should use Stripe Checkout Sessions instead of Payment Intents
 * Defaults to false (use Payment Intent flow) for backward compatibility
 * Set NEXT_PUBLIC_USE_STRIPE_CHECKOUT=true to enable Checkout Session flow
 */
export function useStripeCheckout(): boolean {
  return process.env.NEXT_PUBLIC_USE_STRIPE_CHECKOUT === 'true';
}

/** Default page size for list GETs when not provided. Override via NEXT_PUBLIC_DEFAULT_PAGE_SIZE (e.g. 100). */
export const DEFAULT_PAGE_SIZE = 20;

/**
 * Returns default page size for list endpoints (proxy and admin server actions).
 * Use NEXT_PUBLIC_DEFAULT_PAGE_SIZE to override (e.g. 100) without code changes.
 */
export function getDefaultPageSize(): number {
  const env = process.env.NEXT_PUBLIC_DEFAULT_PAGE_SIZE ?? process.env.AMPLIFY_NEXT_PUBLIC_DEFAULT_PAGE_SIZE;
  if (env) {
    const n = parseInt(env, 10);
    if (!isNaN(n) && n > 0) return n;
  }
  return DEFAULT_PAGE_SIZE;
}

/**
 * Appends tenantId.equals to params only when tenantId is provided (non-empty).
 * Use in admin server actions for optional tenant scoping; omit for wildcard (all tenants).
 */
export function appendTenantIfPresent(params: URLSearchParams, tenantId: string | undefined): void {
  if (tenantId != null && String(tenantId).trim() !== '') {
    params.append('tenantId.equals', String(tenantId).trim());
  }
}

/**
 * Resolves tenant for requests: use only the explicitly provided tenantId (e.g. from form/input or ?tenant=).
 * Never falls back to env — app is tenant-agnostic; tenantId is only added when the caller provides it.
 */
export function effectiveTenantId(tenantId?: string): string | undefined {
  if (tenantId != null && String(tenantId).trim() !== '') return String(tenantId).trim();
  return undefined;
}