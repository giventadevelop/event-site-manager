/**
 * Clerk email/password sign-in helper for Playwright admin suites.
 * Credentials: TEST_ADMIN_EMAIL / TEST_ADMIN_PASSWORD env vars, or admin-tests/auth.json (gitignored).
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ADMIN_AUTH_STATE = join(__dirname, '../admin-tests/.auth-state.json');
const ADMIN_CREDS = join(__dirname, '../admin-tests/auth.json');

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export function readAdminCredentials() {
  const e = process.env.TEST_ADMIN_EMAIL;
  const p = process.env.TEST_ADMIN_PASSWORD;
  if (e && p) return { email: e, password: p };
  if (existsSync(ADMIN_CREDS)) {
    const j = JSON.parse(readFileSync(ADMIN_CREDS, 'utf8'));
    if (j.email && j.password) return { email: j.email, password: j.password };
  }
  throw new Error(
    'Admin test credentials missing. Set TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD, or copy TestSprite/admin-tests/auth.json.example to auth.json'
  );
}

export function loadAuthState() {
  if (!existsSync(ADMIN_AUTH_STATE)) return null;
  try {
    return JSON.parse(readFileSync(ADMIN_AUTH_STATE, 'utf8'));
  } catch {
    return null;
  }
}

export function saveAuthState(state) {
  mkdirSync(dirname(ADMIN_AUTH_STATE), { recursive: true });
  writeFileSync(ADMIN_AUTH_STATE, JSON.stringify(state, null, 2), 'utf8');
}

/**
 * @param {import('playwright').Page} page
 * @param {string} baseUrl
 * @param {{ email: string; password: string }} credentials
 */
export async function authenticatePage(page, baseUrl, credentials) {
  await page.goto(`${baseUrl}/sign-in`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});

  const emailSelectors = [
    'input[name="identifier"]',
    'input[type="email"]',
    'input[id*="email" i]',
    'input[placeholder*="email" i]',
  ];

  let emailField = null;
  for (const selector of emailSelectors) {
    emailField = await page.$(selector).catch(() => null);
    if (emailField) break;
  }
  if (!emailField) throw new Error('Email field not found on sign-in page');

  await emailField.fill(credentials.email);

  const passwordSelectors = ['input[name="password"]', 'input[type="password"]', 'input[id*="password" i]'];
  let passwordField = null;
  for (const selector of passwordSelectors) {
    passwordField = await page.$(selector).catch(() => null);
    if (passwordField) break;
  }
  if (!passwordField) throw new Error('Password field not found on sign-in page');

  await passwordField.fill(credentials.password);
  await passwordField.press('Enter');
  await delay(2000);

  if (page.url().includes('/sign-in')) {
    const submitSelectors = [
      'button[type="submit"]',
      'button:has-text("Sign in")',
      'button:has-text("Continue")',
      '[role="button"]:has-text("Sign")',
    ];
    let submitted = false;
    for (const selector of submitSelectors) {
      try {
        const button = await page.$(selector);
        if (button) {
          const isVisible = await button.isVisible().catch(() => false);
          const isEnabled = await button.isEnabled().catch(() => false);
          if (isVisible && isEnabled) {
            await button.click();
            submitted = true;
            break;
          }
        }
      } catch {
        /* try next */
      }
    }
    if (!submitted) {
      const buttons = await page.$$('button');
      for (const button of buttons) {
        const text = await button.textContent().catch(() => '');
        if (text && (text.includes('Sign') || text.includes('Continue'))) {
          const isVisible = await button.isVisible().catch(() => false);
          const isEnabled = await button.isEnabled().catch(() => false);
          if (isVisible && isEnabled) {
            await button.click();
            break;
          }
        }
      }
    }
  }

  let checkCount = 0;
  const maxChecks = 15;
  while (checkCount < maxChecks) {
    await delay(2000);
    const currentUrl = page.url();
    checkCount++;

    if (!currentUrl.includes('/sign-in') && !currentUrl.includes('/sign-up')) {
      if (
        currentUrl.includes('google') ||
        currentUrl.includes('microsoft') ||
        currentUrl.includes('github') ||
        currentUrl.includes('facebook')
      ) {
        throw new Error(
          'OAuth redirect detected — use an email/password Clerk user for admin tests (see .cursor/rules/playwright_testing_middleware_fixes.mdc).'
        );
      }
      break;
    }

    if (currentUrl.includes('/sign-in')) {
      const errorSelectors = [
        '[class*="error"][class*="message"]',
        '[class*="alert"][class*="error"]',
        '[role="alert"]',
        'div[class*="cl-error"]',
      ];
      for (const selector of errorSelectors) {
        const errorElement = await page.$(selector);
        if (errorElement) {
          const isVisible = await errorElement.isVisible().catch(() => false);
          if (isVisible) {
            const text = await errorElement.textContent().catch(() => '');
            if (
              text &&
              (text.toLowerCase().includes('invalid') ||
                text.toLowerCase().includes('incorrect') ||
                text.includes('401') ||
                text.includes('403'))
            ) {
              throw new Error(`Authentication error: ${text.trim()}`);
            }
          }
        }
      }
    }
  }

  await page.goto(`${baseUrl}/admin`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});
  const verificationUrl = page.url();
  if (verificationUrl.includes('/sign-in')) {
    throw new Error('Authentication failed — still redirected to sign-in when opening /admin');
  }
}
