import { ReactNode } from 'react';

/**
 * Auth Utilities Layout
 *
 * This layout wraps utility auth pages like signout-redirect.
 * It intentionally does NOT render the primary domain's Header/Footer
 * to allow satellite-specific branding to be shown instead.
 */
export default function AuthUtilLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {children}
    </div>
  );
}
