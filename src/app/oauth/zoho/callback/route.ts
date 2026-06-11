import { NextRequest, NextResponse } from 'next/server';
import { exchangeZohoAuthorizationCode, getZohoOAuthRedirectUri } from '@/lib/zoho/salesiq-oauth';

function requestOrigin(req: NextRequest): string {
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
  if (!host) {
    return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || 'https://www.event-site-manager.com';
  }
  const isLocal = host.startsWith('localhost') || host.startsWith('127.0.0.1');
  const proto = req.headers.get('x-forwarded-proto') || (isLocal ? 'http' : 'https');
  return `${proto}://${host}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function successHtml(payload: {
  refreshToken: string;
  accessTokenPreview: string;
  expiresIn?: number;
  apiDomain?: string;
  redirectUri: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Zoho SalesIQ OAuth — Success</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 720px; margin: 2rem auto; padding: 0 1rem; color: #1f2937; }
    h1 { font-size: 1.35rem; }
    pre { background: #f3f4f6; padding: 1rem; border-radius: 8px; overflow-x: auto; font-size: 0.85rem; }
    .warn { background: #fef3c7; border: 1px solid #f59e0b; padding: 0.75rem 1rem; border-radius: 8px; }
    code { background: #e5e7eb; padding: 0.1rem 0.35rem; border-radius: 4px; }
  </style>
</head>
<body>
  <h1>Zoho SalesIQ OAuth connected</h1>
  <p class="warn"><strong>Copy the refresh token now.</strong> Add it to <code>.env.local</code> on your machine (never commit it to git).</p>
  <p>Redirect URI used: <code>${escapeHtml(payload.redirectUri)}</code></p>
  <p>Add to <code>.env.local</code>:</p>
  <pre>ZOHO_REFRESH_TOKEN=${escapeHtml(payload.refreshToken)}</pre>
  <p>Access token preview (expires in ${payload.expiresIn ?? '?'}s): <code>${escapeHtml(payload.accessTokenPreview)}</code></p>
  ${payload.apiDomain ? `<p>API domain: <code>${escapeHtml(payload.apiDomain)}</code></p>` : ''}
  <p>Next: run bulk delete from mosc-temp:</p>
  <pre>npm run zobot:bulk-delete-articles -- --dry-run
npm run zobot:bulk-delete-articles -- --confirm</pre>
</body>
</html>`;
}

function errorHtml(message: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Zoho SalesIQ OAuth — Error</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 720px; margin: 2rem auto; padding: 0 1rem; }
    .err { background: #fee2e2; border: 1px solid #ef4444; padding: 1rem; border-radius: 8px; }
  </style>
</head>
<body>
  <h1>Zoho OAuth failed</h1>
  <div class="err">${escapeHtml(message)}</div>
  <p><a href="/oauth/zoho/start">Try again</a></p>
</body>
</html>`;
}

/**
 * Zoho redirects here with ?code=... after admin consent.
 * Register: https://www.event-site-manager.com/oauth/zoho/callback
 */
export async function GET(req: NextRequest) {
  const oauthError = req.nextUrl.searchParams.get('error');
  if (oauthError) {
    const description = req.nextUrl.searchParams.get('error_description') || oauthError;
    return new NextResponse(errorHtml(description), {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  const code = req.nextUrl.searchParams.get('code');
  if (!code) {
    return new NextResponse(errorHtml('Missing authorization code. Start from /oauth/zoho/start'), {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  const redirectUri = getZohoOAuthRedirectUri(requestOrigin(req));

  try {
    const tokens = await exchangeZohoAuthorizationCode(code, redirectUri);
    if (!tokens.refresh_token) {
      return new NextResponse(
        errorHtml(
          'No refresh_token returned. Revoke this app in Zoho Accounts and run /oauth/zoho/start again with access_type=offline.',
        ),
        { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
      );
    }

    const accessPreview = tokens.access_token
      ? `${tokens.access_token.slice(0, 12)}…${tokens.access_token.slice(-6)}`
      : '(none)';

    return new NextResponse(
      successHtml({
        refreshToken: tokens.refresh_token,
        accessTokenPreview: accessPreview,
        expiresIn: tokens.expires_in,
        apiDomain: tokens.api_domain,
        redirectUri,
      }),
      { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
    );
  } catch (error) {
    let message = error instanceof Error ? error.message : String(error);
    if (message.includes('ZOHO_CLIENT_ID and ZOHO_CLIENT_SECRET must be set')) {
      const host = req.headers.get('host') || '';
      const isProdHost = host.includes('event-site-manager.com');
      if (isProdHost) {
        message +=
          ' Production does not have ZOHO_CLIENT_ID / ZOHO_CLIENT_SECRET in Amplify env yet. ' +
          'Either add them and redeploy, or run OAuth locally: cd event-site-manager && npm run dev, ' +
          'register http://localhost:3000/oauth/zoho/callback in Zoho API Console, then open http://localhost:3000/oauth/zoho/start';
      } else {
        message +=
          ' Restart the dev server after adding ZOHO_CLIENT_ID and ZOHO_CLIENT_SECRET to event-site-manager/.env.local. ' +
          'Run npm run dev from F:\\project_workspace\\event-site-manager (not mosc-temp).';
      }
    }
    return new NextResponse(errorHtml(message), {
      status: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }
}
