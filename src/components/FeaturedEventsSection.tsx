'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatInTimeZone } from 'date-fns-tz';
import type { EventDetailsDTO, EventMediaDTO } from '@/types';
import { useFilteredEvents } from '@/hooks/useFilteredEvents';

interface FeaturedEventWithMedia {
  event: EventDetailsDTO;
  media: EventMediaDTO;
}

const FeaturedEventsSection: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { filteredEvents, isLoading, error } = useFilteredEvents('featured');

  // Helper to generate Google Calendar URL
  function toGoogleCalendarDate(date: string, time: string) {
    if (!date || !time) return '';
    const [year, month, day] = date.split('-');
    let [hour, minute] = time.split(':');
    let ampm = '';
    if (minute && minute.includes(' ')) {
      [minute, ampm] = minute.split(' ');
    }
    let h = parseInt(hour, 10);
    if (ampm && ampm.toUpperCase() === 'PM' && h !== 12) h += 12;
    if (ampm && ampm.toUpperCase() === 'AM' && h === 12) h = 0;
    return `${year}${month}${day}T${String(h).padStart(2, '0')}${minute || '00'}00`;
  }

  // Show section after hero section is loaded (same timing as HeroSection)
  useEffect(() => {
    if (!isLoading && filteredEvents.length > 0) {
      setTimeout(() => {
        setIsVisible(true);
      }, 2000);
    }
  }, [isLoading, filteredEvents.length]);

  // Don't render anything if loading or no featured events
  if (isLoading || filteredEvents.length === 0) {
    return null;
  }

  // Don't render if not visible yet
  if (!isVisible) {
    return null;
  }

  return (
    <section className="py-0 md:py-0.5 bg-gradient-to-r from-blue-50 to-indigo-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Featured Events
          </h2>
        </div>

        {/* Featured Events Strip */}
        <div className="space-y-4 md:space-y-6">
          {filteredEvents.map((featuredEvent, index) => (
            <div
              key={featuredEvent.event.id}
              className="bg-white rounded-2xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden h-auto md:h-[200px]"
            >
              <div className="flex flex-col md:flex-row h-full">
                {/* Left Column - Featured Event Image (60% width on desktop, full width on mobile) */}
                <div className="w-full md:w-[60%] h-48 md:h-full relative overflow-hidden rounded-t-2xl md:rounded-t-none md:rounded-l-2xl">
                  {featuredEvent.media.fileUrl ? (
                    <Image
                      src={featuredEvent.media.fileUrl}
                      alt={featuredEvent.media.altText || featuredEvent.event.title}
                      fill
                      className="object-cover"
                      style={{
                        backgroundColor: 'transparent'
                      }}
                      priority={index === 0}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm">No image available</p>
                      </div>
                    </div>
                  )}

                  {/* Featured Event Badge Overlay */}
                  <div className="absolute top-4 left-4">
                    <div className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-1 rounded-full">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                      <span className="text-xs font-semibold uppercase tracking-wide">
                        Featured Event
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Column - Event Details (40% width on desktop, full width on mobile) */}
                <div className="w-full md:w-[40%] p-4 md:p-6 flex flex-col justify-center bg-gradient-to-br from-blue-50 to-indigo-100 rounded-b-2xl md:rounded-b-none md:rounded-r-2xl">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                        {featuredEvent.event.title}
                      </h3>
                    </div>

                    {/* Event Details - Centered flexbox layout */}
                    <div className="flex flex-wrap justify-center gap-3 mb-2 lg:max-w-4xl lg:mx-auto">
                      <div className="flex items-center gap-3 text-gray-700 w-full sm:w-auto sm:min-w-[200px]">
                        <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <span className="text-lg font-semibold">
                          {featuredEvent.event.timezone
                            ? formatInTimeZone(featuredEvent.event.startDate, featuredEvent.event.timezone, 'EEEE, MMMM d, yyyy (zzz)')
                            : new Date(featuredEvent.event.startDate).toLocaleDateString()
                          }
                        </span>
                      </div>

                      {featuredEvent.event.startTime && (
                        <div className="flex items-center gap-3 text-gray-700 w-full sm:w-auto sm:min-w-[200px]">
                          <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <span className="text-lg font-semibold">{featuredEvent.event.startTime}</span>
                        </div>
                      )}

                      {featuredEvent.event.location && (
                        <div className="flex items-center gap-3 text-gray-700 w-full sm:w-auto sm:min-w-[200px]">
                          <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-10 h-10 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <span className="text-lg font-semibold truncate">{featuredEvent.event.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 flex flex-col sm:flex-row gap-2">
                      {/* See Event Details Button */}
                      <Link
                        href={`/events/${featuredEvent.event.id}`}
                        className="flex-shrink-0 h-14 rounded-xl bg-green-100 hover:bg-green-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
                        title="See Event Details"
                        aria-label="See Event Details"
                      >
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-200 flex items-center justify-center">
                          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </div>
                        <span className="font-semibold text-green-700">See Event Details</span>
                      </Link>

                      {/* Add to Calendar Button - Only for upcoming events */}
                      {(() => {
                        const currentDate = new Date();
                        currentDate.setHours(0, 0, 0, 0);
                        const eventDate = featuredEvent.event.startDate ? new Date(featuredEvent.event.startDate) : null;
                        if (eventDate) {
                          eventDate.setHours(0, 0, 0, 0);
                        }
                        const isUpcoming = eventDate && eventDate >= currentDate;

                        if (!isUpcoming || !featuredEvent.event.startDate || !featuredEvent.event.startTime) return null;

                        const start = toGoogleCalendarDate(featuredEvent.event.startDate, featuredEvent.event.startTime);
                        const end = toGoogleCalendarDate(featuredEvent.event.endDate || featuredEvent.event.startDate, featuredEvent.event.endTime || featuredEvent.event.startTime);
                        const text = encodeURIComponent(featuredEvent.event.title);
                        const details = encodeURIComponent(featuredEvent.event.description || '');
                        const location = encodeURIComponent(featuredEvent.event.location || '');
                        const calendarLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${start}/${end}&details=${details}&location=${location}`;

                        return (
                          <a
                            href={calendarLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-xl border border-gray-200 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                          >
                            <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <span>Add to Calendar</span>
                          </a>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default FeaturedEventsSection;
