import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { fetchAllMembershipPlansServer } from './ApiServerActions';
import { AdminMembershipPlansClient } from './AdminMembershipPlansClient';
import type { MembershipPlanDTO } from '@/types';

export const metadata: Metadata = {
  title: 'Admin - Membership Plans',
  description: 'Manage membership plans',
};

export default async function AdminMembershipPlansPage(props: {
  searchParams?: Promise<{ page?: string; tenant?: string }> | { page?: string; tenant?: string };
}) {
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in?redirect_url=/admin/membership/plans');
  }

  // Handle Next.js 15+ async searchParams
  const resolvedSearchParams = typeof props.searchParams?.then === 'function'
    ? await props.searchParams
    : props.searchParams || {};

  // Parse page from search params (default to 0 for zero-based indexing)
  const page = resolvedSearchParams.page ? parseInt(resolvedSearchParams.page, 10) : 0;
  const pageSize = 10; // Default page size
  const tenantId =
    typeof resolvedSearchParams.tenant === 'string' && resolvedSearchParams.tenant.trim()
      ? resolvedSearchParams.tenant.trim()
      : undefined;

  let plans: MembershipPlanDTO[] = [];
  let totalCount = 0;
  let error = null;

  try {
    const result = await fetchAllMembershipPlansServer({
      page,
      size: pageSize,
      sort: 'createdAt,desc',
      tenantId,
    });
    plans = result.plans;
    totalCount = result.totalCount;
  } catch (err) {
    console.error('Failed to fetch membership plans:', err);
    error = err instanceof Error ? err.message : 'Failed to load membership plans';
  }

  return (
    <AdminMembershipPlansClient
      plans={plans}
      totalCount={totalCount}
      initialPage={page}
      pageSize={pageSize}
      error={error}
    />
  );
}

