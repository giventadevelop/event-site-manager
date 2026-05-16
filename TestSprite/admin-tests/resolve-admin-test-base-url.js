/**
 * Resolves the admin Playwright base URL (first match wins).
 *
 * 1. CLI: --port=3001 → http://localhost:3001
 * 2. CLI: --base-url=http://127.0.0.1:3001 (any host/path)
 * 3. Env (full URL): TEST_BASE_URL, PLAYWRIGHT_BASE_URL, or ADMIN_TEST_BASE_URL
 * 4. Env (port only): TEST_PORT, then PORT → http://localhost:<port>
 * 5. auth.json baseUrl (or BASE_URL key)
 * 6. Fallback: http://localhost:3000
 *
 * Prefer TEST_PORT over PORT when something else sets PORT and you do not want tests to follow it.
 */
import { readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function normalizeBaseUrl(u) {
  if (typeof u !== 'string' || !u.trim()) return null;
  return u.trim().replace(/\/$/, '');
}

function parseCli(argv) {
  let port = null;
  let baseUrl = null;
  for (const arg of argv) {
    if (arg.startsWith('--port=')) {
      port = arg.slice('--port='.length).trim();
    } else if (arg.startsWith('--base-url=')) {
      baseUrl = arg.slice('--base-url='.length).trim();
    }
  }
  return { port, baseUrl };
}

function readAuthJsonBaseUrl() {
  const path = join(__dirname, 'auth.json');
  if (!existsSync(path)) return null;
  try {
    const j = JSON.parse(readFileSync(path, 'utf8'));
    const u = j.baseUrl ?? j.BASE_URL;
    return normalizeBaseUrl(u);
  } catch {
    return null;
  }
}

/**
 * @param {string[]} [argv] defaults to process.argv.slice(2)
 * @returns {string} origin with no trailing slash
 */
export function resolveAdminTestBaseUrl(argv = process.argv.slice(2)) {
  const { port, baseUrl: cliBase } = parseCli(argv);

  if (port) {
    const p = String(port).replace(/^:+/, '');
    if (/^\d+$/.test(p)) return `http://localhost:${p}`;
  }

  if (cliBase) {
    const n = normalizeBaseUrl(cliBase);
    if (n) return n;
  }

  for (const key of ['TEST_BASE_URL', 'PLAYWRIGHT_BASE_URL', 'ADMIN_TEST_BASE_URL']) {
    const n = normalizeBaseUrl(process.env[key]);
    if (n) return n;
  }

  const testPort = process.env.TEST_PORT;
  if (testPort && String(testPort).trim()) {
    const p = String(testPort).trim().replace(/^:+/, '');
    if (/^\d+$/.test(p)) return `http://localhost:${p}`;
  }

  const portEnv = process.env.PORT;
  if (portEnv && String(portEnv).trim()) {
    const p = String(portEnv).trim().replace(/^:+/, '');
    if (/^\d+$/.test(p)) return `http://localhost:${p}`;
  }

  const fromAuth = readAuthJsonBaseUrl();
  if (fromAuth) return fromAuth;

  return 'http://localhost:3000';
}
