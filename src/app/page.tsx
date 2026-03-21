'use client';

import RootAuthLanding from '@/components/RootAuthLanding';

/**
 * Primary domain root: minimal Clerk sign-in only (full marketing site lives at `/home`).
 * Satellite auth still uses `/sign-in` on the primary host; see RootAuthLanding and clerk_auth rule.
 */
export default function RootPage() {
  return <RootAuthLanding />;
}
