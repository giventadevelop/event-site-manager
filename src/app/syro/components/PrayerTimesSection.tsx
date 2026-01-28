'use client';

import React from 'react';

const PrayerTimesSection = () => {
  const prayerTimes = [
    {
      name: 'Morning Prayer (Sapro)',
      time: '6:00 AM',
      description: 'Begin the day with sacred prayers and psalms',
      icon: 'Sunrise',
      isMain: false
    },
    {
      name: 'Holy Qurbana',
      time: '9:00 AM',
      description: 'The Divine Liturgy - our central act of worship',
      icon: 'Cross',
      isMain: true
    },
    {
      name: 'Evening Prayer (Ramsho)',
      time: '6:00 PM',
      description: 'Conclude the day with thanksgiving and intercession',
      icon: 'Sunset',
      isMain: false
    }
  ];

  const today = new Date();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDay = dayNames[today.getUTCDay()];

  return (
    <section className="py-16 bg-syro-bg-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-syro-h3 font-bold text-syro-blue mb-4">
            Daily Prayer Schedule
          </h2>
          <p className="text-syro-body text-syro-text-gray">
            Join us in prayer throughout the day - Today is {currentDay}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {prayerTimes?.map((prayer, index) => (
            <div
              key={index}
              className={`text-center p-8 rounded-[5px] ${
                prayer?.isMain
                  ? 'bg-syro-red text-white shadow-syro-card-hover'
                  : 'bg-white shadow-syro-card hover:shadow-syro-card-hover'
              } transition-all duration-500`}
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                prayer?.isMain ? 'bg-white/20' : 'bg-syro-red-light'
              }`}>
                <svg
                  className={`w-8 h-8 ${prayer?.isMain ? 'text-white' : 'text-syro-red'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className={`text-syro-h6 font-semibold mb-2 ${
                prayer?.isMain ? 'text-white' : 'text-syro-blue'
              }`}>
                {prayer?.name}
              </h3>
              <p className={`text-syro-h4 font-bold mb-3 ${
                prayer?.isMain ? 'text-white' : 'text-syro-red'
              }`}>
                {prayer?.time}
              </p>
              <p className={`text-syro-label ${
                prayer?.isMain ? 'text-white/90' : 'text-syro-text-gray'
              } leading-relaxed`}>
                {prayer?.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PrayerTimesSection;
