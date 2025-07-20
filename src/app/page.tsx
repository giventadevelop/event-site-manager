'use server';
import Link from "next/link";
import { UserRoleDisplay } from "@/components/UserRoleDisplay";
// import { ProfileBootstrapper } from "@/components/ProfileBootstrapper"; // Remove client bootstrapper
import { EventCard } from "@/components/EventCard";
import Image from "next/image";
import type { EventDetailsDTO } from '@/types';
import { TeamImage } from '@/components/TeamImage';
import { getTenantId } from '@/lib/env';
import { formatDateLocal } from '@/lib/date';
import { auth, currentUser } from '@clerk/nextjs/server';
import { bootstrapUserProfile } from '@/components/ProfileBootstrapperApiServerActions';

// Add EventWithMedia type for local use
interface EventWithMedia extends EventDetailsDTO {
  thumbnailUrl?: string;
  placeholderText?: string;
}

// Move all event fetching to the server component
async function fetchEventsWithMedia(): Promise<EventWithMedia[]> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  let eventsResponse = await fetch(
    `${baseUrl}/api/proxy/event-details?sort=startDate,asc`,
    { cache: 'no-store' }
  );
  let eventsData: EventDetailsDTO[] = [];
  if (eventsResponse.ok) {
    try {
      eventsData = await eventsResponse.json();
    } catch (err) {
      console.error('Failed to parse events JSON:', err);
      eventsData = [];
    }
  }
  if (!eventsData || eventsData.length === 0) {
    eventsResponse = await fetch(
      `${baseUrl}/api/proxy/event-details?sort=startDate,desc`,
      { cache: 'no-store' }
    );
    if (eventsResponse.ok) {
      try {
        eventsData = await eventsResponse.json();
      } catch (err) {
        console.error('Failed to parse events JSON (fallback):', err);
        eventsData = [];
      }
    }
  }

  // Use Promise.allSettled instead of Promise.all to handle individual failures gracefully
  const eventsWithMediaResults = await Promise.allSettled(
    eventsData.map(async (event: EventDetailsDTO) => {
      try {
        console.log(`Fetching media for event ID: ${event.id}, title: ${event.title}`);

        // Add timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        try {
          const flyerRes = await fetch(
            `${baseUrl}/api/proxy/event-medias?eventId.equals=${event.id}&eventFlyer.equals=true`,
            {
              cache: 'no-store',
              signal: controller.signal
            }
          );
          clearTimeout(timeoutId);

          let mediaArray: any[] = [];

          if (flyerRes.ok) {
            try {
              const flyerData = await flyerRes.json();
              mediaArray = Array.isArray(flyerData) ? flyerData : (flyerData ? [flyerData] : []);
              console.log(`Event ${event.id}: Found ${mediaArray.length} flyer media items`);
            } catch (jsonErr) {
              console.error(`Event ${event.id}: Failed to parse flyer JSON:`, jsonErr);
              mediaArray = [];
            }
          } else {
            console.log(`Event ${event.id}: Flyer fetch failed with status ${flyerRes.status}`);
          }

          if (!mediaArray.length) {
            const featuredController = new AbortController();
            const featuredTimeoutId = setTimeout(() => featuredController.abort(), 10000);

            try {
              const featuredRes = await fetch(
                `${baseUrl}/api/proxy/event-medias?eventId.equals=${event.id}&isFeaturedImage.equals=true`,
                {
                  cache: 'no-store',
                  signal: featuredController.signal
                }
              );
              clearTimeout(featuredTimeoutId);

              if (featuredRes.ok) {
                try {
                  const featuredData = await featuredRes.json();
                  mediaArray = Array.isArray(featuredData) ? featuredData : (featuredData ? [featuredData] : []);
                  console.log(`Event ${event.id}: Found ${mediaArray.length} featured media items`);
                } catch (jsonErr) {
                  console.error(`Event ${event.id}: Failed to parse featured JSON:`, jsonErr);
                  mediaArray = [];
                }
              } else {
                console.log(`Event ${event.id}: Featured image fetch failed with status ${featuredRes.status}`);
              }
            } catch (featuredErr) {
              clearTimeout(featuredTimeoutId);
              console.error(`Event ${event.id}: Featured image fetch error:`, featuredErr);
            }
          }

          if (mediaArray.length > 0) {
            const fileUrl = mediaArray[0].fileUrl;
            console.log(`Event ${event.id}: Using media URL: ${fileUrl}`);

            // Always use fileUrl for displaying images
            if (fileUrl && fileUrl.startsWith('http')) {
              console.log(`Event ${event.id}: Using fileUrl for image display`);
              return { ...event, thumbnailUrl: fileUrl };
            } else {
              console.warn(`Event ${event.id}: Invalid fileUrl: ${fileUrl}`);
              return { ...event, thumbnailUrl: undefined, placeholderText: `No poster available for "${event.title}" yet` };
            }
          }

          console.log(`Event ${event.id}: No media found, using placeholder`);
          return { ...event, thumbnailUrl: undefined, placeholderText: `No poster available for "${event.title}" yet` };
        } catch (fetchErr) {
          clearTimeout(timeoutId);
          throw fetchErr;
        }
      } catch (err) {
        console.error(`Error fetching media for event ${event.id} (${event.title}):`, err);
        return { ...event, thumbnailUrl: undefined, placeholderText: `No poster available for "${event.title}" yet` };
      }
    })
  );

  // Process results and handle any rejected promises
  const eventsWithMedia: EventWithMedia[] = [];

  eventsWithMediaResults.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      eventsWithMedia.push(result.value);
    } else {
      // If a promise was rejected, create a fallback event with placeholder
      const originalEvent = eventsData[index];
      console.error(`Event ${originalEvent.id} (${originalEvent.title}) failed to process:`, result.reason);
      eventsWithMedia.push({
        ...originalEvent,
        thumbnailUrl: undefined,
        placeholderText: `No poster available for "${originalEvent.title}" yet`
      });
    }
  });

  console.log(`Successfully processed ${eventsWithMedia.length} events out of ${eventsData.length} total events`);
  return eventsWithMedia;
}

