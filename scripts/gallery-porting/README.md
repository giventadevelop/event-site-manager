# Gallery album cover migration (local → S3)

## Problem

Many `gallery_album.cover_image_url` values still point at **local app paths**, e.g.:

```text
/images/mosc/gallery/ethiopian-visit/IMG_3745.jpg
```

instead of S3, e.g.:

```text
https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/dev/media/tenantId/mosc_malankara_orthodox_2/gallery-album/album-id/59/cover_….jpg
```

This usually comes from the original static → dynamic import in **mosc-temp** (`scripts/gallery-porting/import-static-gallery-to-api.mjs`), which defaulted to `--media-mode url` and stored `/images/...` as `coverImageUrl`.

## Existing related scripts (mosc-temp)

| Script | Role |
|--------|------|
| `mosc-temp/scripts/gallery-porting/import-static-gallery-to-api.mjs` | Created albums + media; URL mode left local cover paths |
| `mosc-temp/scripts/gallery-porting/import-static-gallery-to-api.mjs --media-mode file` | Multipart upload of **album photos** (not a cover re-migration) |
| `mosc-temp/scripts/gallery-porting/README.md` | Full static→dynamic porting guide |

This repo’s migration script is **cover-only** and calls the dedicated backend endpoint:

`POST /api/event-medias/upload/gallery-album-cover-image`

(which uploads to S3 and updates `gallery_album.cover_image_url`).

## Prerequisites

1. Backend API running (`NEXT_PUBLIC_API_BASE_URL` in `.env.local`)
2. `API_JWT_USER` / `API_JWT_PASS` (or AMPLIFY_ / NEXT_PUBLIC_ variants)
3. Local files under `public/images/mosc/gallery/...` (or mosc-temp public as fallback)

## Commands

```bash
# Inspect only (no uploads)
npm run gallery:migrate-covers:dry -- --tenant mosc_malankara_orthodox_2

# Migrate all local covers for one tenant
npm run gallery:migrate-covers -- --tenant mosc_malankara_orthodox_2

# Single album (e.g. Ethiopian visit)
npm run gallery:migrate-covers -- --tenant mosc_malankara_orthodox_2 --album-id 59

# First N only
npm run gallery:migrate-covers -- --tenant mosc_malankara_orthodox_2 --limit 3
```

### Flags

| Flag | Description |
|------|-------------|
| `--tenant <id>` | Required tenant scope (`X-Tenant-ID` + criteria) |
| `--dry-run` | List local covers + resolve files; no upload |
| `--album-id N` | Only one album |
| `--limit N` | Cap how many local covers to process |
| `--delay-ms N` | Pause between uploads (default 400) |
| `--public-root <path>` | Default: `<repo>/public` |
| `--fallback-public-root <path>` | Default: `F:/project_workspace/mosc-temp/public` if present |
| `--report <path>` | JSON report path |

## Verify

1. Admin edit: `http://localhost:3001/admin/gallery/albums/59/edit?tenant=mosc_malankara_orthodox_2` — Current URL should be an `amazonaws.com` S3 URL.
2. Report: `scripts/gallery-porting/migrate-local-covers-report.json`
