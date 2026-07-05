/**
 * Top offset for admin pages so fixed site header does not overlap breadcrumbs and page chrome.
 * Use ADMIN_HEADER_OFFSET for pages with AdminNavigation and/or breadcrumb trails.
 */
export const ADMIN_HEADER_OFFSET = '180px';

export const adminPageTopStyle = { paddingTop: ADMIN_HEADER_OFFSET } as const;
