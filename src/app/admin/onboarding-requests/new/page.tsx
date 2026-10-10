import { assertPlatformSuperAdmin } from '@/app/admin/adminAccessServer';
import NewOnboardingRequestClient from './NewOnboardingRequestClient';

export const dynamic = 'force-dynamic';

export default async function NewOnboardingRequestPage() {
  await assertPlatformSuperAdmin();
  return <NewOnboardingRequestClient />;
}
