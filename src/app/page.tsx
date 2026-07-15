'use client';

import HomePage from './home/page';

/**
 * Root route: show the same public home experience as `/home`.
 * Auth remains available on `/sign-in` and `/sign-up`.
 */
export default function RootPage() {
  return <HomePage />;
}
