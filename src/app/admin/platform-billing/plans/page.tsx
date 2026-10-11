import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { fetchAdminAccessForClerkUser } from '@/app/admin/adminAccessServer';
import { fetchPlatformBillingPlans } from '../ApiServerActions';
import PlansClient from './PlansClient';

export default async function PlatformBillingPlansPage() {
  const { userId } = await auth();
  if (!userId) redirect('/');
  const user = await currentUser();
  const access = await fetchAdminAccessForClerkUser(userId, user?.emailAddresses?.[0]?.emailAddress);
  if (!access.isPlatformSuperAdmin) redirect('/admin');
  const plans = await fetchPlatformBillingPlans().catch(() => []);
  return <PlansClient initialPlans={plans} />;
}
