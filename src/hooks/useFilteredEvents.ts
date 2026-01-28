import { useMemo } from 'react';
import type { EventDetailsDTO, EventMediaDTO } from '@/types';
import { useEventsData } from './useEventsData';

export interface EventWithFilteredMedia {
  event: EventDetailsDTO;
  media: EventMediaDTO;
}

export const useFilteredEvents = (filterType: 'hero' | 'live' | 'featured') => {
  const { eventsWithMedia, isLoading, error } = useEventsData();

  const filteredEvents = useMemo(() => {
    if (isLoading || error) {
      return [];
    }

    console.log(`=== ${filterType.toUpperCase()} EVENTS FILTERING ===`);
    console.log(`Processing ${eventsWithMedia.length} events with media`);

    // Use the same today date as the filtering logic to ensure consistency
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for consistency
    console.log(`${filterType} Events - Today's date: ${today.toDateString()} (${today.toISOString()})`);

    const results: EventWithFilteredMedia[] = [];

    for (const { event, media } of eventsWithMedia) {
      console.log(`Processing ${filterType} event ${event.id}: ${event.title} with ${media.length} media items`);
      const filteredMedia = media.filter(mediaItem => {
        // Check the appropriate flag based on filter type
        let hasCorrectFlag = false;
        switch (filterType) {
          case 'hero':
            hasCorrectFlag = mediaItem.isHomePageHeroImage === true;
            break;
          case 'live':
            hasCorrectFlag = mediaItem.isLiveEventImage === true;
            break;
          case 'featured':
            hasCorrectFlag = mediaItem.isFeaturedEventImage === true;
            break;
        }

        console.log(`  Media ${mediaItem.id}: isHomePageHeroImage=${mediaItem.isHomePageHeroImage}, isLiveEventImage=${mediaItem.isLiveEventImage}, isFeaturedEventImage=${mediaItem.isFeaturedEventImage}, hasCorrectFlag=${hasCorrectFlag}`);

        if (!hasCorrectFlag) return false;

        // Check if startDisplayingFromDate is valid and not in the future
        const displayDateValue = mediaItem.startDisplayingFromDate;
        if (!displayDateValue) {
          console.log(`${filterType} Event ${event.id}: Media ${mediaItem.id} has no display date, allowing it`);
          return true; // If no date specified, allow it
        }

        try {
          // Parse date as local date to avoid timezone issues
          const [year, month, day] = displayDateValue.split('-').map(Number);
          const displayDate = new Date(year, month - 1, day); // month is 0-indexed
          displayDate.setHours(0, 0, 0, 0); // Reset time to start of day
          const shouldShow = displayDate <= today;

          console.log(`${filterType} Event ${event.id}: Media ${mediaItem.id} - Display date: ${displayDateValue}, Parsed: ${displayDate.toISOString()}, Today: ${today.toISOString()}, Should show: ${shouldShow}`);
          console.log(`${filterType} Event ${event.id}: Media ${mediaItem.id} - Date comparison: ${displayDate.getTime()} <= ${today.getTime()} = ${displayDate.getTime() <= today.getTime()}`);
          console.log(`${filterType} Event ${event.id}: Media ${mediaItem.id} - Date analysis: ${displayDateValue} (${displayDate.toDateString()}) vs Today (${today.toDateString()}) - ${displayDate <= today ? 'SHOW (past/today)' : 'HIDE (future)'}`);

          return shouldShow; // Only show if display date is today or in the past
        } catch (error) {
          console.warn(`Invalid startDisplayingFromDate for media ${mediaItem.id}:`, displayDateValue);
          return true; // If date is invalid, allow it to be shown
        }
      });

      if (filteredMedia.length > 0) {
        results.push({
          event,
          media: filteredMedia[0] // Take the first matching media
        });
        console.log(`Found ${filterType} event: ${event.title} with media: ${filteredMedia[0].fileUrl}`);
      }
    }

    console.log(`Found ${results.length} ${filterType} events`);
    return results;
  }, [eventsWithMedia, isLoading, error, filterType]);

  return {
    filteredEvents,
    isLoading,
    error,
  };
};
