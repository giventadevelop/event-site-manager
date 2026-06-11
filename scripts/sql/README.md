# SQL maintenance scripts

Local-only helpers for seeding or fixing `event_media` data.

## Do not commit

- Database dumps that include **expired S3 presigned URLs** with real `X-Amz-Credential` / access key IDs.
- Any export copied directly from production.

## Safe to version

- `add_sample_event_media.sql` — uses placeholder `SAMPLE` credentials in URLs.
- `fix_event_media_urls.sql` — path fixes only (no signing parameters).

If you need a full media INSERT dump, keep it outside git (e.g. `scripts/sql/local/` and add that folder to `.gitignore`).
