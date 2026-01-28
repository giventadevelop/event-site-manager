'use client';

import React, { useState } from 'react';

const AnnouncementsSection = () => {
  const announcements = [
    {
      id: 1,
      title: 'Christmas Season Services',
      date: '2025-12-15',
      category: 'Liturgical',
      excerpt: `Join us for the sacred Christmas season celebrations beginning December 15th. Special services include Advent prayers, Christmas Eve Holy Qurbana, and New Year blessings.`,
      isUrgent: false
    },
    {
      id: 2,
      title: 'Parish Council Meeting',
      date: '2025-10-05',
      category: 'Administrative',
      excerpt: `Monthly parish council meeting scheduled for October 5th at 7:00 PM in the church hall. Agenda includes budget review, upcoming events planning, and community outreach programs.`,
      isUrgent: true
    },
    {
      id: 3,
      title: 'Youth Fellowship Retreat',
      date: '2025-10-20',
      category: 'Youth Ministry',
      excerpt: `Annual youth fellowship retreat focusing on spiritual growth, community service, and leadership development. Open to all youth members aged 16-30.`,
      isUrgent: false
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-syro-h3 font-bold text-syro-blue mb-4">
            Recent Announcements
          </h2>
          <p className="text-syro-body text-syro-text-gray">
            Stay updated with the latest news and events from our church community.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className="bg-syro-bg-gray p-6 rounded-[5px] shadow-syro-card hover:shadow-syro-card-hover transition-all duration-500"
            >
              {announcement.isUrgent && (
                <span className="inline-block py-1 px-3 rounded text-syro-small font-medium bg-syro-warning-bg text-syro-warning mb-3">
                  Urgent
                </span>
              )}
              <h3 className="text-syro-h6 font-semibold text-syro-blue mb-2">
                {announcement.title}
              </h3>
              <p className="text-syro-small text-syro-medium-gray mb-3">
                {new Date(announcement.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <p className="text-syro-label text-syro-text-gray leading-relaxed">
                {announcement.excerpt}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AnnouncementsSection;
