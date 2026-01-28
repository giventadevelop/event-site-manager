'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function KalpanaPage() {
  const kalpanaEditions = [
    { year: '2025', link: '#', available: true },
    { year: '2024', link: '#', available: true },
    { year: '2023', link: '#', available: true },
    { year: '2022', link: '#', available: true },
    { year: '2021', link: '#', available: true },
    { year: '2020', link: '#', available: true },
    { year: '2019', link: '#', available: true },
    { year: '2018', link: '#', available: true },
    { year: '2017', link: '#', available: true },
    { year: '2016', link: '#', available: true },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <section className="bg-muted py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center space-x-2 font-body text-sm text-muted-foreground">
            <Link href="/mosc" className="hover:text-primary reverent-transition">
              MOSC
            </Link>
            <span>/</span>
            <Link href="/mosc/downloads" className="hover:text-primary reverent-transition">
              Downloads
            </Link>
            <span>/</span>
            <span className="text-foreground">Kalpana</span>
          </nav>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-background to-muted py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="relative w-full h-80 lg:h-96 rounded-lg overflow-hidden sacred-shadow-lg">
              <Image
                src="/images/downloads/kalpana.jpg"
                alt="Kalpana"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div>
              <h1 className="font-heading font-semibold text-4xl lg:text-5xl text-foreground mb-4">
                Kalpana
              </h1>
              <p className="font-body text-lg text-muted-foreground leading-relaxed mb-4">
                The official annual calendar and directory of the Malankara Orthodox Syrian Church.
              </p>
              <p className="font-body text-lg text-muted-foreground leading-relaxed">
                The Kalpana contains important liturgical dates, feast days, fasts, parish directories, and essential church information for the year.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Kalpana Editions Grid */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading font-semibold text-3xl text-foreground mb-4">
              Available Editions
            </h2>
            <p className="font-body text-lg text-muted-foreground">
              Select a year to view or download the Kalpana edition
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {kalpanaEditions.map((edition) => (
              <Link
                key={edition.year}
                href={edition.link}
                className="group bg-card rounded-lg sacred-shadow hover:sacred-shadow-lg reverent-transition p-6 text-center"
                onClick={(e) => {
                  if (edition.link === '#') {
                    e.preventDefault();
                    alert(`Kalpana ${edition.year} PDF will be available for download soon.`);
                  }
                }}
              >
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 reverent-transition">
                  <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-heading font-semibold text-2xl text-foreground mb-2 group-hover:text-primary reverent-transition">
                  {edition.year}
                </h3>
                <p className="font-body text-sm text-muted-foreground">
                  Kalpana {edition.year}
                </p>
                {edition.available && (
                  <div className="mt-3">
                    <span className="inline-flex items-center px-3 py-1 bg-success/10 text-success rounded-full text-xs font-medium">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Available
                    </span>
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* About Kalpana */}
      <section className="py-16 bg-muted">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card rounded-lg sacred-shadow p-8">
            <h2 className="font-heading font-semibold text-2xl text-foreground mb-4">
              About Kalpana
            </h2>
            <div className="space-y-4 font-body text-lg text-muted-foreground leading-relaxed">
              <p>
                The Kalpana is an indispensable resource for every Orthodox faithful, providing a comprehensive guide to the liturgical year and church administration.
              </p>
              <p>
                Each edition includes:
              </p>
              <ul className="space-y-2 ml-6">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Complete liturgical calendar with feast days and fasts</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Directory of parishes, priests, and church officials</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Important church announcements and guidelines</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Contact information for dioceses and institutions</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation */}
      <section className="py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <Link
              href="/mosc/downloads"
              className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground font-body font-medium rounded-lg hover:bg-primary/90 reverent-transition sacred-shadow"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to All Downloads
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

