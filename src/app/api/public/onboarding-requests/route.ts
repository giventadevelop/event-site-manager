import { NextResponse } from 'next/server';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getApiBaseUrl } from '@/lib/env';
import { consumeRateLimit, getClientIp } from '@/lib/onboarding/inMemoryRateLimit';
import { describeOnboardingBackendError, validateOnboardingSubmit } from '@/lib/onboarding/onboardingShared';
import type { TenantOnboardingRequestDTO } from '@/types';

const RATE_LIMIT_PER_HOUR = 5;
const HONEYPOT_FIELD = 'website';

function fakeRequestCode(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const suffix = Math.random().toString(36).slice(2, 7).toUpperCase().padEnd(5, '0');
  return `ONB-${date}-${suffix}`;
}

/**
 * Public "Get started" submission. Saves a PENDING tenant_onboarding_request; nothing is
 * provisioned until a platform SUPER_ADMIN approves it in /admin/onboarding-requests.
 */
export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  const rate = consumeRateLimit(`onboarding:${ip}`, RATE_LIMIT_PER_HOUR, 60 * 60 * 1000);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } }
    );
  }

  let body: Record<string, unknown>;
  try {
    const parsed = await request.json();
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  // Bots fill every field; pretend success so they do not retry.
  const honeypot = body[HONEYPOT_FIELD];
  if (typeof honeypot === 'string' && honeypot.trim() !== '') {
    return NextResponse.json({ requestCode: fakeRequestCode() }, { status: 201 });
  }

  const { payload, errors } = validateOnboardingSubmit(body);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ error: 'Please fix the highlighted fields', fieldErrors: errors }, { status: 400 });
  }

  try {
    const response = await fetchWithJwtRetry(
      `${getApiBaseUrl()}/api/tenant-onboarding-requests/submit`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          source: 'PUBLIC_FORM',
          submitterIp: ip === 'unknown' ? undefined : ip.slice(0, 64),
          userAgent: request.headers.get('user-agent')?.slice(0, 512) || undefined,
        }),
        cache: 'no-store',
      },
      'public-onboarding-submit'
    );

    const text = await response.text();
    if (!response.ok) {
      const fallback = 'We could not save your request. Please try again.';
      if (response.status !== 400 && response.status !== 409) {
        console.error('[api/public/onboarding-requests] backend error:', response.status, text.slice(0, 500));
        return NextResponse.json({ error: fallback }, { status: 502 });
      }
      return NextResponse.json({ error: describeOnboardingBackendError(text, fallback) }, { status: 400 });
    }

    const saved = JSON.parse(text) as TenantOnboardingRequestDTO;
    return NextResponse.json({ requestCode: saved.requestCode ?? null }, { status: 201 });
  } catch (err) {
    console.error('[api/public/onboarding-requests] submit failed:', err);
    return NextResponse.json({ error: 'We could not save your request. Please try again.' }, { status: 502 });
  }
}
