/**
 * Runs comprehensive + dynamic admin suites with the same process.argv
 * (so `npm run test:admin:all -- --port=3001` forwards --port to both children).
 */
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const extraArgs = process.argv.slice(2);
const node = process.execPath;

const scripts = [
  join(__dirname, 'comprehensive-admin-test-suite.js'),
  join(__dirname, 'dynamic-event-test-suite.js'),
];

for (const script of scripts) {
  const r = spawnSync(node, [script, ...extraArgs], {
    stdio: 'inherit',
    env: process.env,
    shell: false,
  });
  const code = r.status;
  if (code !== 0) {
    process.exit(code == null ? 1 : code);
  }
}
