#!/usr/bin/env node
/**
 * Migrate gallery album cover images from local public paths (/images/...) to S3.
 *
 * Background: static → dynamic gallery import (mosc-temp scripts/gallery-porting) often stored
 * coverImageUrl as /images/mosc/gallery/... instead of uploading to S3. This script finds those
 * albums, uploads the local file via the backend cover endpoint (which also PATCHes the album),
 * and reports results.
 *
 * Related existing tooling (mosc-temp):
 *   scripts/gallery-porting/import-static-gallery-to-api.mjs  (--media-mode file uploads photos)
 *   This script is cover-only and uses POST /api/event-medias/upload/gallery-album-cover-image
 *
 * Usage (from event-site-manager root, with .env.local + backend running):
 *   node scripts/gallery-porting/migrate-local-album-covers-to-s3.mjs --dry-run --tenant mosc_malankara_orthodox_2
 *   node scripts/gallery-porting/migrate-local-album-covers-to-s3.mjs --tenant mosc_malankara_orthodox_2
 *   node scripts/gallery-porting/migrate-local-album-covers-to-s3.mjs --tenant mosc_malankara_orthodox_2 --album-id 59
 *   node scripts/gallery-porting/migrate-local-album-covers-to-s3.mjs --tenant mosc_malankara_orthodox_2 --limit 3
 *
 * Optional public roots (first match wins):
 *   --public-root <path>           default: <cwd>/public
 *   --fallback-public-root <path>  e.g. F:/project_workspace/mosc-temp/public
 *
 * Env (.env.local):
 *   NEXT_PUBLIC_API_BASE_URL, API_JWT_USER / API_JWT_PASS (or AMPLIFY_ / NEXT_PUBLIC_ variants)
 */
import { config } from 'dotenv';
import { resolve, join, basename, extname } from 'path';
import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');

config({ path: resolve(ROOT, '.env.local') });

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const JWT_USER =
  process.env.AMPLIFY_API_JWT_USER ||
  process.env.API_JWT_USER ||
  process.env.NEXT_PUBLIC_API_JWT_USER;
const JWT_PASS =
  process.env.AMPLIFY_API_JWT_PASS ||
  process.env.API_JWT_PASS ||
  process.env.NEXT_PUBLIC_API_JWT_PASS;

const DRY_RUN = process.argv.includes('--dry-run');