async function fetchHeroImageForEvent(eventId: number): Promise<string | null> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  try {
    const mediaRes = await fetch(`${baseUrl}/api/proxy/event-medias?eventId.equals=${eventId}&isHeroImage.equals=true&isActiveHeroImage.equals=true`);
    if (mediaRes.ok) {
      const mediaData = await mediaRes.json();
      const mediaArray = Array.isArray(mediaData) ? mediaData : (mediaData ? [mediaData] : []);
      if (mediaArray.length > 0 && mediaArray[0].fileUrl) {
        return mediaArray[0].fileUrl;
      }
    }
  } catch {
    return null;
  }
  return null;
}

export default async function Page() {
  /*
  const session = await auth();
  const userId = session?.userId;
  let user = null;
  if (userId) {
    user = await currentUser();
    if (user) {
      try {
        await bootstrapUserProfile({ userId, user });
      } catch (err) {
        console.error('SSR profile bootstrap failed:', err);
      }
    }
  }
  */

  let events: EventWithMedia[] = [];
  let fetchError = false;

  try {
    console.log('Starting to fetch events with media...');
    events = await fetchEventsWithMedia();
    console.log(`Successfully fetched ${events.length} events`);
  } catch (err) {
    console.error('Failed to fetch events with media:', err);
    fetchError = true;
    // Provide fallback events to prevent complete page failure
    events = [];
  }

  // Determine hero image based on upcoming events
  const today = new Date();
  const threeMonthsFromNow = new Date();
  threeMonthsFromNow.setMonth(today.getMonth() + 3);

  let heroImageUrl = "/images/side_images/chilanka_2025.webp"; // default image
  // Add cache-busting query string to default image so it is never cached
  const defaultHeroImageUrl = `/images/side_images/chilanka_2025.webp?v=${Date.now()}`;

  let nextEvent: EventWithMedia | null = null;
  let mediaFetchError = false;

  if (!fetchError && events && events.length > 0) {
    // Find the next event with startDate >= today
    const upcomingEvents = events
      .filter(event => event.startDate && new Date(event.startDate) >= today)
      .sort((a, b) => {
        const aDate = a.startDate ? new Date(a.startDate).getTime() : Infinity;
        const bDate = b.startDate ? new Date(b.startDate).getTime() : Infinity;
        return aDate - bDate;
      });

    console.log(`Found ${upcomingEvents.length} upcoming events`);

    if (upcomingEvents.length > 0) {
      const event = upcomingEvents[0];
      const eventDate = event.startDate ? new Date(event.startDate) : null;
      if (eventDate && eventDate <= threeMonthsFromNow && event.thumbnailUrl) {
        heroImageUrl = event.thumbnailUrl;
        nextEvent = event;
        console.log(`Using hero image from event: ${event.title} (ID: ${event.id})`);
      }
    }
  }

  // Fallback: If heroImageUrl is still default, try to fetch a hero image from event media
  if (!heroImageUrl || heroImageUrl === "/images/side_images/chilanka_2025.webp") {
    // Find an event in the next 3 months
    const candidateEvent = events.find(event => {
      const eventDate = event.startDate ? new Date(event.startDate) : null;
      return eventDate && eventDate >= today && eventDate <= threeMonthsFromNow;
    });
    if (candidateEvent) {
      try {
        console.log(`Trying to fetch hero image for event: ${candidateEvent.title} (ID: ${candidateEvent.id})`);
        const heroUrl = await fetchHeroImageForEvent(candidateEvent.id!);
        if (heroUrl) {
          heroImageUrl = heroUrl;
          console.log(`Successfully fetched hero image: ${heroUrl}`);
        }
      } catch (err) {
        console.error('Failed to fetch hero image:', err);
        mediaFetchError = true;
      }
    }
    // If still default, use cache-busting version
    if (!heroImageUrl || heroImageUrl === "/images/side_images/chilanka_2025.webp") {
      heroImageUrl = defaultHeroImageUrl;
      console.log('Using default hero image with cache busting');
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-blue-100 via-white to-blue-200">
      <main>
        {/* Hero Section */}
        <section
          className="hero-section relative w-full h-[350px] md:h-[350px] sm:h-[220px] h-[160px] bg-transparent pb-0"
          style={{ height: undefined }}
        >
          {/* Side Image as absolute vertical border with enhanced soft shadow, now extends further into navbar for stronger blending */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '250px',
              minWidth: '120px',
              height: '100%',
              zIndex: 1,
            }}
            className="w-[120px] md:w-[250px] min-w-[80px] h-full"
          >
            {/* Overlay logo at top left of side image */}
            <Image
              src="/images/side_images/malayalees_us_logo.avif"
              alt="Malayalees US Logo"
              width={80}
              height={80}
              style={{
                position: 'absolute',
                top: 8,
                left: 8,
                background: 'rgba(255,255,255,0.7)',
                borderRadius: '50%',
                boxShadow: '0 8px 64px 16px rgba(80,80,80,0.22)',
                zIndex: 2,
              }}
              className="md:w-[120px] md:h-[120px] w-[80px] h-[80px]"
              priority
            />
            <Image
              src="/images/side_images/pooram_side_image_two_images_blur_1.png"
              alt="Kerala Sea Coast"
              width={250}
              height={400}
              className="h-full object-cover rounded-l-lg shadow-2xl"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: '60% center',
                display: 'block',
                boxShadow: '0 0 96px 32px rgba(80,80,80,0.22)',
              }}
              priority
            />
          </div>

          {/* Hero Image fills the rest */}
          <div
            className="absolute hero-image-container"
            style={{
              left: 265,
              top: 8,
              right: 8,
              bottom: 8,
              zIndex: 2,
            }}
          >
            <div className="w-full h-full relative">
              {/* Blurred background image for width fill */}
              <Image
                src={heroImageUrl}
                alt="Hero blurred background"
                fill
                className="object-cover w-full h-full blur-lg scale-105"
                style={{
                  zIndex: 0,
                  filter: 'blur(24px) brightness(1.1)',
                  objectPosition: 'center',
                }}
                aria-hidden="true"
                priority
              />
              {/* Main hero image, fully visible */}
              <Image
                src={heroImageUrl}
                alt="Event or Default"
                fill
                className="object-cover w-full h-full"
                style={{
                  objectFit: 'cover',
                  objectPosition: 'center',
                  zIndex: 1,
                  background: 'linear-gradient(to bottom, #f8fafc 0%, #fff 100%)',
                }}
                priority
              />
              {/* Fade overlays for all four borders */}
              <div className="pointer-events-none absolute left-0 top-0 w-full h-8" style={{ background: 'linear-gradient(to bottom, rgba(248,250,252,1) 0%, rgba(248,250,252,0) 100%)', zIndex: 20 }} />
              <div className="pointer-events-none absolute left-0 bottom-0 w-full h-8" style={{ background: 'linear-gradient(to top, rgba(248,250,252,1) 0%, rgba(248,250,252,0) 100%)', zIndex: 20 }} />
              <div className="pointer-events-none absolute left-0 top-0 h-full w-8" style={{ background: 'linear-gradient(to right, rgba(248,250,252,1) 0%, rgba(248,250,252,0) 100%)', zIndex: 20 }} />
              <div className="pointer-events-none absolute right-0 top-0 h-full w-8" style={{ background: 'linear-gradient(to left, rgba(248,250,252,1) 0%, rgba(248,250,252,0) 100%)', zIndex: 20 }} />
            </div>
            {nextEvent && nextEvent.admissionType === 'ticketed' && (
              <Link
                href={`/events/${nextEvent.id}/tickets`}
                className="absolute bottom-6 right-6 z-10"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Image
                  src="/images/buy_tickets_click_here_red.webp"
                  alt="Buy Tickets"
                  width={160}
                  height={60}
                  style={{ opacity: 0.7, width: '160px', height: 'auto' }}
                  className="rounded shadow"
                  priority
                />
              </Link>
            )}
            {/* If not ticketed but registration required, show Register button as before */}
            {nextEvent && nextEvent.admissionType !== 'ticketed' && nextEvent.isRegistrationRequired && (
              <Link
                href={`/events/${nextEvent.id}/register`}
                className="absolute bottom-6 right-6 z-10 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-700 transition"
              >
                Register for this event
              </Link>
            )}
          </div>
        </section>

        {/* Feature Boxes Section */}
        <section className="feature-boxes flex flex-col md:flex-row w-full mt-12">
          <div className="feature-box flex-1 w-full min-h-[180px] mb-4 md:mb-0" style={{ backgroundImage: "url('/images/unite_india_logo.avif')", backgroundSize: '45%', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', backgroundColor: '#1a1a1a', padding: '40px' }}>
            {/* <div>
                      <h4>Story behind the foundation</h4>
                      <a href="#vision-section" className="link-text">Mission and Vision</a>
                    </div> */}
          </div>
          <div className="feature-box flex-1 w-full min-h-[180px]" style={
            nextEvent
              ? { background: '#fff', padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }
              : { backgroundImage: "url('/images/lady_dance.jpeg')", backgroundSize: '55%', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', padding: '40px' }
          }>
            {nextEvent ? (
              <div className="flex flex-col md:flex-row items-center gap-4">
                <Image src={nextEvent.thumbnailUrl || '/images/kalari_jump.jpeg'} alt={nextEvent.title || 'Event'} className="w-24 h-24 object-cover rounded shadow-md mb-2 md:mb-0" width={96} height={96} style={{ minWidth: 72, minHeight: 72 }} />
                <div className="flex-1">
                  <h4 className="text-xl font-bold mb-1 text-gray-900">{nextEvent.title}</h4>
                  <div className="text-sm text-gray-600 mb-1">
                    {formatDateLocal(nextEvent.startDate)}
                    {nextEvent.admissionType === 'ticketed' && nextEvent.startTime && (
                      <span className="ml-2">| Start: {nextEvent.startTime}</span>
                    )}
                  </div>
                  {nextEvent.description && (
                    <div className="text-gray-700 text-sm mb-2 line-clamp-3">{nextEvent.description}</div>
                  )}
                  {nextEvent.admissionType === 'ticketed' && (
                    <a
                      href={`/events/${nextEvent.id}/tickets`}
                      className="button bg-yellow-400 text-gray-900 px-4 py-2 rounded font-semibold text-sm shadow hover:bg-yellow-300 transition mt-2 inline-block"
                    >
                      Buy Tickets
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <h4>cultural events, educational programs, and community gatherings</h4>
                <a href="/events" className="link-text">Upcoming events</a>
              </div>
            )}
          </div>
        </section>

        {/* Events Section */}
        <section id="events" className="events-section py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="section-title-wrapper mb-10 text-center">
              <h3 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">Upcoming Events</h3>
              <div className="section-subtitle text-lg text-yellow-500 font-semibold mb-2">Join Our Celebrations</div>
            </div>
            {mediaFetchError && (
              <div className="text-center text-red-600 font-bold py-8">
                Event media fetch failed.
              </div>
            )}
            {fetchError ? (
              <div className="text-center text-red-600 font-bold py-8">
                Sorry, we couldn't load events at this time. Please try again later.
              </div>
            ) : (() => {
              // Find upcoming and past events
              const today = new Date();
              const upcomingEvents = events.filter(event => event.startDate && new Date(event.startDate) >= today);
              if (upcomingEvents.length > 0) {
                return (
                  <div className="flex flex-wrap justify-center gap-8 max-w-6xl mx-auto">
                    {upcomingEvents.slice(0, 6).map((event) => (
                      <div
                        key={event.id}
                        className="flex justify-center"
                        style={{ width: 350, minWidth: 350, maxWidth: 350, height: 500, minHeight: 500, maxHeight: 500 }}
                      >
                        <EventCard event={event} placeholderText={event.placeholderText} />
                      </div>
                    ))}
                  </div>
                );
              }
              // If no upcoming, check for past events
              const pastEvents = events
                .filter(event => event.startDate && new Date(event.startDate) < today)
                .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
              if (pastEvents.length > 0) {
                return (
                  <>
                    <div className="text-center text-blue-700 font-bold text-2xl mb-6">Past Events</div>
                    <div className="flex flex-wrap justify-center gap-8 max-w-6xl mx-auto">
                      {pastEvents.slice(0, 6).map((event) => (
                        <div
                          key={event.id}
                          className="flex justify-center"
                          style={{ width: 350, minWidth: 350, maxWidth: 350, height: 500, minHeight: 500, maxHeight: 500 }}
                        >
                          <EventCard event={event} placeholderText={event.placeholderText} />
                        </div>
                      ))}
                    </div>
                  </>
                );
              }
              // No events at all
              return (
                <div className="text-center text-gray-500 py-8">
                  No events found.
                </div>
              );
            })()}
            <div className="text-center mt-8">
              <Link href="/events" className="inline-block bg-yellow-400 text-gray-900 px-8 py-3 rounded-lg font-semibold text-lg shadow hover:bg-yellow-300 transition">
                View All Events
              </Link>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="about-us-section py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="section-title-wrapper mb-10">
              <h3 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">About Us</h3>
              <div className="section-subtitle text-lg text-yellow-500 font-semibold mb-2">Who We Are</div>
            </div>
            <div className="about-us-content bg-white rounded-lg shadow p-8 md:p-12 flex flex-col md:flex-row gap-8 items-center">
              <img src="/images/about_us_malyalee_us.jpg" alt="About Us" className="rounded-lg w-full md:w-1/2 max-w-md shadow-lg" />
              <div className="about-us-text text-lg text-gray-700 md:w-1/2">
                <p>
                  Formed  with the purpose of bringing together Indians of Kerala origin living in New Jersey/US to maintain the rich heritage and to provide their children an opportunity to get a glimpse of our culture.



                  Malayalees.us, is one of the largest  Indian Associations in America.  It continues to grow , while spreading the culture of the beautiful state of Kerala through popular events and activities.

                  The community stands for the integrity and unity of malayalees in the USA. It seeks to promote the culture of Kerala, the southernmost state of India. It preserves Kerala traditions in American soil for future generations to discover, share, and follow.
                </p>
                <ul className="list-disc pl-6 mt-4 text-base text-gray-600">
                  <li>Organizing cultural festivals and events</li>
                  <li>Supporting students and professionals</li>
                  <li>Promoting Malayalam language and arts</li>
                  <li>Community outreach and social support</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* What We Do Section */}
        <section className="what-we-do py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="section-title-wrapper mb-10">
              <span className="section-subtitle text-yellow-500 font-semibold mb-2 block">What we do</span>
              <h3 className="text-3xl md:text-4xl font-bold mb-6 ml-0 md:ml-12">Cultural Workshops and Educational Events</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Traditional Dance & Music */}
              <div className="service-item flex gap-6 items-start">
                <div className="service-icon w-16 h-16 flex items-center justify-center bg-yellow-100 rounded-full">
                  {/* Music Icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-8 h-8 text-green-500"><path fill="currentColor" d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6zm-2 16c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" /></svg>
                </div>
                <div className="service-content">
                  <h4 className="text-xl font-semibold mb-2">Traditional Dance & Music</h4>
                  <p>Experience the rich heritage of Kerala through dance and music workshops.</p>
                </div>
              </div>
              {/* Art & Craft */}
              <div className="service-item flex gap-6 items-start">
                <div className="service-icon w-16 h-16 flex items-center justify-center bg-yellow-100 rounded-full">
                  {/* Art Icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-8 h-8 text-orange-500"><path fill="currentColor" d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" /></svg>
                </div>
                <div className="service-content">
                  <h4 className="text-xl font-semibold mb-2">Art & Craft Workshops</h4>
                  <p>Learn traditional Kerala art forms and crafts through hands-on workshops.</p>
                </div>
              </div>
              {/* Kerala Folklore and Tribal Traditions */}
              <div className="service-item flex gap-6 items-start">
                <div className="service-icon w-16 h-16 flex items-center justify-center bg-yellow-100 rounded-full">
                  {/* Book Icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-8 h-8 text-blue-500"><path fill="currentColor" d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" /></svg>
                </div>
                <div className="service-content">
                  <h4 className="text-xl font-semibold mb-2">Kerala Folklore and Tribal Traditions</h4>
                  <p>Introduce lesser-known folk dances like Theyyam, Padayani, and Poothan Thira.</p>
                </div>
              </div>
              {/* Kerala Cuisine */}
              <div className="service-item flex gap-6 items-start">
                <div className="service-icon w-16 h-16 flex items-center justify-center bg-yellow-100 rounded-full">
                  {/* Cuisine Icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-8 h-8 text-yellow-500"><path fill="currentColor" d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z" /></svg>
                </div>
                <div className="service-content">
                  <h4 className="text-xl font-semibold mb-2">Kerala Cuisine Classes</h4>
                  <p>Master the art of traditional Kerala cooking with expert chefs.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Ticker/Banner Section */}
        <section className="ticker-section bg-yellow-400 text-white py-2 overflow-hidden">
          <div className="ticker flex animate-marquee whitespace-nowrap">
            <div className="ticker-item px-8">Culture is the thread to thrive and ties generations to their roots !</div>
            <div className="ticker-item px-8">Culture is the thread to thrive and ties generations to their roots !</div>
            <div className="ticker-item px-8">Culture is the thread to thrive and ties generations to their roots !</div>
          </div>
        </section>

        {/* Team Section */}
        <section className="team-section py-20 bg-white" id="team-section">
          <div className="container mx-auto px-4">
            <div className="section-title-wrapper mb-10 text-center">
              <span className="section-subtitle text-yellow-500 font-semibold mb-2 block">Team</span>
              <h3 className="text-3xl md:text-4xl font-bold mb-6">Meet our best volunteers team</h3>
            </div>
            <div className="flex justify-center">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 max-w-4xl">
                {/* Team members - use images from public/images/team_members/ */}
                <div className="team-item flex flex-col items-center">
                  <TeamImage src="/images/team_members/Manoj_Kizhakkoot.png" name="Manoj Kizhakkoot" />
                </div>
                <div className="team-item flex flex-col items-center">
                  <TeamImage src="/images/team_members/srk.png" name="SRK" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="contact-section py-20 bg-gray-50" id="contact">
          <div className="container mx-auto px-4">
            <div className="section-title-wrapper mb-10">
              <span className="section-subtitle text-yellow-500 font-semibold mb-2 block">Contact</span>
              <h3 className="text-3xl md:text-4xl font-bold mb-6">Get in touch</h3>
            </div>
            <p className="contact-description text-center max-w-2xl mx-auto mb-10 text-gray-600">Connect with us to learn more about our community initiatives and how you can get involved in preserving and promoting Malayali culture across the United States. Join us in fostering cultural exchange and building stronger connections within our diverse communities.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
              <div className="contact-item">
                <h6 className="text-lg font-semibold mb-2">Location</h6>
                <p>Unite India
                  <br />New Jersey, USA</p>
              </div>
              <div className="contact-item">
                <h6 className="text-lg font-semibold mb-2">Phone</h6>
                <p><a href="tel:+16317088442" className="text-blue-600 hover:underline">+1 (631) 708-8442</a></p>
              </div>
              <div className="contact-item">
                <h6 className="text-lg font-semibold mb-2">Social</h6>
                <div className="flex gap-3">
                  <a href="https://www.facebook.com/profile.php?id=61573944338286" className="social-icon bg-gray-800 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-yellow-400" target="_blank" rel="noopener noreferrer">
                    <i className="fab fa-facebook-f"></i>
                  </a>
                </div>
              </div>
              <div className="contact-item">
                <h6 className="text-lg font-semibold mb-2">Email</h6>
                <p><a href="mailto:Contactus@malyalees.org" className="text-blue-600 hover:underline">Contactus@malyalees.org</a></p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div >
  );
}
