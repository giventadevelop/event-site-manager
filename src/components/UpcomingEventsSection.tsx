'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { EventWithMedia, EventDetailsDTO } from "@/types";
import { formatInTimeZone } from 'date-fns-tz';
import { isRecurringEvent, getNextOccurrenceDate } from '@/lib/eventUtils';
import { isDonationBasedEvent, isTicketedFundraiserEvent } from '@/lib/donation/utils';

// Component to handle event image loading errors and hide container when image fails
function EventImageWithErrorHandling({
  src,
  alt,
  isPastEvent,
}: {
  src: string;
  alt: string;
  isPastEvent: boolean;
}) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Don't render if image fails to load or src is empty
  if (imageError || !src) {
    return isPastEvent ? (
      <div className="relative w-full pt-3 pr-3">
        <div className="flex justify-end">
          <span className="px-3 py-1 bg-gray-500 text-white text-xs font-medium rounded-full">
            Past Event
          </span>
        </div>
      </div>
    ) : null;
  }

  return (
    <div className="relative w-full h-auto rounded-t-2xl overflow-hidden">
      <Image
        src={src}
        alt={alt}
        width={800}
        height={600}
        className="w-full h-auto object-contain group-hover:scale-105 transition-transform duration-300"
        style={{
          backgroundColor: 'transparent',
          borderRadius: '1rem 1rem 0 0',
        }}
        onError={() => {
          setImageError(true);
        }}
        onLoad={() => {
          setImageLoaded(true);
        }}
      />
      {/* Past Event Badge */}
      {isPastEvent && imageLoaded && !imageError && (
        <div className="absolute top-3 right-3">
          <span className="px-3 py-1 bg-gray-500 text-white text-xs font-medium rounded-full">
            Past Event
          </span>
        </div>
      )}
    </div>
  );
}

