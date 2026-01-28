import ProfilePageWithLoading from '@/components/ProfilePageWithLoading';

export default function ProfilePage() {
  // Profile page is now public like homepage - no authentication required
  // Client component handles authentication state and loading
  return <ProfilePageWithLoading />;
}