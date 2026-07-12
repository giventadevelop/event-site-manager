'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

interface ConditionalLayoutProps {
  children: React.ReactNode;
  header: React.ReactNode;
  footer: React.ReactNode;
}

export default function ConditionalLayout({ children, header, footer }: ConditionalLayoutProps) {
  const pathname = usePathname();

  // Check if this is a MOSC route
  const isMOSCRoute = pathname?.startsWith("/mosc") ?? false;

  // Check if this is a Syro route
  const isSyroRoute = pathname?.startsWith("/syro") ?? false;

  // MOSC redesign shell (downloads library, etc.)
  const isMoscRedesignRoute = pathname?.startsWith("/mosc-redesign") ?? false;

  // Primary root `/` is a minimal auth-only landing (no main site header/footer).
  // Satellite sign-in still targets `/sign-in` on the primary domain; see RootAuthLanding.
  const isRootAuthOnly = pathname === "/";

  // Clerk auth routes: same app on primary + satellites — hide marketing header/footer so
  // sign-in isn’t cramped under MALAYALEES.US nav + broken logo; user goes to /home after auth.
  const isAuthRoute =
    (pathname?.startsWith("/sign-in") ?? false) ||
    (pathname?.startsWith("/sign-up") ?? false) ||
    (pathname?.startsWith("/sso-callback") ?? false);

  // For MOSC routes, just render children without main app header/footer
  if (isMOSCRoute) {
    return <>{children}</>;
  }

  // For Syro routes, just render children without main app header/footer
  if (isSyroRoute) {
    return <>{children}</>;
  }

  if (isMoscRedesignRoute) {
    return <>{children}</>;
  }

  if (isRootAuthOnly || isAuthRoute) {
    return <>{children}</>;
  }

  // For all other routes, render the full layout with header and footer
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