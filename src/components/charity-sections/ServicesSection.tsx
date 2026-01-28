'use client';

import React from 'react';

const culturalServices = [
  {
    icon: (
      <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
      </svg>
    ),
    title: 'Traditional Dance & Music',
    description: 'Experience the rich heritage of Kerala through dance and music workshops.',
    color: 'green'
  },
  {
    icon: (
      <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
      </svg>
    ),
    title: 'Art & Craft Workshops',
    description: 'Learn traditional Kerala art forms and crafts through hands-on workshops.',
    color: 'orange'
  },
  {
    icon: (
      <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: 'Kerala Folklore and Tribal Traditions',
    description: 'Introduce lesser-known folk dances like Theyyam, Padayani, and Poothan Thira.',
    color: 'blue'
  },
  {
    icon: (
      <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
      </svg>
    ),
    title: 'Kerala Cuisine Classes',
    description: 'Master the art of traditional Kerala cooking with expert chefs.',
    color: 'yellow'
  }
];

const ServicesSection: React.FC = () => {
  return (
    <div className="py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-16">
          <div className="flex items-center space-x-2 mb-6">
            <div className="w-5 h-2 bg-yellow-400 rounded"></div>
            <p className="text-gray-600">What we do</p>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center">
            Cultural Workshops and Educational Events
          </h2>
        </div>

        {/* 2x2 Grid Layout matching the attached image */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {culturalServices.map((service, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out group"
            >
              <div className="flex items-start space-x-6">
                {/* Icon on the left */}
                <div className={`
                  flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center
                  ${service.color === 'green' ? 'bg-green-100' : ''}
                  ${service.color === 'orange' ? 'bg-orange-100' : ''}
                  ${service.color === 'blue' ? 'bg-blue-100' : ''}
                  ${service.color === 'yellow' ? 'bg-yellow-100' : ''}
                  group-hover:scale-110 transition-transform duration-300
                `}>
                  {service.icon}
                </div>

                {/* Content on the right */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm lg:text-base">
                    {service.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-6 py-3 rounded-full text-sm font-medium">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Join our cultural community and preserve Kerala's rich heritage</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesSection;