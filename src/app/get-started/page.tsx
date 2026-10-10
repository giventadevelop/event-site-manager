import type { Metadata } from 'next';
import GetStartedForm from './GetStartedForm';

export const metadata: Metadata = {
  title: 'Get started | Request your website',
  description: 'Request a new website for your organization. Our team reviews every request and sets up your site.',
};

export default function GetStartedPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12" style={{ paddingTop: '120px' }}>
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Request your website</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Tell us about your organization and the domain you want to use. Our team reviews each request,
            sets up your site, and emails you when it is ready.
          </p>
        </div>
        <GetStartedForm />
      </div>
    </main>
  );
}
