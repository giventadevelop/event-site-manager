import { ReactNode } from 'react';

/**
 * Auth Layout — wraps sign-in, sign-up, etc.
 * Main site Header/Footer are excluded in ConditionalLayout for these routes
 * (see `isAuthRoute` in ConditionalLayout.tsx), so auth pages are not under the marketing nav.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {children}
    </div>
  );
}
