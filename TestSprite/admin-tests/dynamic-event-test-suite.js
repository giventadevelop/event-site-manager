/**
 * Event-scoped admin flows (per-event media, tickets, etc.).
 * Extend this file when you have a stable test event ID in the target environment.
 *
 * Base URL: same as comprehensive suite (CLI --port / --base-url, env, auth.json); see resolve-admin-test-base-url.js.
 *
 * For now exits successfully so `npm run test:admin:all` completes after the static admin suite.
 */
import { resolveAdminTestBaseUrl } from './resolve-admin-test-base-url.js';

const base = resolveAdminTestBaseUrl();
console.info(`[dynamic-event-test-suite] Resolved base URL: ${base}`);
console.info(
  '[dynamic-event-test-suite] Skipped — no fixture event configured. Set ADMIN_TEST_EVENT_ID and add flows when ready.'
);
process.exit(0);
