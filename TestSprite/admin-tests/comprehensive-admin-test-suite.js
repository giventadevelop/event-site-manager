/**
 * Playwright admin smoke tests — includes Event Analytics (/admin/event-analytics),
 * Manage Events (/admin/manage-events), Manage Users (/admin/manage-usage),
 * Bulk Email hub (/admin/bulk-email), and Manage Focus Groups (/admin/focus-groups).
 *
 * Usage:
 *   PLAYWRIGHT_BASE_URL=http://localhost:3004 npm run test:admin
 *
 * Credentials: TEST_ADMIN_EMAIL / TEST_ADMIN_PASSWORD, or copy auth.json.example → auth.json
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import {
  authenticatePage,
  loadAuthState,
  saveAuthState,
  readAdminCredentials,
} from '../sanity-tests/authenticate-playwright.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCREENSHOT_DIR = join(__dirname, 'screenshots');

function baseUrl() {
  return (
    process.env.PLAYWRIGHT_BASE_URL ||
    process.env.BASE_URL ||
    process.env.TEST_BASE_URL ||
    'http://localhost:3000'
  ).replace(/\/$/, '');
}

async function screenshotOnError(page, label) {
  try {
    mkdirSync(SCREENSHOT_DIR, { recursive: true });
    const safe = label.replace(/[^a-z0-9-_]+/gi, '_');
    await page.screenshot({ path: join(SCREENSHOT_DIR, `error-${safe}-${Date.now()}.png`), fullPage: true });
  } catch {
    /* ignore */
  }
}

/**
 * @param {import('playwright').Browser} browser
 */
async function getAuthenticatedContext(browser) {
  const url = baseUrl();
  const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  let saved = loadAuthState();

  if (saved) {
    const ctx = await browser.newContext({ userAgent: ua, storageState: saved });
    const page = await ctx.newPage();
    try {
      await page.goto(`${url}/admin`, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
      const u = page.url();
      await page.close();
      if (!u.includes('/sign-in')) return ctx;
      await ctx.close();
      console.warn('[admin-tests] Saved auth state invalid (redirected to sign-in); re-authenticating…');
    } catch (e) {
      await page.close().catch(() => {});
      await ctx.close();
      console.warn('[admin-tests] Saved auth validation failed:', e.message);
    }
  }

  const context = await browser.newContext({ userAgent: ua });
  const page = await context.newPage();
  const creds = readAdminCredentials();
  await authenticatePage(page, url, creds);
  saveAuthState(await context.storageState());
  await page.close();
  return context;
}

/**
 * Smoke test for Manage Events (/admin/manage-events): search, filters, event list or empty states.
 *
 * @param {import('playwright').Page} page
 */
async function assertAdminManageEvents(page) {
  const url = baseUrl();
  await page.goto(`${url}/admin/manage-events`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});

  if (page.url().includes('/sign-in')) {
    throw new Error('Manage events: unauthenticated (redirected to sign-in)');
  }

  await page.getByRole('heading', { name: /Manage Events/i }).waitFor({ state: 'visible', timeout: 30000 });
  await page
    .getByText(/Create, edit, and manage all events/i)
    .first()
    .waitFor({ state: 'visible', timeout: 15000 });

  await page.getByRole('link', { name: 'Back to Admin' }).first().waitFor({ state: 'visible' });
  await page.getByRole('link', { name: 'Create Event' }).first().waitFor({ state: 'visible' });

  await page.getByRole('link', { name: 'Create New Event' }).first().waitFor({ state: 'visible' });
  await page.getByRole('link', { name: 'Event Analytics Dashboard' }).first().waitFor({ state: 'visible' });
  await page.getByRole('link', { name: 'Manage Usage' }).first().waitFor({ state: 'visible' });
  await page.getByRole('link', { name: 'Communication Center' }).first().waitFor({ state: 'visible' });

  await page.getByText('Search Events').first().waitFor({ state: 'visible', timeout: 15000 });
  await page.getByRole('textbox', { name: /Filter by Tenant ID/i }).waitFor({ state: 'visible' });

  await page.getByText('Search By', { exact: true }).first().waitFor({ state: 'visible' });
  await page.getByPlaceholder('Search by title').waitFor({ state: 'visible', timeout: 15000 });

  const admissionSelect = page.locator('select').filter({ has: page.locator('option', { hasText: 'Paid' }) }).first();
  await admissionSelect.waitFor({ state: 'visible' });
  const sortSelect = page.locator('select').filter({ has: page.locator('option', { hasText: 'Date (Earliest)' }) }).first();
  await sortSelect.waitFor({ state: 'visible' });

  await page.getByText('Future Events', { exact: true }).first().waitFor({ state: 'visible' });
  await page.getByText('Past Events', { exact: true }).first().waitFor({ state: 'visible' });
  await page.getByRole('button', { name: /Show Past Events|Show Future Events/ }).first().waitFor({ state: 'visible' });

  const loadingImg = page.getByRole('img', { name: 'Loading events...' });
  if ((await loadingImg.count()) > 0) {
    await loadingImg.first().waitFor({ state: 'detached', timeout: 60000 });
  }

  const eventInfoTh = page.locator('th').filter({ hasText: /^Event Info$/ });
  const hasTable = await eventInfoTh.first().isVisible().catch(() => false);

  if (hasTable) {
    for (const h of ['Event Info', 'Type', 'Dates', 'Active', 'Edit/View', 'Media', 'Upload', 'Calendar', 'Tickets']) {
      await page.locator('th').filter({ hasText: new RegExp(`^${h}$`) }).first().waitFor({ state: 'visible' });
    }
    await page.locator('th').filter({ hasText: /^Deactivate$/ }).first().waitFor({ state: 'visible' });
    await page.locator('th').filter({ hasText: /^Hard Delete$/ }).first().waitFor({ state: 'visible' });

    await page.getByRole('button', { name: 'Previous Page' }).first().waitFor({ state: 'visible' });
    await page.getByRole('button', { name: 'Next Page' }).first().waitFor({ state: 'visible' });
    await page.getByText(/Page\s+\d+\s+of\s+\d+/).first().waitFor({ state: 'visible', timeout: 15000 });
  } else {
    await page
      .getByText(
        /There are no events listed yet|No future events created|Here is the list of recent events|No events found|No events match your current search criteria/i,
      )
      .first()
      .waitFor({ state: 'visible', timeout: 20000 });
  }
}

