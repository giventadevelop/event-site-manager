"use client";

import React, { useState, useEffect } from 'react';
import type { EventDetailsDTO, EventTypeDetailsDTO, EventCalendarEntryDTO } from '@/types';
import { Modal } from './Modal';
import { formatDateLocal } from '@/lib/date';
import Link from 'next/link';
import ReactDOM from 'react-dom';
import Image from 'next/image';

interface EventListProps {
  events: EventDetailsDTO[];
  eventTypes: EventTypeDetailsDTO[];
  calendarEvents?: EventCalendarEntryDTO[];
  onEdit: (event: EventDetailsDTO) => void;
  onCancel: (event: EventDetailsDTO) => void;
  onHardDelete?: (event: EventDetailsDTO) => void;
  onActivate?: (event: EventDetailsDTO) => void;
  loading?: boolean;
  showDetailsOnHover?: boolean;
  onPrevPage?: () => void;
  onNextPage?: () => void;
  page?: number;
  totalCount?: number;
  pageSize?: number;
  boldEventIdLabel?: boolean;
}

export function EventList({
  events,
  eventTypes: eventTypesProp,
  calendarEvents: calendarEventsProp = [],
  onEdit,
  onCancel,
  onHardDelete,
  onActivate,
  loading,
  showDetailsOnHover = false,
  onPrevPage,
  onNextPage,
  page = 1,
  totalCount = 0,
  pageSize = 10,
  boldEventIdLabel = false
}: EventListProps) {
  const [hoveredEventId, setHoveredEventId] = useState<number | null>(null);
  const [calendarEvents, setCalendarEvents] = useState<EventCalendarEntryDTO[]>(calendarEventsProp);
  const [eventTypes, setEventTypes] = useState<EventTypeDetailsDTO[]>(eventTypesProp || []);
  const [showTicketTypeModal, setShowTicketTypeModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [tooltipEvent, setTooltipEvent] = useState<EventDetailsDTO | null>(null);
  const [tooltipAnchor, setTooltipAnchor] = useState<DOMRect | null>(null);
  const [isZoomingOut, setIsZoomingOut] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Use provided calendar events or fetch if not provided
    if (calendarEventsProp.length > 0) {
      setCalendarEvents(calendarEventsProp);
    } else {
      // Fallback: fetch calendar events if not provided (tenant-agnostic: no tenantId unless caller passes it)
      fetch(`/api/proxy/event-calendar-entries?size=1000`)
        .then(res => res.ok ? res.json() : [])
        .then(data => setCalendarEvents(Array.isArray(data) ? data : []));
    }
  }, [calendarEventsProp]);

  useEffect(() => {
    // Use provided event types or fetch if not provided
    if (eventTypesProp && eventTypesProp.length > 0) {
      setEventTypes(eventTypesProp);
    } else {
      // Fallback: fetch event types if not provided (tenant-agnostic: no tenantId unless caller passes it)
      fetch(`/api/proxy/event-type-details`)
        .then(res => res.ok ? res.json() : [])
        .then(data => setEventTypes(Array.isArray(data) ? data : []));
    }
  }, [eventTypesProp]);

  // Handle zoom-out effect when loading changes from true to false
  useEffect(() => {
    if (!loading && events.length > 0) {
      // Start zoom-out effect
      setIsZoomingOut(true);

      // After zoom-out animation completes, show content
      const timer = setTimeout(() => {
        setShowContent(true);
        setIsZoomingOut(false);
      }, 500); // Match the zoom-out animation duration

      return () => clearTimeout(timer);
    } else if (loading) {
      // Reset states when loading starts
      setShowContent(false);
      setIsZoomingOut(false);
    }
  }, [loading, events.length]);

  function getEventTypeName(event: EventDetailsDTO) {
    if (event?.eventType?.name) return event.eventType.name;
    if (event?.eventType?.id != null) {
      const found = eventTypes.find(et => et.id === event.eventType?.id);
      if (found) return found.name;
    }
    return '';
  }

  function getCalendarEventForEvent(eventId?: number) {
    if (!eventId) return undefined;
    return calendarEvents.find(ce => ce.event && ce.event.id === eventId);
  }

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
    return `${year}${month}${day}T${String(h).padStart(2, '0')}${minute}00`;
  }

  function EventDetailsTooltip({ event, anchorRect, onClose }: { event: EventDetailsDTO, anchorRect: DOMRect | null, onClose: () => void }) {
    if (!anchorRect) return null;
    if (typeof window === 'undefined' || !document.body) return null;
    const tooltipWidth = 420;
    const spacing = 12;
    let top = anchorRect.top;
    let left = anchorRect.right + spacing;
    const estimatedHeight = 300;
    if (top + estimatedHeight > window.innerHeight) {
      top = window.innerHeight - estimatedHeight - spacing;
    }
    if (top < spacing) {
      top = spacing;
    }
    if (left + tooltipWidth > window.innerWidth) {
      left = window.innerWidth - tooltipWidth - spacing;
    }
    const style: React.CSSProperties = {
      position: 'fixed',
      top,
      left,
      zIndex: 9999,
      background: 'white',
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: '#cbd5e1',
      borderRadius: 12,
      boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
      padding: 16,
      width: tooltipWidth,
      fontSize: 14,
      maxHeight: 400,
      overflowY: 'auto',
      transition: 'opacity 0.1s ease-in-out',
    };
    return ReactDOM.createPortal(
      <div style={style} tabIndex={-1} className="admin-tooltip">
        <div className="sticky top-0 right-0 z-10 bg-white flex justify-end">
          <button
            onClick={onClose}
            className="w-10 h-10 text-2xl bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all"
            aria-label="Close tooltip"
          >
            &times;
          </button>
        </div>
        <table className="w-full text-sm border border-gray-300">
          <tbody>
            {Object.entries(event).map(([key, value]) => {
              let displayValue: string | number = '';
              if ((key === 'createdBy' || key === 'eventType') && value && typeof value === 'object' && 'id' in value) {
                displayValue = value.id;
              } else if (typeof value === 'object' && value !== null) {
                displayValue = JSON.stringify(value);
              } else {
                displayValue = String(value);
              }
              return (
                <tr key={key} className="border-b border-gray-200">
                  <td className="font-bold pr-4 border-r border-gray-200 align-top">{key}:</td>
                  <td className="align-top break-all">{displayValue}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>,
      document.body
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[600px] w-full">
        <div className="relative w-full max-w-6xl">
          <Image
            src="/images/loading_events.jpg"
            alt="Loading events..."
            width={800}
            height={600}
            className="w-full h-auto rounded-lg shadow-2xl animate-pulse zoom-loading"
            priority
          />
          <div className="absolute inset-0 rounded-lg overflow-hidden">
            <div className="wavy-animation"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isZoomingOut) {
    return (
      <div className="flex justify-center items-center min-h-[600px] w-full">
        <div className="relative w-full max-w-6xl">
          <Image
            src="/images/loading_events.jpg"
            alt="Loading events..."
            width={800}
            height={600}
            className="w-full h-auto rounded-lg shadow-2xl zoom-out"
            priority
          />
          <div className="absolute inset-0 rounded-lg overflow-hidden">
            <div className="wavy-animation"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!showContent) {
    return null; // Don't show anything during transition
  }

  // EventList uses 1-based page indexing by default, but manage-events uses 0-based
  // Convert to 0-based for calculations if page is 0 (indicating 0-based indexing)
  const isZeroBased = page === 0;
  const currentPageZeroBased = isZeroBased ? page : page - 1;
  const displayPage = isZeroBased ? page + 1 : page; // Display as 1-based

  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const isPrevDisabled = currentPageZeroBased === 0 || loading;
  const isNextDisabled = currentPageZeroBased >= totalPages - 1 || loading;

  const startItem = totalCount > 0 ? currentPageZeroBased * pageSize + 1 : 0;
  const endItem = totalCount > 0 ? currentPageZeroBased * pageSize + Math.min(pageSize, totalCount - currentPageZeroBased * pageSize) : 0;

  const handleTooltipClose = () => setTooltipEvent(null);

  return (
    <>
      {events.length > 0 && (
        <div className="mb-2 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded px-4 py-2">
          Mouse over the first 3 columns to see the full details about the event. Use the × button to close the tooltip once you have viewed the details.
        </div>
      )}
      {events.length > 0 ? (
        <table
        className="w-full border text-sm relative bg-white rounded shadow-md"
      >
        <thead>
          <tr className="bg-blue-100 font-bold border-b-2 border-blue-300">
            <th className="p-2 border" rowSpan={2}>Event Info</th>
            <th className="p-2 border" rowSpan={2}>Type</th>
            <th className="p-2 border" rowSpan={2}>Dates</th>
            <th className="p-2 border" rowSpan={2}>Active</th>
            <th className="p-2 border" rowSpan={2}>Edit/View</th>
            <th className="p-2 border" colSpan={2}>Delete Actions</th>
            <th className="p-2 border" rowSpan={2}>Media</th>
            <th className="p-2 border" rowSpan={2}>Upload</th>
            <th className="p-2 border" rowSpan={2}>Calendar</th>
            <th className="p-2 border" rowSpan={2}>Tickets</th>
          </tr>
          <tr className="bg-blue-50 font-bold border-b border-blue-200">
            <th className="p-2 border text-xs font-bold text-center">Deactivate</th>
            <th className="p-2 border text-xs font-bold text-center">Hard Delete</th>
          </tr>
        </thead>
        <tbody>
          {events.map(event => {
            const isActive = !!event.isActive;
            const rowBg = isActive ? 'bg-green-50 hover:bg-green-100' : 'bg-red-50 hover:bg-red-100';
            const calendarEvent = getCalendarEventForEvent(event.id);
            return (
              <tr
                key={event.id}
                className={`${rowBg} transition-colors duration-150 border-b border-gray-300`}
                style={{ position: 'relative' }}
              >
                <td
                  className="p-2 border font-medium align-middle"
                  onMouseEnter={e => {
                    if (showDetailsOnHover) {
                      setTooltipEvent(event);
                      setTooltipAnchor((e.currentTarget as HTMLElement).getBoundingClientRect());
                    }
                  }}
                >
                  <div className="text-xs text-gray-500" style={boldEventIdLabel ? { fontWeight: 700 } : {}}>
                    {boldEventIdLabel ? <b>Event ID:</b> : 'Event ID:'} {event.id}
                  </div>
                  {/* Parent/Child Event Indicator */}
                  {event.parentEventId == null ? (
                    <div className="mt-1 mb-1">
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-purple-100 text-purple-800 text-xs font-bold rounded border border-purple-300">
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Parent Event
                      </span>
                    </div>
                  ) : (
                    <div className="mt-1 mb-1">
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded border border-blue-300">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        Child Event
                      </span>
                      <div className="text-xs text-gray-600 mt-1">
                        Parent ID: {event.parentEventId}
                      </div>
                    </div>
                  )}
                  <div><span className="font-bold">Title:</span> {event.title}</div>
                  <div className="mt-2">
                    <Link
                      href={`/admin/events/new?copyFrom=${event.id}`}
                      className="inline-flex items-center gap-2"
                      title="Copy this event to create a new one"
                      aria-label="Copy this event to create a new one"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-all duration-300 hover:scale-110">
                        <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span className="text-xs font-semibold text-blue-700">Copy event</span>
                    </Link>
                  </div>
                </td>
                <td
                  className="p-2 border align-middle"
                  onMouseEnter={e => {
                    if (showDetailsOnHover) {
                      setTooltipEvent(event);
                      setTooltipAnchor((e.currentTarget as HTMLElement).getBoundingClientRect());
                    }
                  }}
                >
                  {getEventTypeName(event) || <span className="text-gray-400 italic">Unknown</span>}
                </td>
                <td
                  className="p-2 border align-middle w-32"
                  onMouseEnter={e => {
                    if (showDetailsOnHover) {
                      setTooltipEvent(event);
                      setTooltipAnchor((e.currentTarget as HTMLElement).getBoundingClientRect());
                    }
                  }}
                >
                  {(() => {
                    // Format date to show first 3 letters of month (e.g., "Nov 20, 2025")
                    // Parse date string directly to avoid timezone conversion issues
                    const formatShortDate = (dateStr: string) => {
                      if (!dateStr) return '';
                      // Parse YYYY-MM-DD format directly without timezone conversion
                      const [year, month, day] = dateStr.split('-').map(Number);
                      if (!year || !month || !day) return dateStr;
                      // Create date in local timezone to avoid UTC conversion
                      const date = new Date(year, month - 1, day);
                      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                      const monthName = months[date.getMonth()];
                      const dayNum = date.getDate();
                      const yearNum = date.getFullYear();
                      return `${monthName} ${dayNum}, ${yearNum}`;
                    };
                    return (
                      <>
                        <div className="text-xs">
                          <span className="font-semibold">{formatShortDate(event.startDate)}</span>
                          <div className="text-gray-600">{event.startTime}</div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">to</div>
                        <div className="text-xs">
                          <span className="font-semibold">{formatShortDate(event.endDate)}</span>
                          <div className="text-gray-600">{event.endTime}</div>
                        </div>
                      </>
                    );
                  })()}
                </td>
                <td className="p-2 border text-center align-middle">
                  <div className="flex flex-col gap-2 items-center">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${isActive ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                      {isActive ? 'Yes' : 'No'}
                    </span>
                    {!isActive && onActivate && (
                      <button
                        className="relative inline-flex items-center justify-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded border-2 border-green-800 shadow-lg transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        style={{
                          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.3)',
                          borderStyle: 'outset',
                        }}
                        onClick={() => onActivate(event)}
                        disabled={isActive}
                        title={isActive ? "Event is already active" : "Activate event"}
                      >
                        <div className="flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Activate</span>
                        </div>
                      </button>
                    )}
                  </div>
                </td>
                <td className="p-2 border text-center align-middle">
                  <a
                    href={`/admin/events/${event.id}/edit`}
                    className="flex flex-col items-center focus:outline-none inline-block w-full h-full"
                    onClick={(e) => {
                      // Allow default behavior (navigation) but also call onEdit for backward compatibility
                      onEdit(event);
                    }}
                    title="Edit/View Event Details"
                    aria-label="Edit/View Event Details"
                  >
                    <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-all duration-300 hover:scale-110">
                      <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <span className="text-[10px] text-gray-600 mt-1 block font-bold">Edit/View,<br />Event Details</span>
                  </a>
                </td>
                {/* Deactivate Button Cell */}
                <td className="p-2 border text-center align-middle">
                  <div className="flex flex-col items-center justify-center h-full">
                    <button
                      className="flex-shrink-0 w-14 h-14 rounded-xl bg-orange-100 hover:bg-orange-200 flex items-center justify-center transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      onClick={() => onCancel(event)}
                      disabled={!isActive}
                      title={isActive ? "Deactivate event (soft delete)" : "Event is already inactive"}
                      aria-label="Deactivate event"
                    >
                      <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    <span className="text-[9px] text-gray-700 mt-1 block font-bold">Deactivate</span>
                  </div>
                </td>
                {/* Hard Delete Button Cell */}
                <td className="p-2 border text-center align-middle">
                  <div className="flex flex-col items-center justify-center h-full">
                    {onHardDelete ? (
                      <>
                        <button
                          className="flex-shrink-0 w-14 h-14 rounded-xl bg-red-100 hover:bg-red-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
                          onClick={() => onHardDelete(event)}
                          title="Permanently delete event (hard delete)"
                          aria-label="Hard delete event"
                        >
                          <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                        <span className="text-[9px] text-gray-700 mt-1 block font-bold">Hard Delete</span>
                      </>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </div>
                </td>
                <td className="p-2 border text-center align-middle">
                  <span className="relative group flex flex-col items-center">
                    <a href={`/admin/events/${event.id}/media/list`} className="inline-block w-full h-full" title="List Media files" aria-label="List Media files">
                      <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-green-100 hover:bg-green-200 flex items-center justify-center transition-all duration-300 hover:scale-110 mx-auto">
                        <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span className="text-[10px] text-gray-600 mt-1 block font-bold">List Media files</span>
                    </a>
                  </span>
                </td>
                <td className="p-2 border text-center align-middle">
                  <a href={`/admin/events/${event.id}/media`} className="inline-block w-full h-full" title="Upload Media Files" aria-label="Upload Media Files">
                    <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-all duration-300 hover:scale-110 mx-auto">
                      <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <span className="text-[10px] text-gray-600 mt-1 block font-bold">Upload<br />Media Files</span>
                  </a>
                </td>
                <td className="p-2 border text-center align-middle">
                  <span className="relative group flex flex-col items-center">
                    {(() => {
                      let calendarLink = '';
                      if (calendarEvent && calendarEvent.calendarLink) {
                        calendarLink = calendarEvent.calendarLink;
                      } else {
                        // Generate Google Calendar URL on the fly
                        const start = toGoogleCalendarDate(event.startDate, event.startTime);
                        const end = toGoogleCalendarDate(event.endDate, event.endTime);
                        const text = encodeURIComponent(event.title);
                        const details = encodeURIComponent(event.description || '');
                        const location = encodeURIComponent(event.location || '');
                        calendarLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${start}/${end}&details=${details}&location=${location}`;
                      }
                      return (
                        <a href={calendarLink} target="_blank" rel="noopener noreferrer" className="inline-block w-full h-full" title="View Calendar" aria-label="View Calendar">
                          <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-orange-100 hover:bg-orange-200 flex items-center justify-center transition-all duration-300 hover:scale-110 mx-auto">
                            <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <span className="text-[10px] text-gray-600 mt-1 block font-bold">View Calendar</span>
                        </a>
                      );
                    })()}
                  </span>
                </td>
                <td className="p-2 border text-center align-middle">
                  {event.admissionType === 'ticketed' ? (
                    <Link href={`/admin/events/${event.id}/ticket-types/list`} className="inline-block w-full h-full" title="Manage Ticket Types" aria-label="Manage Ticket Types">
                      <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-teal-100 hover:bg-teal-200 flex items-center justify-center transition-all duration-300 hover:scale-110 mx-auto">
                        <svg className="w-10 h-10 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4v-3a2 2 0 00-2-2H5z" />
                        </svg>
                      </div>
                      <span className="text-[10px] text-gray-600 mt-1 block font-bold">Manage<br />Ticket Types</span>
                    </Link>
                  ) : (
                    <span className="text-gray-400 text-xs">—</span>
                  )}
                </td>

                {showDetailsOnHover && hoveredEventId === event.id && (
                  <td
                    colSpan={8}
                    style={{ position: 'absolute', left: 10, top: '50%', zIndex: 10, width: '100%' }}
                  >
                    <div className="bg-white border rounded shadow-lg p-6 text-xs w-max max-w-2xl mx-auto mt-2 relative max-h-96 overflow-auto">
                      <button
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-lg font-bold focus:outline-none"
                        onClick={() => setHoveredEventId(null)}
                        aria-label="Close tooltip"
                      >
                        &times;
                      </button>
                      <table className="w-full text-sm border border-gray-300">
                        <tbody>
                          {Object.entries(event).map(([key, value]) => {
                            let displayValue: string | number = '';
                            if ((key === 'createdBy' || key === 'eventType') && value && typeof value === 'object' && 'id' in value) {
                              displayValue = value.id;
                            } else if (typeof value === 'object' && value !== null) {
                              displayValue = JSON.stringify(value);
                            } else {
                              displayValue = String(value);
                            }
                            return (
                              <tr key={key} className="border-b border-gray-200">
                                <td className="font-bold pr-4 border-r border-gray-200 align-top">{key}:</td>
                                <td className="align-top break-all">{displayValue}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg font-medium mb-2">No events found</p>
          <p className="text-sm">No events match your current search criteria.</p>
        </div>
      )}

      {/* Pagination Controls - Always visible, matching admin page style */}
      <div className="mt-8">
        <div className="flex justify-between items-center">
          {/* Previous Button */}
          <button
            onClick={onPrevPage}
            disabled={isPrevDisabled}
            className="px-5 py-2.5 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-lg shadow-sm border-2 border-blue-400 hover:border-blue-500 disabled:bg-blue-100 disabled:border-blue-300 disabled:text-blue-500 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-md"
            title="Previous Page"
            aria-label="Previous Page"
            type="button"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Previous</span>
          </button>

          {/* Page Info */}
          <div className="px-4 py-2 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-sm">
            <span className="text-sm font-bold text-blue-700">
              Page <span className="text-blue-600">{displayPage}</span> of <span className="text-blue-600">{totalPages}</span>
            </span>
          </div>

          {/* Next Button */}
          <button
            onClick={onNextPage}
            disabled={isNextDisabled}
            className="px-5 py-2.5 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-lg shadow-sm border-2 border-blue-400 hover:border-blue-500 disabled:bg-blue-100 disabled:border-blue-300 disabled:text-blue-500 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-md"
            title="Next Page"
            aria-label="Next Page"
            type="button"
          >
            <span>Next</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Item Count Text */}
        <div className="text-center mt-3">
          {totalCount > 0 ? (
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-sm">
              <span className="text-sm text-gray-700">
                Showing <span className="font-bold text-blue-600">{startItem}</span> to <span className="font-bold text-blue-600">{endItem}</span> of <span className="font-bold text-blue-600">{totalCount}</span> events
              </span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border-2 border-orange-300 rounded-lg shadow-sm">
              <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-orange-700">No events found</span>
              <span className="text-sm text-orange-600">[No events match your criteria]</span>
            </div>
          )}
        </div>
      </div>

      {tooltipEvent && (
        <EventDetailsTooltip event={tooltipEvent} anchorRect={tooltipAnchor} onClose={handleTooltipClose} />
      )}
    </>
  );
}