import { NextRequest, NextResponse } from 'next/server';
import { buildZohoAuthorizationUrl, getZohoOAuthRedirectUri } from '@/lib/zoho/salesiq-oauth';

function requestOrigin(req: NextRequest): string {
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
  const proto = req.headers.get('x-forwarded-proto') || 'https';
  if (host) return `${proto}://${host}`;
  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || 'https://www.event-site-manager.com';
}

function isSetupAuthorized(req: NextRequest): boolean {
  const setupSecret = process.env.ZOHO_OAUTH_SETUP_SECRET;
  if (!setupSecret) return true;
  return req.nextUrl.searchParams.get('key') === setupSecret;
}

/**
 * Starts Zoho OAuth for SalesIQ API access.
 * Visit: /oauth/zoho/start  (add ?key=... if ZOHO_OAUTH_SETUP_SECRET is set)
 */
export async function GET(req: NextRequest) {
  if (!isSetupAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.ZOHO_CLIENT_ID) {
    return NextResponse.json(
      { error: 'ZOHO_CLIENT_ID is not configured in environment variables' },
      { status: 500 },
    );
  }

  try {
    const redirectUri = getZohoOAuthRedirectUri(requestOrigin(req));
    const authUrl = buildZohoAuthorizationUrl(redirectUri);
    return NextResponse.redirect(authUrl);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
