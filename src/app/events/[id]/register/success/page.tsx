"use client";

import { useEffect, useState, use } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { EventDetailsDTO, EventMediaDTO, EventAttendeeDTO, EventAttendeeGuestDTO } from "@/types";
import { formatInTimeZone } from 'date-fns-tz';
import LocationDisplay from '@/components/LocationDisplay';
import { FaCheckCircle, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUser, FaUsers, FaEnvelope, FaPhone } from 'react-icons/fa';

export default function RegistrationSuccessPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params);
  const eventId = Number(id);
  const searchParams = useSearchParams();
  const attendeeId = searchParams.get('attendeeId');

  const [event, setEvent] = useState<EventDetailsDTO | null>(null);
  const [media, setMedia] = useState<EventMediaDTO[]>([]);
  const [attendee, setAttendee] = useState<EventAttendeeDTO | null>(null);
  const [guests, setGuests] = useState<EventAttendeeGuestDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!eventId) return;
      setLoading(true);
      try {
        // Fetch event details
        const eventRes = await fetch(`/api/proxy/event-details/${eventId}`);
        const eventData: EventDetailsDTO = await eventRes.json();
        setEvent(eventData);

        // Fetch media
        const mediaRes = await fetch(`/api/proxy/event-medias?eventId.equals=${eventId}&isEventManagementOfficialDocument.equals=false&sort=updatedAt,desc`);
        const mediaData = await mediaRes.json();
        setMedia(Array.isArray(mediaData) ? mediaData : [mediaData]);

        // Fetch attendee details if attendeeId is provided
        if (attendeeId) {
          try {
            const attendeeRes = await fetch(`/api/proxy/event-attendees/${attendeeId}`);
            if (attendeeRes.ok) {
              const attendeeData: EventAttendeeDTO = await attendeeRes.json();
              setAttendee(attendeeData);

              // Fetch guests for this attendee
              const guestsRes = await fetch(`/api/proxy/event-attendee-guests?eventAttendeeId.equals=${attendeeId}`);
              if (guestsRes.ok) {
                const guestsData = await guestsRes.json();
                setGuests(Array.isArray(guestsData) ? guestsData : []);
              }
            }
          } catch (err) {
            console.error('Error fetching attendee details:', err);
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [eventId, attendeeId]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading registration details...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800">Event not found. Please check the event ID.</p>
          <Link href="/events" className="text-blue-600 hover:underline mt-4 inline-block">
            View All Events
          </Link>
        </div>
      </div>
    );
  }

  // Find flyer/hero image
  const flyer = media.find((m) => m.eventFlyer && m.fileUrl) || media.find((m) => m.fileUrl);

  // Format date
  const formatDate = (dateStr: string, timezone: string) => {
    if (!dateStr) return '';
    try {
      return formatInTimeZone(new Date(dateStr), timezone || 'America/New_York', 'EEEE, MMMM d, yyyy');
    } catch {
      return dateStr;
    }
  };

  // Format time
  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    // Convert 24-hour to 12-hour format if needed
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Header Section */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 py-20 pb-[116px]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-500 ring-4 ring-white mb-6">
              <FaCheckCircle className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Registration Successful!
            </h1>
            <p className="text-xl text-gray-700 mb-2">
              Thank you for registering!
            </p>
            <p className="text-lg text-gray-600">
              You are registered for this event. See you at the event!
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-[116px] pb-16">
        {/* Registration Details Card */}
        {attendee && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FaUser className="text-primary" />
              Your Registration Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">First Name</label>
                <p className="text-lg text-gray-900">{attendee.firstName || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Last Name</label>
                <p className="text-lg text-gray-900">{attendee.lastName || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Email</label>
                <p className="text-lg text-gray-900 flex items-center gap-2">
                  <FaEnvelope className="text-gray-400" />
                  {attendee.email || 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Phone</label>
                <p className="text-lg text-gray-900 flex items-center gap-2">
                  <FaPhone className="text-gray-400" />
                  {attendee.phone || 'N/A'}
                </p>
              </div>
              {attendee.registrationStatus && (
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Registration Status</label>
                  <p className="text-lg">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      {attendee.registrationStatus}
                    </span>
                  </p>
                </div>
              )}
              {attendee.registrationDate && (
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Registration Date</label>
                  <p className="text-lg text-gray-900">
                    {formatInTimeZone(new Date(attendee.registrationDate), event.timezone || 'America/New_York', 'MMMM d, yyyy h:mm a')}
                  </p>
                </div>
              )}
            </div>

            {/* Guests Section */}
            {guests.length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FaUsers className="text-primary" />
                  Guests ({guests.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {guests.map((guest, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Name</label>
                          <p className="text-gray-900">
                            {guest.firstName} {guest.lastName}
                          </p>
                        </div>
                        {guest.ageGroup && (
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Age Group</label>
                            <p className="text-gray-900">{guest.ageGroup}</p>
                          </div>
                        )}
                        {guest.email && (
                          <div className="col-span-2">
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
                            <p className="text-gray-900">{guest.email}</p>
                          </div>
                        )}
                        {guest.phone && (
                          <div className="col-span-2">
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Phone</label>
                            <p className="text-gray-900">{guest.phone}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Event Details Card - Styled like event details page */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Event Image */}
          {flyer && flyer.fileUrl && (
            <div className="relative w-full h-64 sm:h-80 lg:h-96 overflow-hidden">
              <Image
                src={flyer.fileUrl}
                alt={event.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Event Content */}
          <div className="p-6 sm:p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">{event.title}</h2>

            {event.caption && (
              <p className="text-lg text-gray-700 mb-6">{event.caption}</p>
            )}

            {/* Event Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Date */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <FaCalendarAlt className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Date</label>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatDate(event.startDate, event.timezone || 'America/New_York')}
                  </p>
                </div>
              </div>

              {/* Time */}
              {event.startTime && event.endTime && (
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                    <FaClock className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Time</label>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatTime(event.startTime)} - {formatTime(event.endTime)}
                    </p>
                  </div>
                </div>
              )}

              {/* Location */}
              {event.location && (
                <div className="flex items-start gap-4 md:col-span-2">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                    <FaMapMarkerAlt className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Location</label>
                    <div className="text-lg font-semibold text-gray-900">
                      <LocationDisplay location={event.location} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            {event.description && (
              <div className="mb-8 pt-8 border-t border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">About This Event</h3>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{event.description}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <Link
                href={`/events/${eventId}`}
                className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-lg text-center transition-colors"
              >
                View Event Details
              </Link>
              <Link
                href="/events"
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg text-center transition-colors"
              >
                Browse More Events
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