/**
 * Smoke test for Event Analytics Dashboard (/admin/event-analytics): stats cards,
 * feature cards, and quick action links.
 *
 * @param {import('playwright').Page} page
 */
async function assertAdminEventAnalytics(page) {
  const url = baseUrl();
  await page.goto(`${url}/admin/event-analytics`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});

  if (page.url().includes('/sign-in')) {
    throw new Error('Event analytics: unauthenticated (redirected to sign-in)');
  }

  await page.getByRole('heading', { name: /Event Analytics Dashboard/i }).first().waitFor({ state: 'visible', timeout: 30000 });
  await page
    .getByText(/View comprehensive event analytics, registration trends, and performance metrics/i)
    .first()
    .waitFor({ state: 'visible', timeout: 15000 });

  for (const stat of ['Total Events', 'Total Registrations', 'Active Events', 'Reports Generated']) {
    await page.getByText(stat, { exact: true }).first().waitFor({ state: 'visible' });
  }

  for (const cardTitle of [
    'Event Analytics Dashboard',
    'Registration Management',
    'Event Management',
    'Create New Event',
    'Event Settings',
    'Reports & Exports',
  ]) {
    await page.getByRole('heading', { name: cardTitle }).first().waitFor({ state: 'visible' });
  }

  await page.getByRole('heading', { name: 'Quick Actions' }).first().waitFor({ state: 'visible' });
  await page.getByRole('link', { name: 'Create New Event' }).first().waitFor({ state: 'visible' });
  await page.getByRole('link', { name: 'View Analytics' }).first().waitFor({ state: 'visible' });
  await page.getByRole('link', { name: 'Manage Registrations' }).first().waitFor({ state: 'visible' });
  await page.getByRole('link', { name: 'Export Data' }).first().waitFor({ state: 'visible' });

  const links = [
    '/admin/events/dashboard',
    '/admin/events/registrations',
    '/admin/events/new',
    '/admin/events/settings',
    '/admin/events/reports',
  ];
  for (const href of links) {
    await page.locator(`a[href="${href}"]`).first().waitFor({ state: 'visible' });
  }
}

/**
 * Smoke test for Manage Users (/admin/manage-usage): filters, table, pagination, bulk actions UI.
 *
 * @param {import('playwright').Page} page
 */
