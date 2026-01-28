'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function DownloadsPage() {
  const downloadCategories = [
    {
      id: 'kalpana',
      title: 'Kalpana',
      description: 'The official annual calendar and directory of the Malankara Orthodox Syrian Church. View and download editions from previous years.',
      image: '/images/downloads/kalpana.jpg',
      link: '/mosc/downloads/kalpana',
      featured: true,
    },
    {
      id: 'catholicate-day',
      title: 'Catholicate Day Book Cover, Brochure',
      description: 'Official materials for Catholicate Day celebrations.',
      image: '/images/downloads/cdc-thump.png',
      link: '#', // PDF download link
    },
    {
      id: 'prayer-books',
      title: 'Prayer Books',
      description: 'Orthodox prayer books, liturgical texts, and devotional materials for daily prayer and worship.',
      link: '/mosc/downloads/prayer-books',
    },
    {
      id: 'photos',
      title: 'Photos',
      description: 'Official photographs of bishops, saints, and church leaders for reference and veneration.',
      link: '/mosc/downloads/photos',
    },
    {
      id: 'application-forms',
      title: 'Application Forms',
      description: 'Official forms for various church services, certificates, and administrative purposes.',
      link: '/mosc/downloads/application-forms',
    },
    {
      id: 'pdfs',
      title: 'PDFs & Documents',
      description: 'Church circulars, announcements, guidelines, and official documents.',
      link: '/mosc/downloads/pdfs',
    },
    {
      id: 'financial',
      title: 'Financial Forms & Guidelines',
      description: 'Budget formats, account statements, church accounts manual, and financial guidelines for parishes and institutions.',
      link: '#', // Will list multiple forms
    },
    {
      id: 'malankara-association',
      title: 'Malankara Association Documents',
      description: 'Agendas, member lists, candidate lists, and official documents from Malankara Association meetings.',
      link: '#',
    },
    {
      id: 'merit-awards',
      title: 'Merit Awards & Scholarship',
      description: 'Information about educational merit awards, scholarships, and academic excellence programs.',
      link: '#',
    },
    {
      id: 'medical-insurance',
      title: 'Medical Insurance',
      description: 'Information and forms related to medical insurance schemes for church members.',
      link: '#',
    },
    {
      id: 'marriage-assistance',
      title: 'Marriage Marga Nirdesha Form',
      description: 'Forms and guidelines for marriage assistance and counseling services.',
      link: '#',
    },
    {
      id: 'priest-directory',
      title: 'Priest Directory',
      description: 'Directory of priests serving in various parishes and dioceses.',
      link: '#',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-background to-muted py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center sacred-shadow">
                <svg className="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              </div>
            </div>
            <h1 className="font-heading font-semibold text-4xl lg:text-5xl text-foreground mb-4">
              Downloads
            </h1>
            <p className="font-body text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto">
              Access official church documents, prayer books, forms, and resources of the Malankara Orthodox Syrian Church.
            </p>
          </div>
        </div>
      </section>

      {/* Downloads Grid Section */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {downloadCategories.map((category) => (
              <Link
                key={category.id}
                href={category.link}
                className={`group bg-card rounded-lg sacred-shadow hover:sacred-shadow-lg reverent-transition overflow-hidden ${category.link === '#' ? 'opacity-75 cursor-not-allowed' : ''}`}
                onClick={(e) => {
                  if (category.link === '#') {
                    e.preventDefault();
                    alert('This resource will be available soon. Please check back later.');
                  }
                }}
              >
                {category.image && (
                  <div className="relative w-full h-48">
                    <Image
                      src={category.image}
                      alt={category.title}
                      fill
                      className="object-cover group-hover:scale-105 reverent-transition"
                    />
                  </div>
                )}
                <div className={`p-6 ${!category.image ? 'h-full flex flex-col justify-center' : ''}`}>
                  <h2 className="font-heading font-semibold text-xl text-foreground mb-3 group-hover:text-primary reverent-transition">
                    {category.title}
                  </h2>
                  <p className="font-body text-muted-foreground leading-relaxed mb-4 line-clamp-3">
                    {category.description}
                  </p>
                  <span className="inline-flex items-center font-body text-primary font-medium group-hover:gap-2 reverent-transition">
                    {category.link === '#' ? 'Coming Soon' : 'View & Download'}
                    {category.link !== '#' && (
                      <svg 
                        className="w-5 h-5 ml-1 group-hover:ml-2 reverent-transition" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Information Section */}
      <section className="py-16 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-heading font-semibold text-3xl text-foreground mb-6">
              Resources for the Faithful
            </h2>
            <p className="font-body text-lg text-muted-foreground leading-relaxed mb-6">
              The downloads section provides access to essential church resources including liturgical texts, administrative forms, directories, and official documents. These resources support the spiritual life and administration of our church community.
            </p>
            <p className="font-body text-lg text-muted-foreground leading-relaxed">
              For additional resources or if you cannot find what you're looking for, please contact the Catholicate office or your diocesan administration.
            </p>
          </div>
        </div>
      </section>

      {/* Featured - Kalpana */}
      <section className="py-16 bg-primary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-body font-medium mb-4">
                Featured Resource
              </div>
              <h2 className="font-heading font-semibold text-3xl text-foreground mb-4">
                Kalpana - Church Calendar
              </h2>
              <p className="font-body text-lg text-muted-foreground leading-relaxed mb-6">
                The Kalpana is the official annual calendar and directory of the Malankara Orthodox Syrian Church, containing important dates, feasts, fasts, and church information for the year.
              </p>
              <Link
                href="/mosc/downloads/kalpana"
                className="inline-flex items-center px-8 py-3 bg-primary text-primary-foreground font-body font-medium rounded-lg hover:bg-primary/90 reverent-transition sacred-shadow hover:sacred-shadow-lg"
              >
                View Kalpana Editions
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="relative h-96 rounded-lg overflow-hidden sacred-shadow-lg">
              <Image
                src="/images/downloads/kalpana.jpg"
                alt="Kalpana"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

