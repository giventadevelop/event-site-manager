import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { createTenantSetting } from '@/app/admin/tenant-management/settings/ApiServerActions';
import { fetchTenantOrganizations } from '@/app/admin/tenant-management/organizations/ApiServerActions';
import TenantSettingsForm from '@/app/admin/tenant-management/components/TenantSettingsForm';
import Link from 'next/link';
import { TenantSettingsFormDTO } from '@/app/admin/tenant-management/types';

interface PageProps {
  searchParams: { tenantId?: string };
}

export default async function NewTenantSettingsPage({ searchParams }: PageProps) {
  // Fetch organizations for dropdown
  let organizations = [];
  try {
    const result = await fetchTenantOrganizations({ page: 0, pageSize: 100 }, {});
    organizations = result.data;
  } catch (error) {
    console.error('Error fetching organizations:', error);
  }

  async function handleSubmit(data: TenantSettingsFormDTO) {
    'use server';

    try {
      await createTenantSetting(data);
      redirect('/admin/tenant-management/settings');
    } catch (error) {
      console.error('Error creating settings:', error);
      throw error;
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex mb-8" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link
              href="/admin"
              className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Admin Dashboard
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <svg
                className="w-6 h-6 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <Link
                href="/admin/tenant-management/settings"
                className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
              >
                Settings
              </Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <svg
                className="w-6 h-6 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                New Settings
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Settings</h1>
        <p className="mt-2 text-sm text-gray-600">
          Configure settings for a tenant organization
        </p>
      </div>

      {/* Form */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Settings Configuration</h2>
        </div>
        <div className="px-6 py-6">
          <TenantSettingsForm
            mode="create"
            onSubmit={handleSubmit}
            organizations={organizations}
            initialData={{
              tenantId: searchParams.tenantId || '',
              allowUserRegistration: true,
              enableWhatsappIntegration: false,
              enableEmailMarketing: false,
              enableEventManagement: true,
              enablePaymentProcessing: false,
              maxUsers: null,
              maxEvents: null,
              maxStorageGB: null,
              maxApiCallsPerMonth: null,
              customCss: '',
              customJs: '',
              emailProviderConfig: '{}'
            }}
          />
        </div>
      </div>
    </div>
  );
}