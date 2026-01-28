'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { EventDetailsDTO } from '@/types';
import { fetchEventsFilteredServer } from '@/app/admin/ApiServerActions';
import { associateEventWithFocusGroup } from '../ApiServerActions';
import { FaSearch } from 'react-icons/fa';

interface FocusGroupEventSearchProps {
  focusGroupId: number;
  onEventAssociated: () => void;
}

export default function FocusGroupEventSearch({
  focusGroupId,
  onEventAssociated,
}: FocusGroupEventSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'title' | 'id'>('title');
  const [events, setEvents] = useState<EventDetailsDTO[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventDetailsDTO[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [associating, setAssociating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load initial events
    loadEvents();
  }, []);

  useEffect(() => {
    // Filter events based on search term
    if (searchTerm.trim()) {
      const filtered = events.filter(event => {
        if (searchType === 'id') {
          return event.id?.toString().includes(searchTerm);
        } else {
          return event.title?.toLowerCase().includes(searchTerm.toLowerCase());
        }
      });
      setFilteredEvents(filtered.slice(0, 7)); // Max 7 items
    } else {
      setFilteredEvents(events.slice(0, 7));
    }
  }, [searchTerm, searchType, events]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const result = await fetchEventsFilteredServer({
        pageNum: 0,
        pageSize: 100,
        sort: 'startDate,desc',
      });
      setEvents(result.events);
    } catch (err: any) {
      console.error('Failed to load events:', err);
      // Don't show error during initial load - just log it
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    setIsOpen(true);
    setError(null);
    setSuccess(null);
  };

  const handleSelectEvent = async (event: EventDetailsDTO) => {
    if (!event.id) return;

    setAssociating(true);
    setError(null);
    setSuccess(null);

    try {
      await associateEventWithFocusGroup(event.id, focusGroupId);
      setSuccess(`Event "${event.title}" successfully associated with this focus group.`);
      setSearchTerm('');
      setIsOpen(false);
      onEventAssociated();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Failed to associate event:', err);
      const errorMessage = err.message?.includes('duplicate') || err.message?.includes('already')
        ? 'This event is already associated with this focus group.'
        : 'Failed to associate event. Please try again.';
      setError(errorMessage);
    } finally {
      setAssociating(false);
    }
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Associate Event with Focus Group</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {success}
        </div>
      )}

      <div ref={containerRef} className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Search Events
        </label>

        {/* Search Type Toggle */}
        <div className="mb-2 flex gap-2">
          <button
            type="button"
            onClick={() => {
              setSearchType('title');
              setSearchTerm('');
              setIsOpen(true);
            }}
            className={`px-3 py-1 text-xs rounded ${
              searchType === 'title'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Search by Title
          </button>
          <button
            type="button"
            onClick={() => {
              setSearchType('id');
              setSearchTerm('');
              setIsOpen(true);
            }}
            className={`px-3 py-1 text-xs rounded ${
              searchType === 'id'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Search by ID
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type={searchType === 'id' ? 'number' : 'text'}
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={() => setIsOpen(true)}
            placeholder={searchType === 'id' ? 'Enter Event ID...' : 'Search events by title...'}
            disabled={associating || loading}
            className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 pl-10 pr-10 px-4 py-2 text-base disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Dropdown Results */}
        {isOpen && (filteredEvents.length > 0 || loading) && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg" style={{ maxHeight: 'calc(7 * 3.5rem)', overflowY: 'auto' }}>
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading events...</div>
            ) : filteredEvents.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No events found</div>
            ) : (
              <ul className="py-1">
                {filteredEvents.map((event) => (
                  <li
                    key={event.id}
                    onClick={() => !associating && handleSelectEvent(event)}
                    className={`px-4 py-2 cursor-pointer hover:bg-blue-50 ${
                      associating ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <div className="font-medium text-gray-900">
                      {event.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      ID: {event.id} | {event.startDate}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

