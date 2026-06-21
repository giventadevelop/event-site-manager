'use client';

import AdminHelpDialog from '@/components/admin/AdminHelpDialog';

const DOCUMENTATION_URL = '/documentation/manage_usage/PROMOTE_USER_TO_ADMIN_GUIDELINES.html';

export interface ManageUsageAdminGuidanceProps {
  showHelp?: boolean;
  showBanner?: boolean;
  className?: string;
}

function ManageUsageGuidanceBanner() {
  return (
    <div
      className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800 p-4"
      role="note"
      aria-label="How to promote a user to admin"
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0 pt-0.5">
          <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="min-w-0 flex-1 text-sm text-blue-900 dark:text-blue-100">
          <p className="font-semibold text-blue-950 dark:text-blue-50 mb-1">
            Promoting a user to Admin
          </p>
          <ol className="list-decimal list-inside space-y-1 text-blue-800 dark:text-blue-200 mb-2">
            <li>
              <strong>Ask the user to register first</strong> on your tenant&apos;s site (sign-up / sign-in).
              Their profile is created in the database only after they authenticate on the app linked to the
              correct <code className="text-xs bg-blue-100 dark:bg-blue-900 px-1 rounded">tenantId</code>.
            </li>
            <li>
              After registration, find them here (search by email). Use the <strong>Tenant ID</strong> filter if
              you manage multiple tenants.
            </li>
            <li>
              Click <strong>Edit</strong>, set <strong>Role</strong> to{' '}
              <code className="text-xs bg-blue-100 dark:bg-blue-900 px-1 rounded">ADMIN</code>, save, then ask
              them to <strong>sign out and sign back in</strong> to see the Admin menu.
            </li>
          </ol>
          <p className="text-xs text-blue-700 dark:text-blue-300">
            You can also update status, contact info, and other profile fields from Edit. Click <strong>?</strong>{' '}
            for full details.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Informational guidance for Manage Usage — admin promotion workflow (no behavior changes).
 */
export default function ManageUsageAdminGuidance({
  showHelp = true,
  showBanner = false,
  className = '',
}: ManageUsageAdminGuidanceProps) {
  return (
    <div className={className}>
      {showHelp && (
        <AdminHelpDialog
          title="Promote User to Admin — Guidelines"
          ariaLabel="How to promote a user to admin and manage roles"
          documentationUrl={DOCUMENTATION_URL}
          accent="blue"
        />
      )}
      {showBanner && (
        <div className={showHelp ? 'mt-3' : undefined}>
          <ManageUsageGuidanceBanner />
        </div>
      )}
    </div>
  );
}
