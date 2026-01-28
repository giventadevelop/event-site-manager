'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-br from-syro-bg-gray to-white min-h-[600px] flex items-center py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Church Logo */}
        <div className="mb-12">
          <div>
            <p className="text-syro-label text-syro-text-gray">
              Saint Thomas Christian Community
            </p>
          </div>
        </div>

        {/* Three Circular Images */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 mb-16 items-start">
          {/* Patriarch Image */}
          <div className="flex flex-col items-center justify-start">
            <div 
              className="w-48 h-48 lg:w-56 lg:h-56 rounded-full border-2 border-white p-1 flex items-center justify-center"
            >
              <div className="w-full h-full rounded-full overflow-hidden shadow-syro-card bg-white flex items-center justify-center">
                <Image
                  src="/images/logos/Hero-Section-Image-MOSC.jpg"
                  alt="Syro-Malabar Church emblem"
                  width={224}
                  height={224}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            </div>
            {/* Patriarch Name and Navigation Links */}
            <div className="mt-4 px-6 py-4 text-center">
              {/* Combined Title */}
              <div 
                className="leading-tight mb-3"
                style={{ 
                  lineHeight: '1.2', 
                  fontFamily: "'Playfair Display', serif",
                  color: 'rgb(191, 69, 30)'
                }}
              >
                <span className="text-syro-h4 font-bold">
                  H.H. Baselios <span className="text-syro-h4 font-bold">Marthoma Mathews III</span>
                </span>
              </div>
              
              {/* Navigation Links with Pipe Separators */}
              <div className="flex items-center justify-center gap-1.5 text-syro-small font-syro-primary" style={{ color: 'rgb(191, 69, 30)' }}>
                <Link
                  href="/syro/holy-synod/his-holiness-baselios-marthoma-mathews-iii"
                  className="hover:underline transition-all duration-200 hover:text-syro-red"
                  style={{ color: 'rgb(191, 69, 30)' }}
                >
                  Biography
                </Link>
                <span className="mx-1" style={{ color: 'rgb(191, 69, 30)' }}>|</span>
                <Link
                  href="/syro/photo-gallery/reception-to-his-holiness-baselios-marthoma-mathews-iii"
                  className="hover:underline transition-all duration-200 hover:text-syro-red"
                  style={{ color: 'rgb(191, 69, 30)' }}
                >
                  Photos
                </Link>
                <span className="mx-1" style={{ color: 'rgb(191, 69, 30)' }}>|</span>
                <Link
                  href="/syro/speeches"
                  className="hover:underline transition-all duration-200 hover:text-syro-red"
                  style={{ color: 'rgb(191, 69, 30)' }}
                >
                  Speeches
                </Link>
              </div>
            </div>
          </div>

          {/* Church Cross */}
          <div className="flex flex-col items-center justify-start">
            <div 
              className="w-48 h-48 lg:w-96 lg:h-96 rounded-full border-2 border-white p-1 flex items-center justify-center"
            >
              <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-transparent p-2">
                <Image
                  src="/images/logos/Current_Edits/MOSC-Center-Image.png"
                  alt="Syro-Malabar Hero Image"
                  width={384}
                  height={384}
                  className="w-full h-full object-contain scale-110"
                  style={{ background: 'transparent' }}
                />
              </div>
            </div>
          </div>

          {/* Third Image */}
          <div className="flex flex-col items-center justify-start">
            <div 
              className="w-48 h-48 lg:w-56 lg:h-56 rounded-full border-2 border-white p-1 flex items-center justify-center"
            >
              <div className="w-full h-full rounded-full overflow-hidden shadow-syro-card bg-white flex items-center justify-center">
                <Image
                  src="/images/logos/Hero-Section-Image-MOSC.jpg"
                  alt="Syro-Malabar Church emblem"
                  width={224}
                  height={224}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Welcome Text */}
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-syro-h3 font-bold text-syro-blue mb-6">
            Welcome to Our Sacred Community
          </h2>
          <p className="text-syro-body text-syro-text-gray leading-relaxed">
            The Syro-Malabar Catholic Church traces its origins to the Apostolic ministry of St. Thomas in India.
            We are a community rooted in ancient traditions, committed to preserving the faith handed down through generations
            while serving our members with love, compassion, and spiritual guidance.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
