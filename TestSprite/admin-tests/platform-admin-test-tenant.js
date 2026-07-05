/**
 * Platform admin tenant context for Playwright admin tests.
 *
 * event-site-manager is a multi-tenant platform admin app: list/mutation APIs expect
 * an explicit tenant scope via ?tenant= (AdminTenantContext / AdminTenantFilterField).
 * There is no NEXT_PUBLIC_TENANT_ID default for admin operations.
 *
 * Override order: TEST_TENANT_ID env → auth.json tenantId → tenant_demo_002
 */

export const DEFAULT_PLATFORM_ADMIN_TEST_TENANT_ID = 'tenant_demo_002';

/** Debounce on AdminTenantFilterField / AdminTenantLayoutClient (ms) + buffer */
const TENANT_COMMIT_WAIT_MS = 600;

/**
 * @param {Record<string, unknown>} [authJson]
 * @returns {string}
 */
export function resolveTestTenantId(authJson = {}) {
  const fromEnv = process.env.TEST_TENANT_ID?.trim();
  if (fromEnv) return fromEnv;

  const fromAuth = typeof authJson.tenantId === 'string' ? authJson.tenantId.trim() : '';
  if (fromAuth) return fromAuth;

  return DEFAULT_PLATFORM_ADMIN_TEST_TENANT_ID;
}

/**
 * Append ?tenant= when missing (preserves existing query params).
 *
 * @param {string} path - Path + optional query (e.g. /admin/manage-events?foo=1)
 * @param {string} tenantId
 * @param {{ skip?: boolean }} [options]
 * @returns {string}
 */
export function withTenantQuery(path, tenantId, options = {}) {
  if (options.skip || !tenantId || !path) return path;

  const qIndex = path.indexOf('?');
  const pathname = qIndex >= 0 ? path.slice(0, qIndex) : path;
  const search = qIndex >= 0 ? path.slice(qIndex + 1) : '';
  const params = new URLSearchParams(search);

  if (!params.get('tenant')) {
    params.set('tenant', tenantId);
  }

  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

/**
 * After navigation, ensure sticky bar or in-form tenant filter matches (handles debounced URL sync).
 *
 * @param {import('playwright').Page} page
 * @param {string} tenantId
 */
export async function ensureTenantContextOnPage(page, tenantId) {
  if (!tenantId) return;

  try {
    const current = new URL(page.url());
    if (current.searchParams.get('tenant') === tenantId) {
      return;
    }
  } catch {
    /* ignore invalid URL during redirects */
  }

  const topBar = page.locator('#admin-tenant-id');
  const filterField = page.locator('#admin-filter-tenant-id');

  if (await topBar.isVisible().catch(() => false)) {
    await topBar.fill(tenantId);
    await topBar.blur();
    await page.waitForTimeout(TENANT_COMMIT_WAIT_MS);
    return;
  }

  if (await filterField.isVisible().catch(() => false)) {
    await filterField.fill(tenantId);
    await filterField.blur();
    await page.waitForTimeout(TENANT_COMMIT_WAIT_MS);
  }
}

/**
 * Build full admin test URL with tenant query when applicable.
 *
 * @param {string} baseUrl
 * @param {string} path
 * @param {string} tenantId
 * @param {{ skipTenantContext?: boolean }} [test]
 */
export function buildAdminTestUrl(baseUrl, path, tenantId, test = {}) {
  const scopedPath = withTenantQuery(path, tenantId, { skip: test.skipTenantContext });
  return `${baseUrl}${scopedPath}`;
}
