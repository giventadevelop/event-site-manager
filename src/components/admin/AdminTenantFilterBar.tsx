'use client';

/**
 * Thin client wrapper so server-rendered list pages can show the tenant typeahead
 * without converting the whole page to a client component.
 */
import AdminTenantFilterField from '@/app/admin/AdminTenantFilterField';

export default function AdminTenantFilterBar({ className = 'mb-4' }: { className?: string }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-3 sm:p-4 ${className}`}>
      <AdminTenantFilterField />
    </div>
  );
}