function argValue(flag, fallback = null) {
  const i = process.argv.indexOf(flag);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const TENANT_ID = argValue('--tenant', process.env.NEXT_PUBLIC_TENANT_ID);
const ALBUM_ID = argValue('--album-id', null);
const LIMIT = Number(argValue('--limit', '0')) || 0;
const DELAY_MS = Number(argValue('--delay-ms', '400')) || 400;
const PUBLIC_ROOT = resolve(argValue('--public-root', join(ROOT, 'public')));
const FALLBACK_PUBLIC_ROOT = argValue(
  '--fallback-public-root',
  existsSync(resolve('F:/project_workspace/mosc-temp/public'))
    ? resolve('F:/project_workspace/mosc-temp/public')
    : null,
);
const REPORT_PATH = resolve(
  argValue('--report', join(__dirname, 'migrate-local-covers-report.json')),
);

function assertEnv() {
  const missing = [];
  if (!API_BASE_URL) missing.push('NEXT_PUBLIC_API_BASE_URL');
  if (!JWT_USER || !JWT_PASS) missing.push('API_JWT_USER / API_JWT_PASS');
  if (!TENANT_ID) missing.push('--tenant or NEXT_PUBLIC_TENANT_ID');
  if (missing.length) {
    throw new Error(`Missing required env/args: ${missing.join(', ')}`);
  }
}

function isLocalCoverUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const u = url.trim();
  if (!u) return false;
  if (/^https?:\/\/.+\.amazonaws\.com\//i.test(u)) return false;
  if (/^https?:\/\/.+s3[.-]/i.test(u)) return false;
  // Relative app paths or absolute URLs still pointing at /images/...
  if (u.startsWith('/images/')) return true;
  if (u.includes('/images/mosc/') || u.includes('/images/')) {
    try {
      const parsed = new URL(u, 'http://localhost');
      return parsed.pathname.startsWith('/images/');
    } catch {
      return u.startsWith('/');
    }
  }
  return false;
}

function toPublicRelativePath(coverUrl) {
  const u = coverUrl.trim();
  if (u.startsWith('/')) return u.replace(/^\//, '');
  try {
    const parsed = new URL(u);
    return parsed.pathname.replace(/^\//, '');
  } catch {
    return u.replace(/^\//, '');
  }
}

function resolveLocalFile(coverUrl) {
  const rel = toPublicRelativePath(coverUrl);
  const primary = join(PUBLIC_ROOT, rel);
  if (existsSync(primary)) return primary;
  if (FALLBACK_PUBLIC_ROOT) {
    const fallback = join(FALLBACK_PUBLIC_ROOT, rel);
    if (existsSync(fallback)) return fallback;
  }
  return null;
}

function guessContentType(filePath) {
  const ext = extname(filePath).toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.gif') return 'image/gif';
  return 'image/jpeg';
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function getServiceJwt() {
  const res = await fetch(`${API_BASE_URL}/api/authenticate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: JWT_USER, password: JWT_PASS, rememberMe: true }),
  });
  if (!res.ok) throw new Error(`authenticate failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  if (!data.id_token) throw new Error('authenticate: no id_token');
  return data.id_token;
}

async function apiFetch(token, path, init = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    'X-Tenant-ID': TENANT_ID,
    ...(init.headers || {}),
  };
  const res = await fetch(url, { ...init, headers });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  return { res, text, json };
}

async function fetchAllAlbums(token) {
  const albums = [];
  let page = 0;
  const size = 100;
  for (;;) {
    const qs = new URLSearchParams({
      'tenantId.equals': TENANT_ID,
      page: String(page),
      size: String(size),
      sort: 'id,asc',
    });
    const { res, json, text } = await apiFetch(token, `/api/gallery-albums?${qs}`);
    if (!res.ok) throw new Error(`gallery-albums list failed: ${res.status} ${text.slice(0, 300)}`);
    const rows = Array.isArray(json) ? json : json?.content || [];
    albums.push(...rows);
    if (rows.length < size) break;
    page += 1;
    if (page > 50) break;
  }
  return albums;
}

/**
 * Upload local file as album cover. Backend stores to S3 and updates gallery_album.cover_image_url.
 */
async function uploadCoverToS3(token, albumId, localPath) {
  const bytes = await readFile(localPath);
  const form = new FormData();
  form.append(
    'file',
    new Blob([bytes], { type: guessContentType(localPath) }),
    basename(localPath),
  );

  const qs = new URLSearchParams({
    albumId: String(albumId),
    tenantId: TENANT_ID,
    title: 'Gallery Album Cover Image',
    description: `Migrated from local path ${basename(localPath)}`,
    isPublic: 'true',
  });

  const url = `${API_BASE_URL}/api/event-medias/upload/gallery-album-cover-image?${qs}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Tenant-ID': TENANT_ID,
    },
    body: form,
  });

  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  if (!res.ok) {
    throw new Error(`upload failed ${res.status}: ${text.slice(0, 400)}`);
  }

  const fileUrl = json?.fileUrl || json?.url || json?.imageUrl || null;
  return { fileUrl, raw: json };
}

async function main() {
  assertEnv();

  console.log('Migrate local gallery album covers → S3');
  console.log(`  tenant: ${TENANT_ID}`);
  console.log(`  dry-run: ${DRY_RUN}`);
  console.log(`  public-root: ${PUBLIC_ROOT}`);
  if (FALLBACK_PUBLIC_ROOT) console.log(`  fallback-public-root: ${FALLBACK_PUBLIC_ROOT}`);
  console.log(`  api: ${API_BASE_URL}`);

  const token = await getServiceJwt();
  let albums = await fetchAllAlbums(token);

  if (ALBUM_ID) {
    const id = Number(ALBUM_ID);
    albums = albums.filter((a) => Number(a.id) === id);
    if (albums.length === 0) throw new Error(`Album id ${ALBUM_ID} not found for tenant ${TENANT_ID}`);
  }

  const candidates = albums.filter((a) => isLocalCoverUrl(a.coverImageUrl));
  const alreadyS3 = albums.filter(
    (a) => a.coverImageUrl && !isLocalCoverUrl(a.coverImageUrl),
  );
  const noCover = albums.filter((a) => !a.coverImageUrl);

  console.log(
    `Albums: total=${albums.length}, local covers=${candidates.length}, already remote/S3=${alreadyS3.length}, no cover=${noCover.length}`,
  );

  let work = candidates;
  if (LIMIT > 0) work = work.slice(0, LIMIT);

  const report = {
    startedAt: new Date().toISOString(),
    tenantId: TENANT_ID,
    dryRun: DRY_RUN,
    publicRoot: PUBLIC_ROOT,
    fallbackPublicRoot: FALLBACK_PUBLIC_ROOT,
    totals: {
      albums: albums.length,
      localCovers: candidates.length,
      alreadyRemote: alreadyS3.length,
      noCover: noCover.length,
      processed: 0,
    },
    results: [],
  };

  for (const album of work) {
    const entry = {
      albumId: album.id,
      title: album.title,
      oldCoverUrl: album.coverImageUrl,
      localPath: null,
      newCoverUrl: null,
      status: 'pending',
      error: null,
    };

    const localPath = resolveLocalFile(album.coverImageUrl);
    entry.localPath = localPath;

    if (!localPath) {
      entry.status = 'missing-file';
      entry.error = `Local file not found for ${album.coverImageUrl}`;
      console.warn(`  ✗ album ${album.id}: ${entry.error}`);
      report.results.push(entry);
      continue;
    }

    if (DRY_RUN) {
      entry.status = 'dry-run';
      console.log(`  [dry-run] album ${album.id} "${album.title}" ← ${localPath}`);
      report.results.push(entry);
      continue;
    }

    try {
      const { fileUrl } = await uploadCoverToS3(token, album.id, localPath);
      entry.newCoverUrl = fileUrl;
      entry.status = fileUrl && !isLocalCoverUrl(fileUrl) ? 'migrated' : 'uploaded-check-url';
      console.log(`  ✓ album ${album.id} → ${fileUrl || '(no url in response)'}`);
    } catch (err) {
      entry.status = 'error';
      entry.error = err instanceof Error ? err.message : String(err);
      console.error(`  ✗ album ${album.id}: ${entry.error}`);
    }

    report.results.push(entry);
    report.totals.processed += 1;
    if (DELAY_MS > 0) await sleep(DELAY_MS);
  }

  report.finishedAt = new Date().toISOString();
  report.totals.migrated = report.results.filter((r) => r.status === 'migrated').length;
  report.totals.errors = report.results.filter((r) => r.status === 'error').length;
  report.totals.missingFile = report.results.filter((r) => r.status === 'missing-file').length;
  report.totals.dryRun = report.results.filter((r) => r.status === 'dry-run').length;

  await writeFile(REPORT_PATH, JSON.stringify(report, null, 2), 'utf8');
  console.log(`\nReport written: ${REPORT_PATH}`);
  console.log(
    `Summary: migrated=${report.totals.migrated ?? 0}, missing-file=${report.totals.missingFile}, errors=${report.totals.errors}, dry-run=${report.totals.dryRun}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
