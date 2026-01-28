import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Orphanages | Institutions | MOSC',
  description: "Orphanages and children's homes operated by the Malankara Orthodox Syrian Church, providing care and support for children in need.",
};

export default function OrphanagesPage() {
  const orphanages = [
    { name: 'Prathyasa, Prasanthi, Pretheesha', location: 'Meempara (Head Office)', phone: '0484 2760286' },
    { name: 'Baselios Marthoma Didymus I Balika Bhavan', location: 'Pothukal, Nilambur', phone: '04931 241282' },
    { name: 'Zachariah Mar Dionysius Memorial Bala Bhavan', location: 'Thengali', phone: '0469 2615014' },
    { name: 'St. Gregorios Balika Bhavan', location: 'Pampady Ph: 0481 2505451' },
    { name: 'Holy Cross Children\'s Home', location: 'Sreekariyam, Trivandrum', phone: '0471 2590261' },
    { name: 'St. Mary\'s Balabhavan', location: 'Thumpamon', phone: '04734 267100' },
    { name: 'Bethlehem Children\'s Home', location: 'Chengamanad, Kottarakara', phone: '0474 2402578' },
    { name: 'Mar Gregorios Bethel Balabhavan', location: 'Kunnicode', phone: '0475 2322520' },
    { name: 'St. Paul\'s Balabhavan', location: 'Puthuppady, Kozhikode', phone: '0495 2235017' },
    { name: 'MGD Asram and Balabhavan', location: 'Karunagiri, Karukachal', phone: '0481 2486384' },
    { name: 'St. Thomas Karunya Balabhavan', location: 'Trivandrum', phone: '0471 2445543' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <section className="bg-muted py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center space-x-2 font-body text-sm text-muted-foreground">
            <Link href="/mosc" className="hover:text-primary reverent-transition">MOSC</Link>
            <span>/</span>
            <Link href="/mosc/institutions" className="hover:text-primary reverent-transition">Institutions</Link>
            <span>/</span>
            <span className="text-foreground">Orphanages</span>
          </nav>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-background to-muted py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="relative w-full h-80 lg:h-96 rounded-lg overflow-hidden sacred-shadow-lg">
              <Image src="/images/institutions/orp.jpg" alt="Orphanages" fill className="object-cover" priority />
            </div>
            <div>
              <h1 className="font-heading font-semibold text-4xl lg:text-5xl text-foreground mb-4">Orphanages</h1>
              <p className="font-body text-lg text-muted-foreground leading-relaxed">
                Centers of hope and care providing shelter, education, and love to children in need, embodying Christ\'s compassion for the vulnerable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Orphanages List Section */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {orphanages.map((orphanage, index) => (
              <div key={index} className="bg-muted/20 rounded-lg p-6 sacred-shadow-sm border-l-4 border-primary hover:sacred-shadow reverent-transition">
                <h3 className="font-heading font-semibold text-xl text-foreground mb-3">{orphanage.name}</h3>
                <div className="space-y-2 font-body text-muted-foreground">
                  <p className="flex items-start">
                    <svg className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{orphanage.location}</span>
                  </p>
                  {orphanage.phone && (
                    <p className="flex items-start">
                      <svg className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span>{orphanage.phone}</span>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-12 bg-muted">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card rounded-lg sacred-shadow p-8 text-center">
            <h2 className="font-heading font-semibold text-2xl text-foreground mb-4">Our Ministry to Children</h2>
            <p className="font-body text-lg text-muted-foreground leading-relaxed">
              Following Christ\'s teaching to &quot;let the little children come to me,&quot; our orphanages provide a loving, nurturing environment where children can grow in faith, receive quality education, and develop their God-given potential.
            </p>
          </div>
        </div>
      </section>

      {/* Navigation */}
      <section className="py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <Link href="/mosc/institutions" className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground font-body font-medium rounded-lg hover:bg-primary/90 reverent-transition sacred-shadow">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to All Institutions
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}


