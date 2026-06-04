# Batch Job Dashboard Notes

New admin page:

- `/admin/batch-jobs`

## Features

- Job execution history table with server-side filters and pagination.
- Failed jobs panel.
- Running jobs panel.
- Configured jobs panel.
- Execution details viewer.

## Backend Contract

The page uses `event-site-manager` server actions to call:

- `GET /api/admin/batch-jobs/executions`
- `GET /api/admin/batch-jobs/executions/{id}`
- `GET /api/admin/batch-jobs/executions/failed`
- `GET /api/admin/batch-jobs/executions/running`
- `GET /api/admin/batch-jobs/summary`
- `GET /api/admin/batch-jobs/configured-jobs`

The server actions use existing JWT retry helpers in `src/lib/proxyHandler.ts`.

## Smoke Test

1. Open `/admin/batch-jobs`.
2. Confirm summary cards load.
3. Apply a status filter (`FAILED`), verify table updates.
4. Click `View` on one record and verify detail payload renders.
5. Check failed/running/configured sections populate.
