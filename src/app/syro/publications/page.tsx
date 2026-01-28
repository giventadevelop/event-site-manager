import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Publications | Syro-Malabar Church',
  description: 'Official publications of the Syro-Malabar Church, including the Malankara Sabha Magazine (Masika) and other church literature.',
};

export default function PublicationsPage() {
  const publications = [
    {
      id: 'malankara-sabha-magazine-masika',
      title: 'Malankara Sabha Magazine (Masika)',
      description: 'On August 8th 1946, due to the dedicated conviction and enthusiasm of H.H. Baselius Geevarghese II Catholicos of Blessed memory, the Magazine was published from the Catholicate Palace of Devalokam...',
      image: '/images/publications/mal.jpg',
      link: '/syro/publications/malankara-sabha-magazine-masika',
    },
  ];

  return (
    <div className="min-h-screen bg-syro-bg-gray">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-white to-syro-light-gray py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-syro-display font-semibold text-syro-h1 lg:text-[2.8rem] text-syro-blue mb-4">
              Publications
            </h1>
            <p className="font-syro-primary text-syro-body lg:text-[1.25rem] text-syro-text-gray max-w-3xl mx-auto">
              Official publications of the Syro-Malabar Church, sharing the faith, tradition, and teachings of our ancient church.
            </p>
          </div>
        </div>
      </section>

      {/* Publications Grid Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {publications.map((publication) => (
              <Link
                key={publication.id}
                href={publication.link}
                className="group bg-white rounded-[5px] shadow-syro-card hover:shadow-syro-card-hover transition-all duration-500 overflow-hidden"
              >
                <div className="relative w-full h-64">
                  <Image
                    src={publication.image}
                    alt={publication.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h2 className="font-syro-display font-semibold text-syro-h3 text-syro-blue mb-3 group-hover:text-syro-red transition-colors duration-300">
                    {publication.title}
                  </h2>
                  <p className="font-syro-primary text-syro-body text-syro-text-gray leading-relaxed mb-4 line-clamp-3">
                    {publication.description}
                  </p>
                  <span className="inline-flex items-center font-syro-primary text-syro-red font-medium group-hover:gap-2 transition-all duration-300">
                    Read More
                    <svg 
                      className="w-5 h-5 ml-1 group-hover:ml-2 transition-all duration-300" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Information Section */}
      <section className="py-16 bg-syro-light-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-syro-display font-semibold text-syro-h2 text-syro-blue mb-6">
              Our Publishing Mission
            </h2>
            <p className="font-syro-primary text-syro-body text-syro-text-gray leading-relaxed mb-6">
              The publications of the Syro-Malabar Church serve to educate, inspire, and strengthen the faith of our community. Through our magazines, books, and other literature, we preserve our rich heritage while addressing contemporary spiritual needs.
            </p>
            <p className="font-syro-primary text-syro-body text-syro-text-gray leading-relaxed">
              Each publication reflects our commitment to sharing the timeless teachings of the Orthodox faith in a manner that is both accessible and meaningful to all generations.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
