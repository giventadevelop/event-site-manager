/**
 * Zoho OAuth helpers for SalesIQ server-based automation.
 * Used by /oauth/zoho/start and /oauth/zoho/callback.
 */

export const DEFAULT_ZOHO_SCOPES =
  'SalesIQ.articles.READ,SalesIQ.articles.CREATE,SalesIQ.articles.DELETE,SalesIQ.faqs.READ,SalesIQ.faqs.CREATE,SalesIQ.faqs.DELETE,SalesIQ.departments.READ';

export function getZohoAccountsBaseUrl(): string {
  return process.env.ZOHO_ACCOUNTS_BASE_URL?.replace(/\/$/, '') || 'https://accounts.zoho.com';
}

function isLocalDevOrigin(origin: string): boolean {
  try {
    const hostname = new URL(origin).hostname;
    return hostname === 'localhost' || hostname === '127.0.0.1';
  } catch {
    return false;
  }
}

/**
 * Redirect URI sent to Zoho must exactly match a URI registered in the API console.
 * Local dev (localhost / 127.0.0.1) always uses the current origin so production
 * ZOHO_OAUTH_REDIRECT_URI does not steal the callback away from your dev server.
 */
export function getZohoOAuthRedirectUri(requestOrigin?: string): string {
  if (requestOrigin && isLocalDevOrigin(requestOrigin)) {
    return `${requestOrigin.replace(/\/$/, '')}/oauth/zoho/callback`;
  }
  if (process.env.ZOHO_OAUTH_REDIRECT_URI) {
    return process.env.ZOHO_OAUTH_REDIRECT_URI;
  }
  if (requestOrigin) {
    return `${requestOrigin.replace(/\/$/, '')}/oauth/zoho/callback`;
  }
  return 'https://www.event-site-manager.com/oauth/zoho/callback';
}

export function getZohoOAuthScopes(): string {
  return process.env.ZOHO_OAUTH_SCOPES || DEFAULT_ZOHO_SCOPES;
}

export function buildZohoAuthorizationUrl(redirectUri: string): string {
  const clientId = process.env.ZOHO_CLIENT_ID;
  if (!clientId) {
    throw new Error('ZOHO_CLIENT_ID is not configured');
  }

  const params = new URLSearchParams({
    scope: getZohoOAuthScopes(),
    client_id: clientId,
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent',
    redirect_uri: redirectUri,
  });

  return `${getZohoAccountsBaseUrl()}/oauth/v2/auth?${params.toString()}`;
}

export type ZohoTokenResponse = {
  access_token?: string;
  refresh_token?: string;
  api_domain?: string;
  token_type?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
};

export async function exchangeZohoAuthorizationCode(
  code: string,
  redirectUri: string,
): Promise<ZohoTokenResponse> {
  const clientId = process.env.ZOHO_CLIENT_ID;
  const clientSecret = process.env.ZOHO_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('ZOHO_CLIENT_ID and ZOHO_CLIENT_SECRET must be set');
  }

  const body = new URLSearchParams({
    code,
    grant_type: 'authorization_code',
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
  });

  const response = await fetch(`${getZohoAccountsBaseUrl()}/oauth/v2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
    cache: 'no-store',
  });

  const data = (await response.json()) as ZohoTokenResponse;
  if (!response.ok || data.error) {
    throw new Error(data.error_description || data.error || `Token exchange failed (${response.status})`);
  }
  return data;
}

export async function refreshZohoAccessToken(refreshToken: string): Promise<ZohoTokenResponse> {
  const clientId = process.env.ZOHO_CLIENT_ID;
  const clientSecret = process.env.ZOHO_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('ZOHO_CLIENT_ID and ZOHO_CLIENT_SECRET must be set');
  }

  const body = new URLSearchParams({
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
    client_id: clientId,
    client_secret: clientSecret,
  });

  const response = await fetch(`${getZohoAccountsBaseUrl()}/oauth/v2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
    cache: 'no-store',
  });

  const data = (await response.json()) as ZohoTokenResponse;
  if (!response.ok || data.error) {
    throw new Error(data.error_description || data.error || `Token refresh failed (${response.status})`);
  }
  return data;
}
