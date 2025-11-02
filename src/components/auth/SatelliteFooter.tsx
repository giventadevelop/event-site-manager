'use client';

import React from 'react';
import Link from 'next/link';
import { Facebook, Twitter, Linkedin, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { SatelliteBranding } from '@/lib/satelliteConfig';

interface SatelliteFooterProps {
  branding: SatelliteBranding;
  satelliteDomain: string;
}

export default function SatelliteFooter({ branding, satelliteDomain }: SatelliteFooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      {/* Main Footer Content */}
      <div className="w-full bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

            {/* Column 1: Logo and Description */}
            <div>
              {branding.logo.type === 'text' ? (
                <div className="mb-4">
                  <div
                    className="text-2xl font-bold leading-snug"
                    style={{ color: branding.logo.primaryColor }}
                  >
                    {branding.orgName}
                  </div>
                  <div
                    className="text-xs font-medium uppercase tracking-wider mt-1"
                    style={{ color: branding.logo.secondaryColor }}
                  >
                    {branding.tagline}
                  </div>
                </div>
              ) : branding.logo.url ? (
                <Link href={satelliteDomain} className="inline-block mb-4">
                  <img
                    src={branding.logo.url}
                    alt={branding.orgName}
                    className="h-12 w-auto"
                  />
                </Link>
              ) : null}

              <p className="text-gray-400 mb-6 font-inter text-sm leading-relaxed">
                {branding.fullName}
              </p>

              {/* Social Media Links */}
              {(branding.social.facebook || branding.social.twitter || branding.social.linkedin || branding.social.youtube) && (
                <div className="mb-6">
                  <p className="text-white font-inter font-medium text-sm mb-4">Follow Us</p>
                  <ul className="flex space-x-4">
                    {branding.social.facebook && (
                      <li>
                        <a
                          href={branding.social.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="
                            flex items-center justify-center w-10 h-10
                            text-gray-400 hover:text-white
                            bg-gray-800 hover:bg-blue-600
                            rounded-lg transition-all duration-300
                            hover:scale-110 active:scale-95
                            focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-gray-900
                          "
                          aria-label="Follow us on Facebook"
                        >
                          <Facebook size={18} strokeWidth={2} />
                        </a>
                      </li>
                    )}
                    {branding.social.twitter && (
                      <li>
                        <a
                          href={branding.social.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="
                            flex items-center justify-center w-10 h-10
                            text-gray-400 hover:text-white
                            bg-gray-800 hover:bg-blue-400
                            rounded-lg transition-all duration-300
                            hover:scale-110 active:scale-95
                            focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900
                          "
                          aria-label="Follow us on Twitter"
                        >
                          <Twitter size={18} strokeWidth={2} />
                        </a>
                      </li>
                    )}
                    {branding.social.linkedin && (
                      <li>
                        <a
                          href={branding.social.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="
                            flex items-center justify-center w-10 h-10
                            text-gray-400 hover:text-white
                            bg-gray-800 hover:bg-blue-700
                            rounded-lg transition-all duration-300
                            hover:scale-110 active:scale-95
                            focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2 focus:ring-offset-gray-900
                          "
                          aria-label="Connect with us on LinkedIn"
                        >
                          <Linkedin size={18} strokeWidth={2} />
                        </a>
                      </li>
                    )}
                    {branding.social.youtube && (
                      <li>
                        <a
                          href={branding.social.youtube}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="
                            flex items-center justify-center w-10 h-10
                            text-gray-400 hover:text-white
                            bg-gray-800 hover:bg-red-600
                            rounded-lg transition-all duration-300
                            hover:scale-110 active:scale-95
                            focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-gray-900
                          "
                          aria-label="Subscribe to our YouTube channel"
                        >
                          <Youtube size={18} strokeWidth={2} />
                        </a>
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>

            {/* Column 2: Contact Information */}
            <div>
              <h6 className="text-white font-inter font-semibold text-lg mb-6 tracking-wide">Get in Touch</h6>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin size={18} className="text-blue-400 mt-1 flex-shrink-0" strokeWidth={2} />
                  <p className="text-gray-400 font-inter text-sm leading-relaxed">
                    {branding.contact.address.split(',').map((line, idx) => (
                      <React.Fragment key={idx}>
                        {line.trim()}
                        {idx < branding.contact.address.split(',').length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <Phone size={18} className="text-blue-400 flex-shrink-0" strokeWidth={2} />
                  <div className="space-y-1">
                    <p>
                      <a
                        href={`tel:${branding.contact.phone.replace(/[^0-9+]/g, '')}`}
                        className="text-gray-300 hover:text-white font-inter text-sm transition-colors duration-300 focus:outline-none focus:text-white"
                      >
                        {branding.contact.phone}
                      </a>
                    </p>
                    {branding.contact.tollFree && (
                      <p>
                        <a
                          href={`tel:${branding.contact.tollFree.replace(/[^0-9+]/g, '')}`}
                          className="text-gray-300 hover:text-white font-inter text-sm transition-colors duration-300 focus:outline-none focus:text-white"
                        >
                          {branding.contact.tollFree} (Toll Free)
                        </a>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Mail size={18} className="text-blue-400 flex-shrink-0" strokeWidth={2} />
                  <p>
                    <a
                      href={`mailto:${branding.contact.email}`}
                      className="text-blue-400 hover:text-blue-300 font-inter text-sm transition-colors duration-300 focus:outline-none focus:text-blue-300"
                    >
                      {branding.contact.email}
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* Column 3: Return to Site */}
            <div>
              <h6 className="text-white font-inter font-semibold text-lg mb-6 tracking-wide">After Sign In</h6>
              <p className="text-gray-400 font-inter text-sm leading-relaxed mb-4">
                You will be redirected back to {branding.orgName} to continue your experience.
              </p>
              <a
                href={satelliteDomain}
                className="
                  inline-flex items-center justify-center
                  px-6 py-3 rounded-lg
                  bg-blue-600 hover:bg-blue-700
                  text-white font-medium text-sm
                  transition-all duration-300
                  hover:scale-105 active:scale-95
                  focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-gray-900
                "
              >
                Visit {branding.orgName}
              </a>
            </div>

          </div>
        </div>
      </div>

      {/* Copyright Section */}
      <div className="bg-gray-900 border-t border-gray-800 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 font-inter text-sm text-center md:text-left">
              © {currentYear}{' '}
              <a
                href={satelliteDomain}
                className="text-white hover:text-blue-400 transition-colors duration-300 focus:outline-none focus:text-blue-400"
              >
                {branding.orgName}
              </a>
              . All rights reserved.
            </p>

            <nav className="flex items-center space-x-6">
              <a
                href={`${satelliteDomain}#privacy`}
                className="text-gray-400 hover:text-white font-inter text-sm transition-colors duration-300 focus:outline-none focus:text-white"
              >
                Privacy Policy
              </a>
              <a
                href={`${satelliteDomain}#terms`}
                className="text-gray-400 hover:text-white font-inter text-sm transition-colors duration-300 focus:outline-none focus:text-white"
              >
                Terms of Service
              </a>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
