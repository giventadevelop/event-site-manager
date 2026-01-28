'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NavigationBreadcrumb = () => {
  const pathname = usePathname();

  // Don't show breadcrumb on home page
  if (pathname === '/syro') {
    return null;
  }

  const pathSegments = pathname?.split('/').filter(Boolean) || [];
  
  // Build breadcrumb items
  const breadcrumbItems = pathSegments.map((segment, index) => {
    const href = '/' + pathSegments.slice(0, index + 1).join('/');
    const label = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    return { href, label, isLast: index === pathSegments.length - 1 };
  });

  return (
    <nav className="bg-syro-bg-gray border-b border-syro-table-border py-3" aria-label="Breadcrumb">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ol className="flex items-center space-x-2 text-syro-small">
          <li>
            <Link href="/syro" className="text-syro-text-gray hover:text-syro-red transition-colors">
              Home
            </Link>
          </li>
          {breadcrumbItems.map((item) => (
            <li key={item.href} className="flex items-center">
              <span className="mx-2 text-syro-medium-gray">/</span>
              {item.isLast ? (
                <span className="text-syro-blue font-medium">{item.label}</span>
              ) : (
                <Link
                  href={item.href}
                  className="text-syro-text-gray hover:text-syro-red transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
};

export default NavigationBreadcrumb;
