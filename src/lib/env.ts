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

/**
 * Get the app URL for port-agnostic configuration
 * This is used for server-side API calls to ensure the application works on any port
 * Returns the full URL including protocol (e.g., "http://localhost:3000" or "https://mcefee.org")
 *
 * IMPORTANT: This function should NOT have hardcoded fallbacks. The actual host should be
 * determined from the request context or environment variables to avoid hardcoding issues.
 *
 * CRITICAL: In AWS Amplify production, environment variables are prefixed with AMPLIFY_
 * This function prioritizes AMPLIFY_NEXT_PUBLIC_APP_URL for production compatibility.
 */
export function getAppUrl(): string {
  // Prioritize AMPLIFY_ prefix for AWS Amplify production (matches next.config.mjs pattern)
  const appUrl =
    process.env.AMPLIFY_NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL;

  // In production, use the actual domain from environment variable
  if (process.env.NODE_ENV === 'production') {
    if (!appUrl) {
      console.error('[getAppUrl] CRITICAL: NEXT_PUBLIC_APP_URL not set in production. Check AMPLIFY_NEXT_PUBLIC_APP_URL or NEXT_PUBLIC_APP_URL environment variable.');
    }
    return appUrl || '';
  }
  // In development, use localhost with dynamic port detection
  return appUrl || 'http://localhost:3000';
}

/**
 * Get the email host URL prefix for QR code generation
 * This is used to ensure QR codes work properly in email contexts
 * Returns the full URL including protocol (e.g., "http://localhost:3000" or "https://mcefee.org")
 *
 * IMPORTANT: This function should NOT have hardcoded fallbacks. The actual host should be
 * determined from the request context or environment variables to avoid hardcoding issues.
 *
 * CRITICAL: In AWS Amplify production, environment variables are prefixed with AMPLIFY_
 * This function prioritizes AMPLIFY_NEXT_PUBLIC_APP_URL for production compatibility.
 */
export function getEmailHostUrlPrefix(): string {
  // Prioritize AMPLIFY_ prefix for AWS Amplify production (matches next.config.mjs pattern)
  const appUrl =
    process.env.AMPLIFY_NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL;

  // In production, use the actual domain from environment variable
  if (process.env.NODE_ENV === 'production') {
    if (!appUrl) {
      console.error('[getEmailHostUrlPrefix] CRITICAL: NEXT_PUBLIC_APP_URL not set in production. Check AMPLIFY_NEXT_PUBLIC_APP_URL or NEXT_PUBLIC_APP_URL environment variable.');
    }
    return appUrl || '';
  }
  // In development, use localhost with dynamic port detection
  return appUrl || 'http://localhost:3000';
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