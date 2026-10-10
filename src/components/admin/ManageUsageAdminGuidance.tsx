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
              <strong>Ask the user to register first</strong> on that organization&apos;s live site (email or
              Google — same flow). Their <code className="text-xs bg-blue-100 dark:bg-blue-900 px-1 rounded">user_profile</code>{' '}
              is created only after they sign in on the domain tied to the correct{' '}
              <code className="text-xs bg-blue-100 dark:bg-blue-900 px-1 rounded">tenantId</code>. Signing up on
              the hub (<code className="text-xs bg-blue-100 dark:bg-blue-900 px-1 rounded">event-site-manager.com</code>)
              creates a hub profile, not an org-admin profile.
            </li>
            <li>
              After registration, find them here (search by email). Filter by <strong>Tenant ID</strong> to the
              organization they should administer.
            </li>
            <li>
              Click <strong>Edit</strong>, set <strong>Role</strong> to{' '}
              <code className="text-xs bg-blue-100 dark:bg-blue-900 px-1 rounded">ADMIN</code> (optional:{' '}
              <strong>Status</strong> to <code className="text-xs bg-blue-100 dark:bg-blue-900 px-1 rounded">ACTIVE</code>
              / <code className="text-xs bg-blue-100 dark:bg-blue-900 px-1 rounded">APPROVED</code>), save, then
              ask them to <strong>sign out and sign back in</strong>.
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
          title="Organization admin registration and promotion"
          ariaLabel="How a user registers on a satellite and is promoted to admin"
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
