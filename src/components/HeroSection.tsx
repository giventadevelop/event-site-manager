'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { EventWithMedia } from '@/types';
import { useFilteredEvents } from '@/hooks/useFilteredEvents';
import { isRecurringEvent, getNextOccurrenceDate } from '@/lib/eventUtils';
import { isTicketedFundraiserEvent } from '@/lib/donation/utils';
import { Ticket, ArrowRight, Sparkles, Users, Heart, Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react';
import GivebutterDonateButton from '@/components/GivebutterDonateButton';

// Extended event type
interface EventWithMediaExtended extends EventWithMedia {
  placeholderText?: string;
}

// Hands/Heart Icon SVG for About Card
const HandsHeartIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M40 20C40 20 32 12 24 12C16 12 10 18 10 26C10 40 40 56 40 56C40 56 70 40 70 26C70 18 64 12 56 12C48 12 40 20 40 20Z"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M20 44V64C20 66 22 68 24 68H32C34 68 36 66 36 64V52"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M60 44V64C60 66 58 68 56 68H48C46 68 44 66 44 64V52"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M28 52H52"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
);

// Dynamic Hero Image Component
const DynamicHeroImage: React.FC<{
  onEventChange?: (event: EventWithMediaExtended | null) => void;
}> = ({ onEventChange }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [dynamicImages, setDynamicImages] = useState<string[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<EventWithMediaExtended[]>([]);
  const [imageDurations, setImageDurations] = useState<number[]>([]); // Duration in milliseconds for each image
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const touchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const rotationTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  // Ref to store latest durations array to avoid stale closures
  const imageDurationsRef = React.useRef<number[]>([]);
  // Refs to store latest arrays to avoid stale closures in recursive function
  const dynamicImagesRef = React.useRef<string[]>([]);
  const upcomingEventsRef = React.useRef<EventWithMediaExtended[]>([]);
  // Ref to store latest isPaused state to avoid stale closures
  const isPausedRef = React.useRef<boolean>(false);
  // Ref to track the last scheduled image index to prevent duplicate scheduling
  const lastScheduledIndexRef = React.useRef<number | null>(null);

  const { filteredEvents, isLoading: eventsLoading, error } = useFilteredEvents('hero');

  const defaultImage = "/images/hero_section/default_hero_section_second_column_poster.webp";

  // Store onEventChange in a ref to avoid dependency issues in the rotation effect
  const onEventChangeRef = React.useRef(onEventChange);
  React.useEffect(() => {
    onEventChangeRef.current = onEventChange;
  }, [onEventChange]);

  // Initialize hero images
  useEffect(() => {
    const initializeHeroImages = async () => {
      try {
        const imageUrls: string[] = [];
        const processedEvents: EventWithMediaExtended[] = [];
        const durations: number[] = []; // Duration in milliseconds for each image

        if (filteredEvents && filteredEvents.length > 0) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const oneYearFromNow = new Date();
          oneYearFromNow.setFullYear(today.getFullYear() + 1);

          const recurringSeriesMap = new Map<number, EventWithMediaExtended>();

          filteredEvents.forEach(({ event, media }) => {
            // Extract duration from media (convert seconds to milliseconds, default to 8000ms if null)
            const durationSeconds = media.homePageHeroDisplayDurationSeconds;
            const durationMs = durationSeconds != null && durationSeconds > 0 
              ? Math.max(1000, Math.min(600000, durationSeconds * 1000)) // Clamp 1s-10min in ms
              : 8000; // Default 8 seconds in milliseconds

            const eventWithMedia: EventWithMediaExtended = {
              ...event,
              thumbnailUrl: media.fileUrl,
              media: [media],
              // Store duration for later use when building imageUrls array
              heroDisplayDurationMs: durationMs
            } as EventWithMediaExtended & { heroDisplayDurationMs: number };

            if (isRecurringEvent(event)) {
              const seriesId = event.recurrenceSeriesId || event.parentEventId || event.id;
              const nextOccurrence = getNextOccurrenceDate(event, today);

              if (!nextOccurrence || nextOccurrence > oneYearFromNow) return;

              const nextOccurrenceStr = nextOccurrence.toISOString().split('T')[0];
              eventWithMedia.startDate = nextOccurrenceStr;

              const existingSeriesEvent = recurringSeriesMap.get(seriesId);
              if (!existingSeriesEvent) {
                recurringSeriesMap.set(seriesId, eventWithMedia);
              } else {
                const existingDate = new Date(existingSeriesEvent.startDate!);
                if (nextOccurrence < existingDate) {
                  recurringSeriesMap.set(seriesId, eventWithMedia);
                }
              }
            } else {
              processedEvents.push(eventWithMedia);
            }
          });

          recurringSeriesMap.forEach((event) => processedEvents.push(event));

          processedEvents.sort((a, b) => {
            if (!a.startDate || !b.startDate) return 0;
            return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
          });

          // Add event images and their durations
          processedEvents.forEach((e, index) => {
            if (e.thumbnailUrl) {
              imageUrls.push(e.thumbnailUrl);
              // Get duration from event (stored in heroDisplayDurationMs property)
              const eventDuration = (e as any).heroDisplayDurationMs || 8000; // Default 8 seconds
              durations.push(eventDuration);
              console.log(`[HeroSection] Event ${index + 1} duration: ${eventDuration}ms (${eventDuration / 1000}s)`, {
                eventId: e.id,
                eventTitle: e.title,
                durationSeconds: (e as any).heroDisplayDurationMs ? (e as any).heroDisplayDurationMs / 1000 : null,
                mediaDurationSeconds: e.media?.[0]?.homePageHeroDisplayDurationSeconds
              });
            }
          });
        }

        // ALWAYS add default image at the end of the rotation (use default 8 seconds)
        imageUrls.push(defaultImage);
        durations.push(8000); // Default image uses default 8 seconds

        console.log('[HeroSection] Image rotation initialized:', {
          totalImages: imageUrls.length,
          eventImages: imageUrls.length - 1,
          hasDefaultImage: true,
          durations: durations.map(d => `${d}ms (${d / 1000}s)`)
        });

        setUpcomingEvents(processedEvents);
        setDynamicImages(imageUrls);
        setImageDurations(durations); // Set the durations array
        // Store in refs for latest access in recursive rotation function
        imageDurationsRef.current = durations;
        dynamicImagesRef.current = imageUrls;
        upcomingEventsRef.current = processedEvents;
        setIsInitialized(true);

        // Set initial event (first event or null if only default image)
        if (processedEvents.length > 0 && onEventChangeRef.current) {
          onEventChangeRef.current(processedEvents[0]);
        } else if (onEventChangeRef.current) {
          onEventChangeRef.current(null);
        }
      } catch (error) {
        console.error('Failed to initialize hero images:', error);
        setDynamicImages([defaultImage]);
        setIsInitialized(true);
      }
    };

    if (!eventsLoading && !error) {
      initializeHeroImages();
    }
  }, [filteredEvents, eventsLoading, error]);

  // Update refs whenever state changes to avoid stale closures
  useEffect(() => {
    imageDurationsRef.current = imageDurations;
  }, [imageDurations]);
  
  useEffect(() => {
    dynamicImagesRef.current = dynamicImages;
  }, [dynamicImages]);
  
  useEffect(() => {
    upcomingEventsRef.current = upcomingEvents;
  }, [upcomingEvents]);
  
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // Store scheduleNextRotation in a ref to avoid dependency issues
  const scheduleNextRotationRef = React.useRef<((imageIndex: number) => void) | null>(null);

  // Shared recursive function to rotate to next image with dynamic duration
  // Use refs to access the latest arrays to avoid stale closures
  // This function is used both by the rotation effect and manual navigation
  const scheduleNextRotation = React.useCallback((imageIndex: number) => {
    // CRITICAL: Prevent duplicate scheduling for the same image index
    if (lastScheduledIndexRef.current === imageIndex && rotationTimeoutRef.current !== null) {
      console.log('[HeroSection] Duplicate schedule prevented for index', imageIndex);
      return;
    }

    // CRITICAL: Clear any existing timeout before scheduling a new one to prevent duplicates
    if (rotationTimeoutRef.current) {
      clearTimeout(rotationTimeoutRef.current);
      rotationTimeoutRef.current = null;
    }

    // Don't schedule if paused or not initialized - use refs to get latest values
    if (isPausedRef.current || !isInitialized) {
      lastScheduledIndexRef.current = null;
      return;
    }

    // Mark this index as scheduled
    lastScheduledIndexRef.current = imageIndex;

    // CRITICAL: Access all arrays from refs to get the latest values, not from closure
    const currentDurations = imageDurationsRef.current;
    const currentImages = dynamicImagesRef.current;
    const currentEvents = upcomingEventsRef.current;
    
    // Safety check
    if (!currentImages || currentImages.length < 2) {
      return;
    }
    
    // Get duration for the specified image (default to 8 seconds if not available)
    const imageDuration = (currentDurations && currentDurations[imageIndex]) ? currentDurations[imageIndex] : 8000;
    
    console.log('[HeroSection] Scheduling next rotation:', {
      currentIndex: imageIndex,
      currentDurationMs: imageDuration,
      currentDurationSec: imageDuration / 1000,
      totalImages: currentImages.length,
      imageUrl: currentImages[imageIndex] || 'default',
      durationsArray: currentDurations,
      durationsArrayLength: currentDurations?.length
    });

    rotationTimeoutRef.current = setTimeout(() => {
      // Clear the scheduled index ref when timeout executes
      lastScheduledIndexRef.current = null;
      
      setIsTransitioning(true);

      setTimeout(() => {
        setCurrentImageIndex((prevIndex) => {
          // CRITICAL: Get latest arrays from refs, not closure
          const latestDurations = imageDurationsRef.current;
          const latestImages = dynamicImagesRef.current;
          const latestEvents = upcomingEventsRef.current;
          
          const nextIndex = (prevIndex + 1) % latestImages.length;
          const nextDuration = (latestDurations && latestDurations[nextIndex]) ? latestDurations[nextIndex] : 8000;

          console.log('[HeroSection] Rotating to image', nextIndex + 1, 'of', latestImages.length, {
            previousIndex: prevIndex,
            nextIndex,
            nextDurationMs: nextDuration,
            nextDurationSec: nextDuration / 1000,
            nextImageUrl: latestImages[nextIndex] || 'default',
            durationsArray: latestDurations,
            durationsArrayLength: latestDurations?.length
          });

          // Update current event based on new index
          // The last image is always the default image (no event)
          if (nextIndex < latestEvents.length && onEventChangeRef.current) {
            onEventChangeRef.current(latestEvents[nextIndex]);
          } else if (onEventChangeRef.current) {
            // Default image - no event associated
            onEventChangeRef.current(null);
          }

          // Schedule next rotation with the new image's duration (use nextIndex)
          // Access latest arrays from refs in the next schedule call
          // Use ref to check pause state to avoid stale closure
          // Use the ref to call the function to avoid closure issues
          // Schedule after a small delay to ensure state update completes
          setTimeout(() => {
            if (!isPausedRef.current && scheduleNextRotationRef.current) {
              scheduleNextRotationRef.current(nextIndex);
            }
          }, 10);

          return nextIndex;
        });

        // Remove transition class after image changes
        setTimeout(() => setIsTransitioning(false), 50);
      }, 400);
    }, imageDuration);
  }, [isInitialized]);

  // Update the ref whenever the function changes
  useEffect(() => {
    scheduleNextRotationRef.current = scheduleNextRotation;
  }, [scheduleNextRotation]);

  // Image rotation effect - continuous loop with per-image durations (pauses when isPaused is true)
  useEffect(() => {
    // Don't start rotation until initialized and we have at least 2 images
    if (!isInitialized || dynamicImages.length < 2 || isPaused) {
      console.log('[HeroSection] Rotation not started:', { isInitialized, imageCount: dynamicImages.length, isPaused });
      // Clear any existing timeout when paused
      if (rotationTimeoutRef.current) {
        clearTimeout(rotationTimeoutRef.current);
        rotationTimeoutRef.current = null;
      }
      return;
    }

    console.log('[HeroSection] Starting image rotation with', dynamicImages.length, 'images');
    console.log('[HeroSection] Image durations:', imageDurations.map((d, i) => `Image ${i + 1}: ${d}ms (${d / 1000}s)`));

    // CRITICAL: Clear any existing timeout before starting new rotation to prevent duplicates
    if (rotationTimeoutRef.current) {
      clearTimeout(rotationTimeoutRef.current);
      rotationTimeoutRef.current = null;
    }

    // Reset the scheduled index guard when starting fresh rotation
    lastScheduledIndexRef.current = null;

    // Start the rotation cycle with the current image index (0 for first image)
    // Use the ref to call the function to avoid dependency issues
    // Use setTimeout to ensure this runs after any pending state updates
    setTimeout(() => {
      if (scheduleNextRotationRef.current && !isPausedRef.current) {
        scheduleNextRotationRef.current(currentImageIndex);
      }
    }, 0);

    return () => {
      console.log('[HeroSection] Cleaning up rotation timeout');
      if (rotationTimeoutRef.current) {
        clearTimeout(rotationTimeoutRef.current);
        rotationTimeoutRef.current = null;
      }
      lastScheduledIndexRef.current = null;
    };
  }, [isInitialized, dynamicImages.length, upcomingEvents.length, isPaused]);

  // Navigation functions
  const goToPrevious = () => {
    // Clear existing rotation timeout when manually navigating
    if (rotationTimeoutRef.current) {
      clearTimeout(rotationTimeoutRef.current);
      rotationTimeoutRef.current = null;
    }
    lastScheduledIndexRef.current = null;

    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentImageIndex((prevIndex) => {
        // Use refs to get latest arrays
        const latestImages = dynamicImagesRef.current;
        const latestEvents = upcomingEventsRef.current;
        
        const newIndex = (prevIndex - 1 + latestImages.length) % latestImages.length;
        
        // Update current event
        if (newIndex < latestEvents.length && onEventChangeRef.current) {
          onEventChangeRef.current(latestEvents[newIndex]);
        } else if (onEventChangeRef.current) {
          onEventChangeRef.current(null);
        }
        
        // Restart rotation from new index after navigation completes
        // Use ref to call the function to avoid closure issues
        setTimeout(() => {
          if (scheduleNextRotationRef.current) {
            scheduleNextRotationRef.current(newIndex);
          }
        }, 100);
        
        return newIndex;
      });
      setTimeout(() => setIsTransitioning(false), 50);
    }, 400);
  };

  const goToNext = () => {
    // Clear existing rotation timeout when manually navigating
    if (rotationTimeoutRef.current) {
      clearTimeout(rotationTimeoutRef.current);
      rotationTimeoutRef.current = null;
    }
    lastScheduledIndexRef.current = null;

    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentImageIndex((prevIndex) => {
        // Use refs to get latest arrays
        const latestImages = dynamicImagesRef.current;
        const latestEvents = upcomingEventsRef.current;
        
        const nextIndex = (prevIndex + 1) % latestImages.length;
        
        // Update current event
        if (nextIndex < latestEvents.length && onEventChangeRef.current) {
          onEventChangeRef.current(latestEvents[nextIndex]);
        } else if (onEventChangeRef.current) {
          onEventChangeRef.current(null);
        }
        
        // Restart rotation from new index after navigation completes
        // Use ref to call the function to avoid closure issues
        setTimeout(() => {
          if (scheduleNextRotationRef.current) {
            scheduleNextRotationRef.current(nextIndex);
          }
        }, 100);
        
        return nextIndex;
      });
      setTimeout(() => setIsTransitioning(false), 50);
    }, 400);
  };

  const togglePlayPause = () => {
    setIsPaused((prev) => !prev);
  };

  // Touch event handlers for mobile
  const handleTouchStart = () => {
    setIsTouched(true);
    // Clear existing timeout
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
    }
    // Hide controls after 3 seconds if no interaction
    touchTimeoutRef.current = setTimeout(() => {
      setIsTouched(false);
      touchTimeoutRef.current = null;
    }, 3000);
  };

  // Keep controls visible on touch interaction
  const handleTouchInteraction = () => {
    setIsTouched(true);
    // Clear existing timeout
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
    }
    // Reset timeout on any touch interaction
    touchTimeoutRef.current = setTimeout(() => {
      setIsTouched(false);
      touchTimeoutRef.current = null;
    }, 3000);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
      }
    };
  }, []);

  const currentImage = dynamicImages[currentImageIndex] || defaultImage;
  const showControls = isHovered || isTouched;
  const hasMultipleImages = dynamicImages.length > 1;

  return (
    <div
      className="relative w-full h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
    >
      <Image
        src={currentImage}
        alt="Featured Event"
        fill
        className={`object-contain hero-image-transition ${isTransitioning ? 'transitioning' : ''}`}
        sizes="100vw"
        priority
      />

      {/* Slider Controls - Show on hover or touch */}
      {/* Controls positioned above image and Buy Tickets overlay (z-20) */}
      {hasMultipleImages && showControls && (
        <div 
          className="absolute inset-0 flex items-center justify-between px-4 z-20 pointer-events-none"
          onTouchStart={handleTouchInteraction}
        >
          {/* Previous Button - Left */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              goToPrevious();
            }}
            onTouchStart={handleTouchInteraction}
            className="pointer-events-auto flex-shrink-0 w-12 h-12 rounded-full bg-white/90 hover:bg-white active:bg-white backdrop-blur-sm shadow-lg border-2 border-gray-300 hover:border-blue-500 active:border-blue-600 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
            title="Previous Image"
            aria-label="Previous Image"
            type="button"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>

          {/* Play/Pause Button - Center */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              togglePlayPause();
            }}
            onTouchStart={handleTouchInteraction}
            className="pointer-events-auto flex-shrink-0 w-12 h-12 rounded-full bg-white/90 hover:bg-white active:bg-white backdrop-blur-sm shadow-lg border-2 border-gray-300 hover:border-blue-500 active:border-blue-600 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
            title={isPaused ? 'Play' : 'Pause'}
            aria-label={isPaused ? 'Play' : 'Pause'}
            type="button"
          >
            {isPaused ? (
              <Play className="w-6 h-6 text-gray-700 ml-0.5" />
            ) : (
              <Pause className="w-6 h-6 text-gray-700" />
            )}
          </button>

          {/* Next Button - Right */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              goToNext();
            }}
            onTouchStart={handleTouchInteraction}
            className="pointer-events-auto flex-shrink-0 w-12 h-12 rounded-full bg-white/90 hover:bg-white active:bg-white backdrop-blur-sm shadow-lg border-2 border-gray-300 hover:border-blue-500 active:border-blue-600 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
            title="Next Image"
            aria-label="Next Image"
            type="button"
          >
            <ChevronRight className="w-6 h-6 text-gray-700" />
          </button>
        </div>
      )}
    </div>
  );
};

