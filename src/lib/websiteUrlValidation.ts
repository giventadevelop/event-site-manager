/**
 * Normalize optional website URL — prepend https:// when scheme is missing.
 */
export function normalizeWebsiteUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/** Returns a user-facing error message, or null if empty/valid. */
export function getWebsiteUrlFormatError(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    new URL(normalizeWebsiteUrl(trimmed));
    return null;
  } catch {
    return 'Enter a valid website URL';
  }
}
