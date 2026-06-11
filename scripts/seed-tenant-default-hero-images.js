#!/usr/bin/env node
/**
 * Seed tenant_settings with default hero image URLs after onboarding.
 *
 * Prerequisites:
 * - Backend tenant_settings columns: defaultHeroImageUrlsJson, defaultHeroDisplayMode, defaultHeroIncludeWithEvents
 * - Hero objects uploaded to S3 under tenants/{tenantId}/hero-defaults/ (or use template URLs)
 *
 * Usage:
 *   TENANT_ID=tenant_demo_002 \
 *   DEFAULT_HERO_IMAGE_URLS="https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/tenants/tenant_demo_002/hero-defaults/slide-01.webp,https://..." \
 *   DEFAULT_HERO_DISPLAY_MODE=slideshow \
 *   DEFAULT_HERO_INCLUDE_WITH_EVENTS=true \
 *   NEXT_PUBLIC_API_BASE_URL=http://localhost:8080 \
 *   API_JWT_USER=... API_JWT_PASS=... \
 *   node scripts/seed-tenant-default-hero-images.js
 *
 * Optional: TENANT_SETTINGS_ID — patch by id instead of lookup by tenantId.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL;
const TENANT_ID = process.env.TENANT_ID;
const SETTINGS_ID = process.env.TENANT_SETTINGS_ID;
const URLS_RAW = process.env.DEFAULT_HERO_IMAGE_URLS || '';
const DISPLAY_MODE = process.env.DEFAULT_HERO_DISPLAY_MODE || 'slideshow';
const INCLUDE_WITH_EVENTS = process.env.DEFAULT_HERO_INCLUDE_WITH_EVENTS !== 'false';

async function getJwt() {
  const user = process.env.API_JWT_USER || process.env.AMPLIFY_API_JWT_USER;
  const pass = process.env.API_JWT_PASS || process.env.AMPLIFY_API_JWT_PASS;
  if (!user || !pass) {
    throw new Error('Set API_JWT_USER and API_JWT_PASS (or AMPLIFY_ variants)');
  }
  const res = await fetch(`${API_BASE_URL}/api/authenticate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: user, password: pass }),
  });
  if (!res.ok) {
    throw new Error(`Authenticate failed: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return data.id_token || data.token;
}

function parseUrls(raw) {
  if (!raw.trim()) return [];
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

async function findSettingsId(token) {
  const qs = new URLSearchParams({ 'tenantId.equals': TENANT_ID, size: '1' });
  const res = await fetch(`${API_BASE_URL}/api/tenant-settings?${qs}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Tenant-ID': TENANT_ID,
    },
  });
  if (!res.ok) {
    throw new Error(`List tenant-settings failed: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  const row = Array.isArray(data) ? data[0] : data;
  if (!row?.id) {
    throw new Error(`No tenant_settings row for tenantId=${TENANT_ID}`);
  }
  return row;
}

async function main() {
  if (!API_BASE_URL) {
    throw new Error('Set NEXT_PUBLIC_API_BASE_URL or API_BASE_URL');
  }
  if (!TENANT_ID && !SETTINGS_ID) {
    throw new Error('Set TENANT_ID or TENANT_SETTINGS_ID');
  }

  const urls = parseUrls(URLS_RAW);
  if (urls.length === 0) {
    console.warn(
      'No DEFAULT_HERO_IMAGE_URLS provided. Upload hero files to S3 first, then pass comma-separated public URLs.'
    );
  }

  const token = await getJwt();
  let settingsId = SETTINGS_ID;
  let existing = null;

  if (!settingsId) {
    existing = await findSettingsId(token);
    settingsId = existing.id;
  }

  const payload = {
    id: Number(settingsId),
    tenantId: TENANT_ID || existing?.tenantId,
    defaultHeroImageUrlsJson: JSON.stringify(urls),
    defaultHeroDisplayMode: DISPLAY_MODE,
    defaultHeroIncludeWithEvents: INCLUDE_WITH_EVENTS,
    updatedAt: new Date().toISOString(),
  };

  const res = await fetch(`${API_BASE_URL}/api/tenant-settings/${settingsId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/merge-patch+json',
      Authorization: `Bearer ${token}`,
      'X-Tenant-ID': payload.tenantId,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`PATCH tenant-settings failed: ${res.status} ${await res.text()}`);
  }

  const updated = await res.json();
  console.log('Seeded default hero images for tenant:', updated.tenantId || TENANT_ID);
  console.log('  urls:', urls.length);
  console.log('  displayMode:', DISPLAY_MODE);
  console.log('  includeWithEvents:', INCLUDE_WITH_EVENTS);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
