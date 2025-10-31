'use client';

import { SignUp } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";

export default function SignUpPage() {
  const searchParams = useSearchParams();

  // Get redirect_url from query parameters (for satellite domain redirects)
  const redirectUrl = searchParams?.get('redirect_url') || '/';

  console.log('[SignUpPage] 📍 Redirect URL:', redirectUrl);

  return (
    <main className="flex flex-col items-center justify-center flex-1 py-2">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-center text-gray-900">Create Account</h1>
      </div>
      <SignUp redirectUrl={redirectUrl} afterSignUpUrl={redirectUrl} />
    </main>
  );
}