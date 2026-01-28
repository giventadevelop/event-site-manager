import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const SyroFooter = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { name: 'DOWNLOADS', href: '/syro/downloads' },
    { name: 'E-MAIL', href: '/syro/contact-form-email' },
    { name: 'GALLERY', href: '/syro/gallery' },
    { name: 'CONTACT INFO', href: '/syro/contact-info' },
  ];

  return (
    <footer className="bg-white border-t border-syro-table-border mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 items-start">
          {/* Church Info */}
          <div className="justify-items-center">
            {/* Logo */}
            <div className="flex justify-center md:justify-start mb-4">
              <div className="w-32 h-32 md:w-40 md:h-40 bg-transparent rounded-lg flex items-center justify-center overflow-hidden">
                <Image
                  src="/images/logos/MOSC-logo-Brand-part.png"
                  alt="Syro-Malabar Church emblem"
                  width={160}
                  height={160}
                  className="object-contain"
                />
              </div>
            </div>
            {/* Historical Text */}
            <p className="text-syro-small text-syro-text-gray leading-relaxed text-justify">
              The Syro-Malabar Church traces its origins to the apostolic mission of St. Thomas,
              one of the twelve apostles of Jesus Christ, who established Christianity in India in 52 AD.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-syro-display font-semibold text-syro-h4 text-syro-blue">Quick Links</h3>
            <nav className="space-y-2" role="navigation" aria-label="Footer navigation">
              {footerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-syro-small text-syro-text-gray hover:text-syro-red transition-colors duration-300"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-syro-display font-semibold text-syro-h4 text-syro-blue">Contact</h3>
            <div className="space-y-2 text-syro-small text-syro-text-gray">
              <p>Syro-Malabar Church</p>
              <p>Kochi, Kerala, India</p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="space-y-4">
            <h3 className="font-syro-display font-semibold text-syro-h4 text-syro-blue">About</h3>
            <p className="text-syro-small text-syro-text-gray leading-relaxed">
              The Syro-Malabar Church is one of the 23 Eastern Catholic Churches in full communion with Rome.
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-syro-table-border text-center">
          <p className="text-syro-small text-syro-text-gray">
            © {currentYear} Syro-Malabar Church. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default SyroFooter;