const HeroSection: React.FC = () => {
  const [currentEvent, setCurrentEvent] = useState<EventWithMediaExtended | null>(null);

  // Determine overlay image and route based on event type (matching events page logic)
  const getOverlayInfo = (event: EventWithMediaExtended | null) => {
    if (!event || !event.id) return null;

    // Check if event is upcoming (today or future)
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const eventDateStr = event.startDate ? event.startDate.split('T')[0] : null;
    
    if (!eventDateStr) return null;
    
    const isToday = eventDateStr === todayStr;
    const isFuture = eventDateStr > todayStr;
    const isUpcomingLocal = isToday || isFuture;

    if (!isUpcomingLocal) return null; // Don't show overlay for past events

    // Check if event is ticketed fundraiser/charity (shows special fundraiser image)
    const isTicketedFundraiser = isTicketedFundraiserEvent(event);
    
    if (isTicketedFundraiser) {
      return {
        image: '/images/buy_tickets_click_here_fundraiser.png',
        href: `/events/${event.id}/donation-checkout`,
        alt: 'Buy Tickets'
      };
    }

    // Check if event is regular ticketed event
    if (event.admissionType?.toUpperCase() === 'TICKETED') {
      // Route to manual checkout if manual payment is enabled, otherwise Stripe checkout
      const checkoutRoute =
        event.manualPaymentEnabled === true &&
        (event.paymentFlowMode === 'MANUAL_ONLY' || event.paymentFlowMode === 'HYBRID')
          ? `/events/${event.id}/manual-checkout`
          : `/events/${event.id}/checkout`;

      return {
        image: '/images/buy_tickets_click_here_red.webp',
        href: checkoutRoute,
        alt: 'Buy Tickets'
      };
    }

    return null;
  };

  const overlayInfo = getOverlayInfo(currentEvent);

  return (
    <section className="hero-container">
      {/* Main Hero Image */}
      <div className="hero-image-wrapper">
        <DynamicHeroImage onEventChange={setCurrentEvent} />

        {/* Buy Tickets Overlay Image - Bottom Right Corner (matching events page style) */}
        {overlayInfo && (
          <div className="absolute bottom-4 right-4 z-10">
            <Link
              href={overlayInfo.href}
              className="block cursor-pointer hover:scale-105 transition-transform duration-300"
              onClick={(e) => e.stopPropagation()}
              title={overlayInfo.alt}
              aria-label={overlayInfo.alt}
            >
              <img
                src={overlayInfo.image}
                alt={overlayInfo.alt}
                className="object-contain w-[150px] h-[52px] sm:w-[200px] sm:h-[70px] cursor-pointer hover:scale-105 transition-transform duration-300"
              />
            </Link>
          </div>
        )}
      </div>

      {/* Two Cards Section */}
      <div className="hero-cards-section">
        {/* Unite India Card - Left */}
        <Link href="/#about-us" className="hero-card hero-card-about group">
          {/* Unite India Background Image */}
          <div
            className="absolute inset-0 bg-contain bg-center bg-no-repeat transition-transform duration-500 group-hover:scale-105"
            style={{
              backgroundImage: `url('https://cdn.builder.io/api/v1/image/assets%2Fa70a28525f6f491aaa751610252a199c%2F7e04d4cf965b47f9b58322797a9f4ba2?format=webp&width=800')`,
              filter: 'brightness(0.95) contrast(1.05)'
            }}
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          {/* Text Content */}
          <div className="absolute bottom-4 left-4 right-4">
            <p className="hero-card-label">About</p>
            <p className="hero-card-title">Our Mission</p>
          </div>
        </Link>

        {/* Malayalees Friends Card - Right (with Donate) */}
        <div className="hero-card hero-card-donate group">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#2d1b4e] via-[#3d2b5e] to-[#1a0a2e]" />
          {/* Decorative Pattern */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `radial-gradient(circle at 20% 80%, rgba(255,255,255,0.3) 0%, transparent 50%),
                              radial-gradient(circle at 80% 20%, rgba(245,158,11,0.3) 0%, transparent 50%)`
          }} />
          {/* Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
            {/* Malayalees Friends Logo */}
            <Image
              src="https://cdn.builder.io/api/v1/image/assets%2Fa70a28525f6f491aaa751610252a199c%2Fd7543f582d4f477599d341da96d48e2b?format=webp&width=800"
              alt="Malayalees Friends"
              width={60}
              height={60}
              className="mb-2"
            />
            <p className="hero-card-donate-title">Support Us</p>
            {/* Givebutter Donate Button - Opens Popup Modal */}
            <GivebutterDonateButton
              campaignId="mhoZp0"
              className="mt-2 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-full text-white text-sm font-semibold shadow-lg hover:shadow-amber-500/30 transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <Heart size={14} className="fill-white" />
              <span>Donate Now</span>
            </GivebutterDonateButton>
          </div>
        </div>
      </div>

      {/* Browse All Events Link */}
      <div className="max-w-1400px mx-auto">
        <Link href="/events" className="hero-browse-link">
          <span>Browse all upcoming events</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
};

export default HeroSection;
