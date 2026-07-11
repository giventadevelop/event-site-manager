#!/usr/bin/env node

/**
 * Full E2E orchestrator for event-site-manager (platform admin).
 *
 * Steps (full):
 *   1. Generate route inventory
 *   2. Public dynamic demo smoke
 *   3. Admin comprehensive + dynamic (legacy) — skipped with --quick / --skip-legacy-admin
 *   4. Admin CRUD (scoped with ?tenant=)
 *   5. Inventory smoke: admin + public
 *
 * --quick runs: inventory → public dynamic → CRUD → smoke admin → smoke public
 *   (does NOT run comprehensive-admin / admin-test-report.html)
 *
 * Tenant: --tenant=<id> | TEST_TENANT_ID | E2E_TENANT_ID | auth.json.tenantId | tenant_demo_002
 *
 * Usage:
 *   node TestSprite/run-e2e-full.js --quick --tenant=tenant_demo_002 --port=3001
 *   npm run test:e2e:quick -- --tenant=tenant_demo_002 --port=3001
 *   (default base URL is http://localhost:3001; use --port=3000 if needed)
 */

import { spawnSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  assertDemoTenant,
  resolveReachableBaseUrl,
  resolveBaseUrl,
  loadAuthJson,
  requireAuthJson,
  REPORTS_DIR,
  ensureDir,
  parseTenantCliArg,
  DEFAULT_E2E_BASE_URL,
} from './lib/e2e-harness.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
const skipCrud = args.includes('--skip-crud');
const skipLegacyAdmin = args.includes('--skip-legacy-admin') || args.includes('--quick');
const isQuick = args.includes('--quick');

function forwardArgs() {
  return args.filter(
    (a) =>
      a.startsWith('--base-url=') ||
      a.startsWith('--port=') ||
      a.startsWith('--tenant=')
  );
}

function run(label, scriptRel, extra = []) {
  console.log(`\n${'='.repeat(60)}\n▶ ${label}\n${'='.repeat(60)}`);
  const scriptPath = path.join(__dirname, scriptRel);
  const result = spawnSync(
    process.execPath,
    [scriptPath, ...extra, ...forwardArgs()],
    {
      stdio: 'inherit',
      cwd: ROOT,
      shell: false,
      env: process.env,
    }
  );
  const code = result.status ?? 1;
  return { label, code };
}

function printPlan(baseUrl, tenantId) {
  const mode = isQuick ? 'QUICK (--quick)' : skipLegacyAdmin ? 'FULL (legacy admin skipped)' : 'FULL';
  console.log(`\n${'='.repeat(60)}`);
  console.log(`[e2e-full] Mode: ${mode}`);
  console.log(`[e2e-full] baseUrl: ${baseUrl}`);
  console.log(`[e2e-full] tenantId: ${tenantId}`);
  console.log(`[e2e-full] Planned steps:`);
  console.log(`  1. Generate route inventory`);
  console.log(`  2. Public dynamic demo`);
  if (!skipLegacyAdmin) {
    console.log(`  3. Admin comprehensive  → writes admin-tests/admin-test-report.html`);
    console.log(`  4. Admin dynamic events`);
  } else {
    console.log(`  — SKIP Admin comprehensive / dynamic (not part of --quick)`);
    console.log(`    (admin-test-report.html is from: npm run test:admin:all)`);
  }
  if (!skipCrud) {
    console.log(`  ${skipLegacyAdmin ? '3' : '5'}. Admin CRUD demo tenant`);
  } else {
    console.log(`  — SKIP Admin CRUD`);
  }
  console.log(`  ${skipLegacyAdmin ? (skipCrud ? '3' : '4') : '6'}. Inventory smoke: admin`);
  console.log(`  ${skipLegacyAdmin ? (skipCrud ? '4' : '5') : '7'}. Inventory smoke: public`);
  console.log(`[e2e-full] Reports: TestSprite/reports/coverage-*.html (+ LOOP_LOG.md)`);
  console.log(`${'='.repeat(60)}\n`);
}

async function main() {
  ensureDir(REPORTS_DIR);
  const logPath = path.join(REPORTS_DIR, 'LOOP_LOG.md');
  if (!fs.existsSync(logPath)) {
    fs.writeFileSync(
      logPath,
      '# E2E Loop Log (event-site-manager)\n\nAppend-only progress for platform-admin E2E.\n',
      'utf8'
    );
  }

  const tenantId = assertDemoTenant();
  process.env.TEST_TENANT_ID = process.env.TEST_TENANT_ID || tenantId;
  process.env.E2E_TENANT_ID = process.env.E2E_TENANT_ID || tenantId;
  process.env.E2E_EXPECTED_TENANT = process.env.E2E_EXPECTED_TENANT || tenantId;

  const auth = loadAuthJson();
  requireAuthJson();
  const preferred = resolveBaseUrl(auth?.baseUrl || DEFAULT_E2E_BASE_URL);
  const baseUrl = await resolveReachableBaseUrl(preferred);

  printPlan(baseUrl, tenantId);

  const results = [];
  const started = new Date().toISOString();
  fs.appendFileSync(
    logPath,
    `\n# Full run started ${started}\n- baseUrl: ${baseUrl}\n- tenantId: ${tenantId}\n- mode: ${isQuick ? 'quick' : 'full'}\n- skipCrud: ${skipCrud} skipLegacyAdmin: ${skipLegacyAdmin}\n- cliTenant: ${parseTenantCliArg() || '(none)'}\n`,
    'utf8'
  );

  results.push(run('Generate inventory', 'tools/generate-route-inventory.js'));
  results.push(run('Public dynamic demo', 'sanity-tests/run-public-dynamic-demo-tests.js'));

  if (!skipLegacyAdmin) {
    results.push(run('Admin comprehensive', 'admin-tests/comprehensive-admin-test-suite.js'));
    results.push(run('Admin dynamic events', 'admin-tests/dynamic-event-test-suite.js'));
  }

  if (!skipCrud) {
    results.push(run('Admin CRUD demo tenant', 'admin-tests/admin-crud-demo-tenant-suite.js'));
  }

  results.push(
    run('Inventory smoke: admin', 'sanity-tests/run-inventory-smoke-crawl.js', ['--kind=admin'])
  );
  results.push(
    run('Inventory smoke: public', 'sanity-tests/run-inventory-smoke-crawl.js', ['--kind=public'])
  );

  console.log(`\n${'='.repeat(60)}\nE2E FULL SUMMARY\n${'='.repeat(60)}`);
  let failed = 0;
  for (const r of results) {
    const ok = r.code === 0;
    if (!ok) failed += 1;
    console.log(`  ${ok ? '✓' : '✗'} ${r.label} (exit ${r.code})`);
  }

  fs.appendFileSync(
    logPath,
    `\n## Full run finished ${new Date().toISOString()}\n` +
      results.map((r) => `- ${r.code === 0 ? 'PASS' : 'FAIL'} ${r.label} (${r.code})`).join('\n') +
      `\n`,
    'utf8'
  );

  if (failed > 0) {
    console.error(`\n${failed} suite(s) failed. See TestSprite/reports/ (JSON + HTML).`);
    process.exit(1);
  }
  console.log('\nAll orchestrated suites completed successfully.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
