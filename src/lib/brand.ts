/**
 * Platform brand identity. Tenant sites show their own organization name;
 * these values apply to the hub and to platform-level fallbacks.
 */
export const BRAND_NAME = 'AdwiiseAgent';
export const BRAND_TAGLINE = 'Websites, events, payments and AI pricing for every organization';

/** Hub host used when NEXT_PUBLIC_PRIMARY_DOMAIN is not set. */
export const BRAND_PRIMARY_HOST = 'www.adwiiseagent.ai';
export const BRAND_APP_URL = `https://${BRAND_PRIMARY_HOST}`;
export const BRAND_CLERK_FRONTEND_API = 'https://clerk.adwiiseagent.ai';

export const BRAND_LOGO_PATH = '/images/adwiise-agent/adwiise-agent-logo.svg';
export const BRAND_ICON_PATH = '/images/adwiise-agent/adwiise-agent-icon.svg';

/** Previous and backup hub domains; they redirect to the current brand domain. */
export const LEGACY_PRIMARY_BARE_DOMAINS = [
  'event-site-manager.com',
  'kluvo.ai',
  'kluvo.io',
  'adwiiseagent.com',
  'adwiiseflow.com',
];
