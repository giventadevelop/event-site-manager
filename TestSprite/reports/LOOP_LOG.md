# E2E Loop Log (event-site-manager)

Append-only progress for platform-admin E2E.

# Full run started 2026-07-10T21:42:10.136Z
- baseUrl: http://localhost:3000
- tenantId: tenant_demo_002
- mode: quick
- skipCrud: false skipLegacyAdmin: true
- cliTenant: tenant_demo_002

## Full run finished 2026-07-10T21:43:06.606Z
- PASS Generate inventory (0)
- FAIL Public dynamic demo (1)
- FAIL Admin CRUD demo tenant (1)
- FAIL Inventory smoke: admin (1)
- FAIL Inventory smoke: public (1)

# Full run started 2026-07-10T21:51:29.134Z
- baseUrl: http://localhost:3000
- tenantId: tenant_demo_002
- mode: quick
- skipCrud: false skipLegacyAdmin: true
- cliTenant: tenant_demo_002

# Full run started 2026-07-10T22:04:37.690Z
- baseUrl: http://localhost:3001
- tenantId: tenant_demo_002
- mode: quick
- skipCrud: false skipLegacyAdmin: true
- cliTenant: tenant_demo_002

## 2026-07-10T22:07:27.766Z — public-dynamic
- pass: 22 | fail: 0 | skip: 0 | todo: 0
- report: `TestSprite\reports\coverage-public-dynamic-2026-07-10T22-07-27-765Z.json`
- html: `TestSprite\reports\coverage-public-dynamic-2026-07-10T22-07-27-765Z.html`

## 2026-07-10T22:08:15.580Z — admin-crud
- pass: 2 | fail: 4 | skip: 9 | todo: 0
- report: `TestSprite\reports\coverage-admin-crud-2026-07-10T22-08-15-576Z.json`
- html: `TestSprite\reports\coverage-admin-crud-2026-07-10T22-08-15-576Z.html`

## 2026-07-10T22:12:00.831Z — smoke-admin
- pass: 91 | fail: 27 | skip: 0 | todo: 0
- report: `TestSprite\reports\coverage-smoke-admin-2026-07-10T22-12-00-822Z.json`
- html: `TestSprite\reports\coverage-smoke-admin-2026-07-10T22-12-00-822Z.html`

## 2026-07-10T22:17:45.357Z — smoke-public
- pass: 82 | fail: 1 | skip: 0 | todo: 0
- report: `TestSprite\reports\coverage-smoke-public-2026-07-10T22-17-45-355Z.json`
- html: `TestSprite\reports\coverage-smoke-public-2026-07-10T22-17-45-355Z.html`

## Full run finished 2026-07-10T22:17:45.466Z
- PASS Generate inventory (0)
- PASS Public dynamic demo (0)
- FAIL Admin CRUD demo tenant (1)
- FAIL Inventory smoke: admin (1)
- FAIL Inventory smoke: public (1)
