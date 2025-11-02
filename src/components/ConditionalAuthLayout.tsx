'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface ConditionalAuthLayoutProps {
  header: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}

/**
 * Conditional Auth Layout
 *
 * Hides primary domain header/footer on authentication routes to allow
 * satellite-specific branding to show instead.
 *
 * Auth routes:
 * - /sign-in
 * - /sign-up
 * - /auth/signout-redirect
 */
export default function ConditionalAuthLayout({ header, footer, children }: ConditionalAuthLayoutProps) {
  const pathname = usePathname();

  // Check if current route is an auth route
  const isAuthRoute =
    pathname?.startsWith('/sign-in') ||
    pathname?.startsWith('/sign-up') ||
    pathname?.startsWith('/auth/signout-redirect') ||
    false;

  // If auth route, render ONLY children (no header/footer from primary domain)
  if (isAuthRoute) {
    return <>{children}</>;
  }

  // For non-auth routes, render the full layout with header and footer
  return (
    <>
      {header}
      <div className="flex-1 flex flex-col">
        {children}
      </div>
      {footer}
    </>
  );
}