const UpcomingEventsSection: React.FC = () => {
  const [events, setEvents] = useState<EventWithMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [isUpcomingEvents, setIsUpcomingEvents] = useState(true);

  // Cache key for sessionStorage
  const CACHE_KEY = 'homepage_events_cache';
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Array of modern background colors (same as events page)
  const cardBackgrounds = [
    'bg-gradient-to-br from-blue-50 to-blue-100',
    'bg-gradient-to-br from-green-50 to-green-100',
    'bg-gradient-to-br from-purple-50 to-purple-100',
    'bg-gradient-to-br from-pink-50 to-pink-100',
    'bg-gradient-to-br from-yellow-50 to-yellow-100',
    'bg-gradient-to-br from-indigo-50 to-indigo-100',
    'bg-gradient-to-br from-teal-50 to-teal-100',
    'bg-gradient-to-br from-orange-50 to-orange-100',
    'bg-gradient-to-br from-cyan-50 to-cyan-100',
    'bg-gradient-to-br from-rose-50 to-rose-100'
  ];

  // Function to get random background color for each event
  const getRandomBackground = (index: number) => {
    return cardBackgrounds[index % cardBackgrounds.length];
  };

  useEffect(() => {
    async function fetchEvents() {
      // Check cache first
      try {
        const cachedData = sessionStorage.getItem(CACHE_KEY);
        if (cachedData) {
          const { data, timestamp, isUpcoming } = JSON.parse(cachedData);
          if (Date.now() - timestamp < CACHE_DURATION) {
            console.log('✅ Using cached events data');
            setEvents(data);
            setIsUpcomingEvents(isUpcoming);
            setLoading(false);
            return;
          }
        }
      } catch (error) {
        console.warn('Failed to read events cache:', error);
      }

      setLoading(true);
      setFetchError(false);
      try {
        // First try to get upcoming events
        // Fetch more events (15) to account for recurring events being grouped into single occurrences
        // After processing, we'll limit to 6 events for display
        const today = new Date().toISOString().split('T')[0];
        const upcomingParams = new URLSearchParams({
          sort: 'startDate,asc',
          page: '0',
          size: '15', // Increased from 6 to 15 to ensure we have enough after recurring event grouping
          'startDate.greaterThanOrEqual': today,
          'isActive.equals': 'true' // Only show active events
        });

        const upcomingRes = await fetch(`/api/proxy/event-details?${upcomingParams.toString()}`);
        if (!upcomingRes.ok) throw new Error('Failed to fetch upcoming events');
        const upcomingEvents: EventDetailsDTO[] = await upcomingRes.json();
        let upcomingEventList = Array.isArray(upcomingEvents) ? upcomingEvents : [upcomingEvents];

        // If we have upcoming events, use them
        if (upcomingEventList.length > 0) {
          // Process recurring events to show only next occurrence (same logic as HeroSection)
          const todayDate = new Date();
          todayDate.setHours(0, 0, 0, 0);
          const oneYearFromNow = new Date();
          oneYearFromNow.setFullYear(todayDate.getFullYear() + 1);
          oneYearFromNow.setHours(23, 59, 59, 999);

          const processedEvents: EventDetailsDTO[] = [];
          const recurringSeriesMap = new Map<number, EventDetailsDTO>(); // Map seriesId -> event with earliest next occurrence

          // Process events and filter recurring events to show only next occurrence
          upcomingEventList.forEach((event) => {
            // Handle recurring events
            if (isRecurringEvent(event)) {
              const seriesId = event.recurrenceSeriesId || event.parentEventId || event.id;

              // Calculate next occurrence date
              const nextOccurrence = getNextOccurrenceDate(event, todayDate);

              if (!nextOccurrence) {
                console.log(`[UpcomingEventsSection] Skipping recurring event ${event.id}: No next occurrence found`);
                return; // Skip if no next occurrence
              }

              // Check if next occurrence is within 1 year
              if (nextOccurrence > oneYearFromNow) {
                console.log(`[UpcomingEventsSection] Skipping recurring event ${event.id}: Next occurrence ${nextOccurrence.toISOString()} is beyond 1 year`);
                return; // Skip if beyond 1 year
              }

              // Update event startDate to next occurrence for display
              const nextOccurrenceStr = nextOccurrence.toISOString().split('T')[0];
              const eventWithNextOccurrence = { ...event, startDate: nextOccurrenceStr };

              // Check if we already have an event from this series
              const existingSeriesEvent = recurringSeriesMap.get(seriesId);
              if (!existingSeriesEvent) {
                // First event from this series - add it
                recurringSeriesMap.set(seriesId, eventWithNextOccurrence);
                console.log(`[UpcomingEventsSection] Added recurring event series ${seriesId}: ${event.title} (Next occurrence: ${nextOccurrenceStr})`);
              } else {
                // Compare dates - keep the one with earlier next occurrence
                const existingDate = new Date(existingSeriesEvent.startDate!);
                if (nextOccurrence < existingDate) {
                  recurringSeriesMap.set(seriesId, eventWithNextOccurrence);
                  console.log(`[UpcomingEventsSection] Updated recurring event series ${seriesId}: ${event.title} (Earlier occurrence: ${nextOccurrenceStr})`);
                }
              }
            } else {
              // Check if this is a child event (has parentEventId or recurrenceSeriesId but isRecurring = false)
              const seriesId = event.recurrenceSeriesId || event.parentEventId;
              if (seriesId) {
                // This is a child event - skip it (we'll use the parent event instead)
                console.log(`[UpcomingEventsSection] Skipping child event ${event.id} (series ${seriesId}) - will use parent event`);
                return;
              }
              // Non-recurring event - add directly
              processedEvents.push(event);
            }
          });

          // Add recurring events (only one per series - the next occurrence)
          recurringSeriesMap.forEach((event) => {
            processedEvents.push(event);
          });

          // Sort by startDate to show earliest events first
          processedEvents.sort((a, b) => {
            if (!a.startDate || !b.startDate) return 0;
            return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
          });

          // Limit to 6 events for display after processing
          const limitedEvents = processedEvents.slice(0, 6);

          console.log(`[UpcomingEventsSection] Processed ${processedEvents.length} events (${recurringSeriesMap.size} recurring series, ${processedEvents.length - recurringSeriesMap.size} non-recurring), displaying ${limitedEvents.length} events`);

          const eventsWithMedia = await Promise.all(
            limitedEvents.map(async (event: EventDetailsDTO) => {
              try {
                // First try to find homepage hero image
                let mediaRes = await fetch(`/api/proxy/event-medias?eventId.equals=${event.id}&isHomePageHeroImage.equals=true`);
                let mediaData = await mediaRes.json();

                // If no homepage hero image found, try regular hero image
                if (!mediaData || mediaData.length === 0) {
                  mediaRes = await fetch(`/api/proxy/event-medias?eventId.equals=${event.id}&isHeroImage.equals=true`);
                  mediaData = await mediaRes.json();
                }

                if (mediaData && mediaData.length > 0) {
                  return { ...event, thumbnailUrl: mediaData[0].fileUrl };
                }
                return { ...event, thumbnailUrl: undefined };
              } catch {
                return { ...event, thumbnailUrl: undefined };
              }
            })
          );

          // Cache the upcoming events data
          try {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify({
              data: eventsWithMedia,
              timestamp: Date.now(),
              isUpcoming: true
            }));
          } catch (error) {
            console.warn('Failed to cache events data:', error);
          }

          setEvents(eventsWithMedia);
          setIsUpcomingEvents(true);
        } else {
          // No upcoming events, try to get past events
          // Fetch more events (15) to account for recurring events being grouped into single occurrences
          // After processing, we'll limit to 6 events for display
          const pastParams = new URLSearchParams({
            sort: 'startDate,desc',
            page: '0',
            size: '15', // Increased from 6 to 15 to ensure we have enough after recurring event grouping
            'endDate.lessThan': today,
            'isActive.equals': 'true' // Only show active events
          });

          const pastRes = await fetch(`/api/proxy/event-details?${pastParams.toString()}`);
          if (!pastRes.ok) throw new Error('Failed to fetch past events');
          const pastEvents: EventDetailsDTO[] = await pastRes.json();
          let pastEventList = Array.isArray(pastEvents) ? pastEvents : [pastEvents];

          // Process recurring events to show only next occurrence (same logic as upcoming events)
          const todayDate = new Date();
          todayDate.setHours(0, 0, 0, 0);
          const oneYearFromNow = new Date();
          oneYearFromNow.setFullYear(todayDate.getFullYear() + 1);
          oneYearFromNow.setHours(23, 59, 59, 999);

          const processedPastEvents: EventDetailsDTO[] = [];
          const recurringSeriesMap = new Map<number, EventDetailsDTO>(); // Map seriesId -> event with earliest next occurrence

          // Process events and filter recurring events to show only next occurrence
          pastEventList.forEach((event) => {
            // Handle recurring events
            if (isRecurringEvent(event)) {
              const seriesId = event.recurrenceSeriesId || event.parentEventId || event.id;

              // Calculate next occurrence date
              const nextOccurrence = getNextOccurrenceDate(event, todayDate);

              if (!nextOccurrence) {
                console.log(`[UpcomingEventsSection] Skipping recurring past event ${event.id}: No next occurrence found`);
                return; // Skip if no next occurrence
              }

              // Check if next occurrence is within 1 year
              if (nextOccurrence > oneYearFromNow) {
                console.log(`[UpcomingEventsSection] Skipping recurring past event ${event.id}: Next occurrence ${nextOccurrence.toISOString()} is beyond 1 year`);
                return; // Skip if beyond 1 year
              }

              // Update event startDate to next occurrence for display
              const nextOccurrenceStr = nextOccurrence.toISOString().split('T')[0];
              const eventWithNextOccurrence = { ...event, startDate: nextOccurrenceStr };

              // Check if we already have an event from this series
              const existingSeriesEvent = recurringSeriesMap.get(seriesId);
              if (!existingSeriesEvent) {
                // First event from this series - add it
                recurringSeriesMap.set(seriesId, eventWithNextOccurrence);
                console.log(`[UpcomingEventsSection] Added recurring past event series ${seriesId}: ${event.title} (Next occurrence: ${nextOccurrenceStr})`);
              } else {
                // Compare dates - keep the one with earlier next occurrence
                const existingDate = new Date(existingSeriesEvent.startDate!);
                if (nextOccurrence < existingDate) {
                  recurringSeriesMap.set(seriesId, eventWithNextOccurrence);
                  console.log(`[UpcomingEventsSection] Updated recurring past event series ${seriesId}: ${event.title} (Earlier occurrence: ${nextOccurrenceStr})`);
                }
              }
            } else {
              // Check if this is a child event (has parentEventId or recurrenceSeriesId but isRecurring = false)
              const seriesId = event.recurrenceSeriesId || event.parentEventId;
              if (seriesId) {
                // This is a child event - skip it (we'll use the parent event instead)
                console.log(`[UpcomingEventsSection] Skipping child past event ${event.id} (series ${seriesId}) - will use parent event`);
                return;
              }
              // Non-recurring event - add directly
              processedPastEvents.push(event);
            }
          });

          // Add recurring events (only one per series - the next occurrence)
          recurringSeriesMap.forEach((event) => {
            processedPastEvents.push(event);
          });

          // Sort by startDate descending (most recent first for past events)
          processedPastEvents.sort((a, b) => {
            if (!a.startDate || !b.startDate) return 0;
            return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
          });

          // Limit to 6 events for display after processing
          const limitedPastEvents = processedPastEvents.slice(0, 6);

          console.log(`[UpcomingEventsSection] Processed ${processedPastEvents.length} past events (${recurringSeriesMap.size} recurring series, ${processedPastEvents.length - recurringSeriesMap.size} non-recurring), displaying ${limitedPastEvents.length} events`);

          const eventsWithMedia = await Promise.all(
            limitedPastEvents.map(async (event: EventDetailsDTO) => {
              try {
                // First try to find homepage hero image
                let mediaRes = await fetch(`/api/proxy/event-medias?eventId.equals=${event.id}&isHomePageHeroImage.equals=true`);
                let mediaData = await mediaRes.json();

                // If no homepage hero image found, try regular hero image
                if (!mediaData || mediaData.length === 0) {
                  mediaRes = await fetch(`/api/proxy/event-medias?eventId.equals=${event.id}&isHeroImage.equals=true`);
                  mediaData = await mediaRes.json();
                }

                if (mediaData && mediaData.length > 0) {
                  return { ...event, thumbnailUrl: mediaData[0].fileUrl };
                }
                return { ...event, thumbnailUrl: undefined };
              } catch {
                return { ...event, thumbnailUrl: undefined };
              }
            })
          );

          // Cache the past events data
          try {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify({
              data: eventsWithMedia,
              timestamp: Date.now(),
              isUpcoming: false
            }));
          } catch (error) {
            console.warn('Failed to cache events data:', error);
          }

          setEvents(eventsWithMedia);
          setIsUpcomingEvents(false);
        }
      } catch (err) {
        setFetchError(true);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  // Helper to format time with AM/PM
  function formatTime(time: string): string {
    if (!time) return '';
    if (time.match(/AM|PM/i)) return time;
    const [hourStr, minute] = time.split(':');
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    if (hour === 0) hour = 12;
    return `${hour.toString().padStart(2, '0')}:${minute} ${ampm}`;
  }

  // Helper to format date
  function formatDate(dateString: string, timezone: string = 'America/New_York'): string {
    if (!dateString) return '';
    return formatInTimeZone(dateString, timezone, 'EEEE, MMMM d, yyyy');
  }

  // isUpcomingEvents state is managed in useEffect based on which type of events were fetched

  // Don't render anything while loading - section will appear only when fully loaded
  if (loading) {
    return null;
  }

  // Handle fetch error state - return complete section with header
  if (fetchError) {
    return (
      <section className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-5 h-2 bg-yellow-400 rounded"></div>
              <p className="text-gray-600 font-medium">Upcoming Events</p>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Upcoming Events
            </h2>
          </div>
          <div className="text-center text-gray-500 py-8">
            <div className="bg-white rounded-lg shadow-sm p-8 max-w-md mx-auto">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Upcoming Events Information Temporarily Unavailable</h3>
              <p className="text-gray-500">We're currently updating our upcoming events information. Please check back later.</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Handle no events state - return complete section with header
  if (events.length === 0) {
    return (
      <section className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-5 h-2 bg-yellow-400 rounded"></div>
              <p className="text-gray-600 font-medium">Upcoming Events</p>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Upcoming Events
            </h2>
          </div>
          <div className="text-center text-gray-500 py-8">
            <div className="bg-white rounded-lg shadow-sm p-8 max-w-md mx-auto">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Upcoming Events Information Temporarily Unavailable</h3>
              <p className="text-gray-500">We're currently updating our upcoming events information. Please check back later.</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Normal render with events
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-5 h-2 bg-yellow-400 rounded"></div>
            <p className="text-gray-600 font-medium">Events</p>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {isUpcomingEvents ? 'Upcoming Events' : 'Recent Events'}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {isUpcomingEvents
              ? 'Join us for our upcoming cultural celebrations and community events (showing up to 6 events)'
              : 'Take a look at our recent events and community gatherings (showing up to 6 events)'
            }
          </p>
        </div>

        {/* Events List - Single column layout exactly like sponsors section */}
        <div className="space-y-8 mb-8">
              {events.map((event, index) => (
                <div
                  key={event.id}
                  className={`${getRandomBackground(index)} rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden group`}
                  style={{
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  <div className="flex flex-col h-full">
                    {/* Image Section - Top on all screen sizes, exactly like events page */}
                    {event.thumbnailUrl && (
                      <Link
                        href={`/events/${event.id}/checkout`}
                        className="block cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <EventImageWithErrorHandling
                          src={event.thumbnailUrl}
                          alt={event.title}
                          isPastEvent={!isUpcomingEvents}
                        />
                      </Link>
                    )}
                    {/* Past Event Badge - Show at top of content if no image */}
                    {!event.thumbnailUrl && !isUpcomingEvents && (
                      <div className="relative w-full pt-3 pr-3">
                        <div className="flex justify-end">
                          <span className="px-3 py-1 bg-gray-500 text-white text-xs font-medium rounded-full">
                            Past Event
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Content Section - Bottom on all screen sizes, exactly like events page */}
                    <div className={`p-5 ${event.thumbnailUrl ? 'border-t border-white/20' : ''}`}>
                      {/* Title */}
                      <h2 className="text-xl font-bold text-gray-800 mb-2">
                        {event.title}
                      </h2>

                      {/* Caption */}
                      {event.caption && (
                        <p className="text-gray-600 text-base mb-3">
                          {event.caption}
                        </p>
                      )}

                      {/* Event Details - Centered flexbox layout */}
                      <div className="flex flex-wrap justify-center gap-3 mb-2 lg:max-w-4xl lg:mx-auto">
                        <div className="flex items-center gap-3 text-gray-700 w-full sm:w-auto sm:min-w-[280px]">
                          <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <span className="text-lg font-semibold">
                            {formatDate(event.startDate, event.timezone)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-700 w-full sm:w-auto sm:min-w-[280px]">
                          <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <span className="text-lg font-semibold">
                            {formatTime(event.startTime)} - {formatTime(event.endTime)}
                          </span>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-3 text-gray-700 w-full sm:w-auto sm:min-w-[280px]">
                            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <svg className="w-10 h-10 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </div>
                            <span className="text-lg font-semibold">
                              {event.location}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-2 mt-4">
                        {/* See Event Details Button */}
                        <Link
                          href={`/events/${event.id}`}
                          onClick={(e) => e.stopPropagation()}
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

                        {/* Register Here Button - Show if registration is required and event is upcoming */}
                        {isUpcomingEvents && event.isRegistrationRequired === true && (
                          <Link
                            href={`/events/${event.id}/register`}
                            onClick={(e) => e.stopPropagation()}
                            className="transition-transform hover:scale-105 inline-block"
                          >
                            <img
                              src="/images/register_here_button.jpg"
                              alt="Register Here"
                              className="object-contain"
                              style={{
                                width: '200px',
                                height: '70px'
                              }}
                            />
                          </Link>
                        )}

                        {/* Fundraiser Image - Show for ticketed fundraiser/charity events (replaces Buy Tickets button) */}
                        {isUpcomingEvents && isTicketedFundraiserEvent(event) && (
                          <Link
                            href={`/events/${event.id}/donation-checkout`}
                            onClick={(e) => e.stopPropagation()}
                            className="transition-transform hover:scale-105 inline-block"
                            title="Buy Tickets"
                            aria-label="Buy Tickets"
                          >
                            <img
                              src="/images/buy_tickets_click_here_fundraiser.png"
                              alt="Buy Tickets"
                              className="object-contain"
                              style={{
                                width: '200px',
                                height: '70px'
                              }}
                            />
                          </Link>
                        )}

                        {/* Buy Tickets Button - Only for TICKETED events and upcoming events (case-insensitive) */}
                        {/* BUT NOT if it's a ticketed fundraiser (use fundraiser image instead) */}
                        {isUpcomingEvents && event.admissionType?.toUpperCase() === 'TICKETED' && !isTicketedFundraiserEvent(event) && (
                          <Link
                            href={`/events/${event.id}/checkout`}
                            onClick={(e) => e.stopPropagation()}
                            className="transition-transform hover:scale-105 inline-block"
                            title="Buy Tickets"
                            aria-label="Buy Tickets"
                          >
                            <img
                              src="/images/buy_tickets_click_here_red.webp"
                              alt="Buy Tickets"
                              className="object-contain"
                              style={{
                                width: '200px',
                                height: '70px'
                              }}
                            />
                          </Link>
                        )}

                        {/* Make a Donation Button - Show for donation-based events (not ticketed fundraiser) */}
                        {isUpcomingEvents && isDonationBasedEvent(event) && !isTicketedFundraiserEvent(event) && (
                          <Link
                            href={`/events/${event.id}/donation`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex-shrink-0 h-14 rounded-xl bg-teal-100 hover:bg-teal-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
                            title="Make a Donation"
                            aria-label="Make a Donation"
                          >
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-teal-200 flex items-center justify-center">
                              <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <span className="font-semibold text-teal-700">Make a Donation</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
        </div>

        {/* View All Events Button */}
        <div className="text-center">
          <Link
            href="/events"
            className="inline-flex flex-shrink-0 h-14 rounded-xl bg-indigo-100 hover:bg-indigo-200 items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
            title="View All Events"
            aria-label="View All Events"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-200 flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <span className="font-semibold text-indigo-700">View All Events</span>
          </Link>
        </div>
      </div>

      <style jsx>{`
        .line-clamp-1 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 1;
        }
        .line-clamp-2 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }

        /* Events Grid with Perfect Centering like TeamSection */
        .events-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 1.5rem;
          width: 100%;
          justify-content: center;
          align-items: flex-start;
          margin: 0 auto;
        }

        /* Desktop: 3 columns with centered alignment (for up to 6 events) */
        @media (min-width: 1200px) {
          .events-grid {
            max-width: calc(3 * 300px + 2 * 1.5rem);
          }
        }

        /* Large tablet: 2 columns with centered alignment */
        @media (min-width: 900px) and (max-width: 1199px) {
          .events-grid {
            max-width: calc(2 * 300px + 1 * 1.5rem);
          }
        }

        /* Tablet: 2 columns with centered alignment */
        @media (min-width: 600px) and (max-width: 899px) {
          .events-grid {
            max-width: calc(2 * 300px + 1 * 1.5rem);
          }
        }

        /* Mobile: 1 column with centered alignment */
        @media (max-width: 599px) {
          .events-grid {
            max-width: 320px;
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
    </section>
  );
};

export default UpcomingEventsSection;
