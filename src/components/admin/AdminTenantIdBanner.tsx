'use client';

/**
 * Album-style Tenant ID banner for admin edit/create forms.
 * Shows which tenant owns the record when the top filter bar is hidden on edit routes.
 */
export default function AdminTenantIdBanner({
  tenantId,
  entityLabel = 'record',
  className = '',
}: {
  tenantId?: string | null;
  /** Used in the empty-state message, e.g. "album", "sponsor". */
  entityLabel?: string;
  className?: string;
}) {
  const tid = tenantId?.trim() || '';

  if (tid) {
    return (
      <div
        className={`mt-4 inline-flex flex-wrap items-center gap-2 rounded-xl border-2 border-sky-300 bg-sky-50 px-4 py-3 shadow-sm ${className}`}
        title={`Tenant that owns this ${entityLabel}`}
        aria-label={`Tenant ID ${tid}`}
      >
        <span className="text-xs font-semibold uppercase tracking-wide text-sky-700">
          Tenant ID
        </span>
        <code className="rounded-lg bg-white px-3 py-1.5 text-sm font-bold text-sky-900 border border-sky-200 break-all">
          {tid}
        </code>
      </div>
    );
  }

  return (
    <div
      className={`mt-4 inline-flex items-center gap-2 rounded-xl border-2 border-amber-300 bg-amber-50 px-4 py-3 shadow-sm ${className}`}
    >
      <span className="text-sm font-medium text-amber-800">
        Tenant ID is not set on this {entityLabel}.
      </span>
    </div>
  );
}
