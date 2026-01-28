'use client';

import React from 'react';

const WelcomeSection = () => {
  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      title: 'Spiritual Guidance',
      description: 'Find peace and direction through our pastoral care and spiritual counseling services.'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: 'Community Fellowship',
      description: 'Join our vibrant community of believers in worship, service, and Christian fellowship.'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      title: 'Catholic Traditions',
      description: 'Experience the rich liturgical traditions and theological heritage of the Eastern Catholic Church.'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Regular Services',
      description: 'Participate in our daily prayers, Holy Qurbana, and special feast day celebrations.'
    }
  ];

  return (
    <section className="py-16 bg-white syro-dotted-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start mb-12 py-24">
          {/* Vertical Title Section - Left Side (from section[7]) */}
          <div className="lg:w-1/6 relative flex items-end">
            <div className="syro-section-title">
              <h6>Mission & Ministry</h6>
            </div>
          </div>
          
          {/* Content Section - Right Side */}
          <div className="lg:w-5/6 bg-white">
            <div className="text-center lg:text-left mb-12">
              <h2 className="text-syro-h3 font-bold text-syro-blue mb-4">
                Our Mission & Ministry
              </h2>
              <p className="text-syro-body text-syro-text-gray max-w-3xl lg:max-w-none mx-auto lg:mx-0">
                As inheritors of the apostolic tradition established by St. Thomas, we strive to nurture faith,
                preserve our sacred heritage, and serve our community with Christ's love.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 bg-white">
          {features?.map((feature, index) => (
            <div key={index} className="text-center group">
              <div className="w-16 h-16 bg-syro-red-light rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-syro-red transition-all duration-300 text-syro-red group-hover:text-white">
                {feature.icon}
              </div>
              <h3 className="text-syro-h4 font-semibold text-syro-blue mb-3">
                {feature?.title}
              </h3>
              <p className="text-syro-label text-syro-text-gray leading-relaxed">
                {feature?.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WelcomeSection;
