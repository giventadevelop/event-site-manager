'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const SyroHeader = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  // Track scroll position for header shadow effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const navigationItems = [
    { name: 'The Catholicate', href: '/syro/catholicate' },
    { name: 'Administration', href: '/syro/administration' },
    { name: 'The Church', href: '/syro/the-church' },
    { name: 'Holy Synod', href: '/syro/holy-synod' },
    { name: 'Ecumenical', href: '/syro/ecumenical' },
    { name: 'Dioceses', href: '/syro/dioceses' },
    { name: 'Saints', href: '/syro/saints' },
  ];

  const isActive = (href: string) => {
    return pathname?.startsWith(href) ?? false;
  };

  return (
    <header
      className={`
        bg-white border-b border-syro-table-border overflow-hidden sticky top-0 z-50
        transition-all duration-300
        ${isScrolled ? 'shadow-syro-header' : ''}
      `}
    >
      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/syro" className="flex items-center space-x-3">
            <div className="h-48 aspect-square flex items-center justify-center">
              <Image
                src="/images/logos/MOSC-logo-Brand-part.png"
                alt="Syro-Malabar Church Logo"
                width={160}
                height={160}
                className="object-contain w-full h-full"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1" role="navigation" aria-label="Main navigation">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  px-4 py-2 rounded-lg text-syro-label font-medium transition-all duration-300
                  ${isActive(item.href)
                    ? 'bg-syro-red text-white'
                    : 'text-syro-blue hover:bg-syro-red-light hover:text-syro-red'
                  }
                `}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-syro-blue hover:bg-syro-red-light rounded-lg transition-colors"
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-syro-table-border bg-white">
          <nav className="px-4 py-4 space-y-2" role="navigation" aria-label="Mobile navigation">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  block px-4 py-3 rounded-lg text-syro-label font-medium transition-all duration-300
                  ${isActive(item.href)
                    ? 'bg-syro-red text-white'
                    : 'text-syro-blue hover:bg-syro-red-light hover:text-syro-red'
                  }
                `}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default SyroHeader;
