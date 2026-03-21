'use client';

import RootAuthLanding from '@/components/RootAuthLanding';

/**
 * Primary domain root: Clerk sign-in (signed-in users stay here unless they open `/home` manually).
 * Full marketing site lives at `/home`. Satellite auth: see RootAuthLanding and clerk_auth rule.
 */
export default function RootPage() {
  return <RootAuthLanding />;
}
