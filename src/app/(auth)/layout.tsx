import { ReactNode } from 'react';

/**
 * Auth Layout
 *
 * This layout wraps all authentication pages (sign-in, sign-up, etc.)
 * It intentionally does NOT render the primary domain's Header/Footer
 * to allow satellite-specific branding to be shown instead.
 *
 * The individual auth pages handle rendering satellite headers/footers
 * based on the redirect_url parameter.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {children}
    </div>
  );
}
