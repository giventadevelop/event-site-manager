'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const AboutOurChurchSection = () => {
  const router = useRouter();

  const mainNavigationLinks = [
    { label: 'THE CATHOLICATE', href: '/syro/catholicate', icon: 'Crown', isInternal: true },
    { label: 'ADMINISTRATION', href: '/syro/administration', icon: 'Building', isInternal: true },
    { label: 'THE CHURCH', href: '/syro/the-church', icon: 'Church', isInternal: true },
    { label: 'HOLY SYNOD', href: '/syro/holy-synod', icon: 'Users', isInternal: true },
    { label: 'ECUMENICAL', href: '/syro/ecumenical', icon: 'Handshake', isInternal: true },
    { label: 'DIOCESES', href: '/syro/dioceses', icon: 'MapPin', isInternal: true },
    { label: 'SAINTS', href: '/syro/saints', icon: 'Cross', isInternal: true },
  ];

  const quickLinks = [
    { label: 'Spiritual Organisations', href: '/syro/spiritual-organizations', icon: 'Cross', isInternal: true },
    { label: 'Theological Seminaries', href: '/syro/theological-seminaries', icon: 'GraduationCap', isInternal: true },
    { label: 'Publications', href: '/syro/publications', icon: 'BookOpen', isInternal: true },
    { label: 'Lectionary', href: '/syro/lectionary', icon: 'BookOpen', isInternal: true },
    { label: 'Institutions', href: '/syro/institutions', icon: 'Building', isInternal: true },
    { label: 'Downloads', href: '/syro/downloads', icon: 'Download', isInternal: true },
    { label: 'Directory', href: '/syro/directory', icon: 'Users', isInternal: true },
    { label: 'Calendar', href: '/syro/calendar', icon: 'Calendar', isInternal: true },
    { label: 'Training', href: '/syro/training', icon: 'GraduationCap', isInternal: true },
    { label: 'Gallery', href: '/syro/gallery', icon: 'Image', isInternal: true }
  ];

  const handleLinkClick = (link: any) => {
    if (link.external) {
      window.open(link.href, '_blank', 'noopener,noreferrer');
    } else if (link.isInternal) {
      router.push(link.href);
    }
  };

  const getIconSVG = (iconName: string) => {
    switch (iconName) {
      case 'Crown':
        return (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        );
      case 'Building':
        return (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        );
      case 'Church':
        return (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        );
      case 'Users':
        return (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        );
      case 'MapPin':
        return (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        );
      case 'Handshake':
        return (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        );
      case 'Cross':
        return (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v20M2 12h20" />
        );
      default:
        return (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        );
    }
  };

  return (
    <section className="py-16 bg-syro-bg-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-syro-h3 font-bold text-syro-blue mb-4">
            Explore Our Church
          </h2>
          <p className="text-syro-body text-syro-text-gray max-w-3xl mx-auto">
            Discover the rich history, spiritual resources, and community services of the Syro-Malabar Church.
          </p>
        </div>

        {/* Main Navigation Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-12">
          {mainNavigationLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick(link);
              }}
              className="bg-white p-6 rounded-[5px] shadow-syro-card hover:shadow-syro-card-hover transition-all duration-500 text-center group"
            >
              <div className="w-14 h-14 bg-syro-blue-secondary rounded-[5px] flex items-center justify-center mx-auto mb-4 text-white">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {getIconSVG(link.icon)}
                </svg>
              </div>
              <h3 className="text-syro-h6 font-semibold text-syro-blue group-hover:text-syro-red transition-colors">
                {link.label}
              </h3>
            </Link>
          ))}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick(link);
              }}
              className="bg-white p-4 rounded-[5px] shadow-syro-card hover:shadow-syro-card-hover transition-all duration-500 text-center group"
            >
              <h4 className="text-syro-small font-medium text-syro-blue group-hover:text-syro-red transition-colors">
                {link.label}
              </h4>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutOurChurchSection;
