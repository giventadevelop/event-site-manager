/**
 * Quick check: prints the resolved admin test base URL (same rules as other admin scripts).
 *
 *   npm run test:admin:diagnose -- --port=3001
 *   npm run test:admin:diagnose -- --base-url=http://127.0.0.1:3001
 */
import { resolveAdminTestBaseUrl } from './resolve-admin-test-base-url.js';

const base = resolveAdminTestBaseUrl();
console.log('[diagnose-event-discovery] Resolved admin test base URL:', base);
console.log('[diagnose-event-discovery] Extend this script to probe event discovery against that origin.');
process.exit(0);