async function assertAdminManageUsage(page) {
  const url = baseUrl();
  await page.goto(`${url}/admin/manage-usage`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});

  if (page.url().includes('/sign-in')) {
    throw new Error('Manage usage: unauthenticated (redirected to sign-in)');
  }

  await page.getByRole('heading', { name: /Manage Users/i }).waitFor({ state: 'visible', timeout: 30000 });
  await page
    .getByText(/Manage user profiles, roles, and statuses/i)
    .first()
    .waitFor({ state: 'visible', timeout: 15000 });

  await page.getByRole('button', { name: /Bulk Upload User List/i }).waitFor({ state: 'visible', timeout: 15000 });
  await page.getByRole('link', { name: /Download Bulk Upload Template File/i }).waitFor({ state: 'visible', timeout: 15000 });

  await page.getByRole('textbox', { name: /Filter by Tenant ID/i }).waitFor({ state: 'visible' });

  await page.getByPlaceholder('Search by First Name...').waitFor({ state: 'visible', timeout: 15000 });

  const statusSelect = page.locator('select').filter({ has: page.locator('option', { hasText: 'All Statuses' }) }).first();
  await statusSelect.waitFor({ state: 'visible' });
  const roleSelect = page.locator('select').filter({ has: page.locator('option', { hasText: 'All Roles' }) }).first();
  await roleSelect.waitFor({ state: 'visible' });

  for (const h of ['Name', 'Contact', 'Role', 'Status', 'Joined', 'Actions']) {
    await page.locator('th').filter({ hasText: new RegExp(`^${h}$`, 'i') }).first().waitFor({ state: 'visible' });
  }

  await page
    .locator('button[aria-label="Edit User"]')
    .or(page.getByText('No users found'))
    .first()
    .waitFor({ state: 'visible', timeout: 45000 });

  await page.getByRole('button', { name: 'Previous Page' }).first().waitFor({ state: 'visible' });
  await page.getByRole('button', { name: 'Next Page' }).first().waitFor({ state: 'visible' });

  await page.getByText(/Page\s+\d+\s+of\s+\d+/).first().waitFor({ state: 'visible', timeout: 10000 });

  const editBtn = page.getByRole('button', { name: 'Edit User' }).first();
  if (await editBtn.isVisible()) {
    await editBtn.click();
    await page.getByRole('heading', { name: 'Edit User', level: 2 }).waitFor({ state: 'visible', timeout: 15000 });
    await page.getByRole('button', { name: 'Close modal' }).click();
    await page.getByRole('heading', { name: 'Edit User', level: 2 }).waitFor({ state: 'hidden', timeout: 10000 });
  }
}

/**
 * Smoke test for Bulk Email hub (/admin/bulk-email): admin nav, hub heading, and
 * entry cards to promotion vs newsletter flows.
 *
 * @param {import('playwright').Page} page
 */
async function assertAdminBulkEmail(page) {
  const url = baseUrl();
  await page.goto(`${url}/admin/bulk-email`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});

  if (page.url().includes('/sign-in')) {
    throw new Error('Bulk email: unauthenticated (redirected to sign-in)');
  }

  await page.getByRole('heading', { name: /Bulk Email Management/i }).waitFor({ state: 'visible', timeout: 30000 });
  await page
    .getByText(/Send bulk emails to your members and subscribers/i)
    .first()
    .waitFor({ state: 'visible', timeout: 15000 });

  await page.getByRole('link', { name: /Admin Home/i }).first().waitFor({ state: 'visible', timeout: 15000 });
  await page.getByRole('link', { name: /^Bulk Email$/ }).first().waitFor({ state: 'visible', timeout: 15000 });

  await page.getByRole('heading', { name: 'Promotional Emails for Events' }).first().waitFor({ state: 'visible' });
  await page
    .getByText(/Create and send promotional emails for specific events/i)
    .first()
    .waitFor({ state: 'visible' });
  for (const line of [
    'Create event-specific email templates',
    'Send test emails before bulk sending',
    'Send to all members or specific groups',
    'Track email history and delivery status',
  ]) {
    await page.getByText(line, { exact: true }).first().waitFor({ state: 'visible', timeout: 10000 });
  }
  const promoCard = page.locator('a[href="/admin/promotion-emails"]').first();
  await promoCard.waitFor({ state: 'visible' });

  await page.getByRole('heading', { name: 'Newsletter Emails' }).first().waitFor({ state: 'visible' });
  await page
    .getByText(/Create and send newsletter emails with news and updates/i)
    .first()
    .waitFor({ state: 'visible' });
  await page.getByText('Create newsletter email templates', { exact: true }).first().waitFor({ state: 'visible' });
  for (const line of [
    'Send test emails before bulk sending',
    'Send to all members or specific groups',
    'Track email history and delivery status',
  ]) {
    await page.getByText(line, { exact: true }).nth(1).waitFor({ state: 'visible', timeout: 10000 });
  }
  const newsletterCard = page.locator('a[href="/admin/newsletter-emails"]').first();
  await newsletterCard.waitFor({ state: 'visible' });
}

