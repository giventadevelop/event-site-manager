/**
 * Event-scoped admin flows (per-event media, tickets, etc.).
 * Extend this file when you have a stable test event ID in the target environment.
 *
 * For now exits successfully so `npm run test:admin:all` completes after the static admin suite.
 */
console.info(
  '[dynamic-event-test-suite] Skipped — no fixture event configured. Set ADMIN_TEST_EVENT_ID and add flows when ready.'
);
process.exit(0);
