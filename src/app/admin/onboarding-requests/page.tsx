import { assertPlatformSuperAdmin } from '@/app/admin/adminAccessServer';
import OnboardingRequestsListClient from './OnboardingRequestsListClient';

export const dynamic = 'force-dynamic';

export default async function OnboardingRequestsPage() {
  await assertPlatformSuperAdmin();
  return <OnboardingRequestsListClient />;
}