async function assertAdminFocusGroupsList(page) {
  const url = baseUrl();
  await page.goto(`${url}/admin/focus-groups`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});

  if (page.url().includes('/sign-in')) {
    throw new Error('Focus groups list: unauthenticated (redirected to sign-in)');
  }

  await page.getByRole('heading', { name: /Manage Focus Groups/i }).waitFor({ state: 'visible', timeout: 30000 });

  const newGroup = page.locator('a[href="/admin/focus-groups/new"]').first();
  await newGroup.waitFor({ state: 'visible', timeout: 15000 });
  const newText = await newGroup.textContent();
  if (!newText || !newText.includes('New Group')) {
    throw new Error('Focus groups: "New Group" link missing or wrong label');
  }

  await page.locator('th').filter({ hasText: /^Name$/i }).first().waitFor({ state: 'visible' });
  await page.locator('th').filter({ hasText: /^Slug$/i }).first().waitFor({ state: 'visible' });
  await page.locator('th').filter({ hasText: /^Active$/i }).first().waitFor({ state: 'visible' });
  await page.locator('th').filter({ hasText: /^Actions$/i }).first().waitFor({ state: 'visible' });

  await page.getByRole('link', { name: 'Previous Page' }).first().waitFor({ state: 'visible' });
  await page.getByRole('link', { name: 'Next Page' }).first().waitFor({ state: 'visible' });

  const body = await page.textContent('body');
  const hasEmpty = body.includes('No focus groups found');
  const hasRows = await page.locator('table tbody tr').count();
  if (!hasEmpty && hasRows < 1) {
    throw new Error('Focus groups: expected either data rows or empty-state message');
  }

  if (hasRows > 0 && !hasEmpty) {
    const edit = page.getByRole('link', { name: 'Edit Focus Group' }).first();
    await edit.waitFor({ state: 'visible', timeout: 10000 });
    await page.getByRole('link', { name: 'Manage Events' }).first().waitFor({ state: 'visible' });
    await page.getByRole('link', { name: 'Manage Members' }).first().waitFor({ state: 'visible' });
  }
}

/**
 * @param {import('playwright').Page} page
 */
async function assertAdminFocusGroupsNew(page) {
  const url = baseUrl();
  await page.goto(`${url}/admin/focus-groups/new`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});

  if (page.url().includes('/sign-in')) {
    throw new Error('Focus groups new: unauthenticated');
  }

  await page.getByRole('heading', { name: /Create Focus Group/i }).waitFor({ state: 'visible', timeout: 30000 });
}

async function run() {
  const headless = process.env.HEADLESS !== 'false';
  const browser = await chromium.launch({ headless });
  let failed = 0;

  try {
    const context = await getAuthenticatedContext(browser);
    const page = await context.newPage();

    const tests = [
      {
        name: 'admin home',
        run: async () => {
          await page.goto(`${baseUrl()}/admin`, { waitUntil: 'domcontentloaded', timeout: 60000 });
          await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});
          if (page.url().includes('/sign-in')) throw new Error('Admin home redirected to sign-in');
        },
      },
      { name: 'admin event analytics', run: () => assertAdminEventAnalytics(page) },
      { name: 'admin manage events', run: () => assertAdminManageEvents(page) },
      { name: 'admin manage usage (manage users)', run: () => assertAdminManageUsage(page) },
      { name: 'admin bulk email hub', run: () => assertAdminBulkEmail(page) },
      { name: 'admin focus groups list', run: () => assertAdminFocusGroupsList(page) },
      { name: 'admin focus groups new', run: () => assertAdminFocusGroupsNew(page) },
    ];

    for (const t of tests) {
      process.stdout.write(`[admin-tests] ${t.name} … `);
      try {
        await t.run();
        console.log('ok');
      } catch (e) {
        console.log('FAIL');
        console.error(e);
        await screenshotOnError(page, t.name);
        failed++;
      }
    }

    await context.close();
  } finally {
    await browser.close();
  }

  if (failed > 0) {
    console.error(`\n[admin-tests] ${failed} test(s) failed.`);
    process.exit(1);
  }
  console.log('\n[admin-tests] All tests passed.');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
