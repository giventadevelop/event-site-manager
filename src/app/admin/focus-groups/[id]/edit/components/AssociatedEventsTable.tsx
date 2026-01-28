'use client';

import React, { useState, useEffect } from 'react';
import type { EventDetailsDTO } from '@/types';
import { fetchAssociatedEvents, unlinkEventFromFocusGroup } from '../ApiServerActions';
import { FaChevronLeft, FaChevronRight, FaUnlink } from 'react-icons/fa';
import { formatDateLocal } from '@/lib/date';
import Link from 'next/link';

interface AssociatedEventsTableProps {
  focusGroupId: number;
  initialEvents?: EventDetailsDTO[];
  initialTotalCount?: number;
}

export default function AssociatedEventsTable({
  focusGroupId,
  initialEvents = [],
  initialTotalCount = 0,
}: AssociatedEventsTableProps) {
  const [events, setEvents] = useState<EventDetailsDTO[]>(initialEvents);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [unlinkingId, setUnlinkingId] = useState<number | null>(null);

  const totalPages = Math.ceil(totalCount / pageSize);
  const displayPage = currentPage + 1;
  const startItem = currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalCount);

  const isPrevDisabled = currentPage === 0 || loading;
  const isNextDisabled = currentPage >= totalPages - 1 || loading;

  const loadEvents = async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      const sort = 'startDate,desc';
      const result = await fetchAssociatedEvents(focusGroupId, page, pageSize, sort, showPastEvents);
      setEvents(result.events);
      setTotalCount(result.totalCount);
    } catch (err: any) {
      console.error('Failed to load associated events:', err);
      setError('Failed to load events. Please try again.');
      setEvents([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusGroupId, currentPage, showPastEvents]);

  const handlePrevPage = () => {
    if (!isPrevDisabled) {
      setCurrentPage(prev => Math.max(0, prev - 1));
    }
  };

  const handleNextPage = () => {
    if (!isNextDisabled) {
      setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
    }
  };

  const handleUnlink = async (event: EventDetailsDTO) => {
    if (!event.id) return;

    if (!confirm(`Are you sure you want to unlink "${event.title}" from this focus group?`)) {
      return;
    }

    setUnlinkingId(event.id);
    try {
      await unlinkEventFromFocusGroup(event.id, focusGroupId);
      
      // Refresh the events list
      await loadEvents(currentPage);
      
      // If we're on the last page and it becomes empty, go to previous page
      if (events.length === 1 && currentPage > 0) {
        setCurrentPage(prev => prev - 1);
      }
    } catch (err: any) {
      console.error('Failed to unlink event:', err);
      alert(`Failed to unlink event: ${err.message || 'Unknown error'}`);
    } finally {
      setUnlinkingId(null);
    }
  };

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Associated Events</h2>
        
        {/* Filter Toggle */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setShowPastEvents(false);
              setCurrentPage(0);
            }}
            className={`px-3 py-1 text-xs rounded ${
              !showPastEvents
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Upcoming Events
          </button>
          <button
            type="button"
            onClick={() => {
              setShowPastEvents(true);
              setCurrentPage(0);
            }}
            className={`px-3 py-1 text-xs rounded ${
              showPastEvents
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Past Events
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {loading && events.length === 0 ? (
        <div className="text-center py-8 text-gray-500">Loading events...</div>
      ) : events.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-2">No events found</p>
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm font-medium">
            [No events match your criteria]
          </span>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    End Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/events/${event.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {event.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {event.startDate ? formatDateLocal(event.startDate) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {event.endDate ? formatDateLocal(event.endDate) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          event.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {event.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleUnlink(event)}
                        disabled={unlinkingId !== null}
                        className="flex items-center gap-2 px-3 py-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Unlink event from focus group"
                      >
                        <FaUnlink className="h-4 w-4" />
                        Unlink
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="mt-8">
            <div className="flex justify-between items-center">
              <button
                onClick={handlePrevPage}
                disabled={isPrevDisabled}
                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                <FaChevronLeft className="h-5 w-5" />
                Previous
              </button>
              <div className="text-sm font-semibold text-gray-700">
                Page {displayPage} of {totalPages || 1}
              </div>
              <button
                onClick={handleNextPage}
                disabled={isNextDisabled}
                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                Next
                <FaChevronRight className="h-5 w-5" />
              </button>
            </div>
            <div className="text-center text-sm text-gray-600 mt-2">
              {totalCount > 0 ? (
                <>
                  Showing <span className="font-medium">{startItem}</span> to{' '}
                  <span className="font-medium">{endItem}</span> of{' '}
                  <span className="font-medium">{totalCount}</span> events
                </>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>No events found</span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm font-medium">
                    [No events match your criteria]
                  </span>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

