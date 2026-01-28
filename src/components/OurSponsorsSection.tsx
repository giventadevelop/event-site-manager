'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import type { EventSponsorsDTO } from "@/types";
import { getAppUrl } from '@/lib/env';
import { SponsorCard } from '@/components/sponsors/SponsorCard';

const OurSponsorsSection: React.FC = () => {
  const [sponsors, setSponsors] = useState<EventSponsorsDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  // Cache key for sessionStorage
  const CACHE_KEY = 'homepage_sponsors_cache';
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

  // Function to get random background color for each sponsor
  const getRandomBackground = (index: number) => {
    return cardBackgrounds[index % cardBackgrounds.length];
  };

  useEffect(() => {
    async function fetchSponsors() {
      // Check cache first
      try {
        const cachedData = sessionStorage.getItem(CACHE_KEY);
        if (cachedData) {
          const { data, timestamp } = JSON.parse(cachedData);
          if (Date.now() - timestamp < CACHE_DURATION) {
            console.log('✅ Using cached sponsors data');
            setSponsors(data);
            setLoading(false);
            return;
          }
        }
      } catch (error) {
        console.warn('Failed to read sponsors cache:', error);
      }

      setLoading(true);
      setFetchError(false);
      try {
        // Fetch sponsors sorted by priority ranking (ascending = highest priority first)
        const params = new URLSearchParams({
          sort: 'priorityRanking,asc',
          page: '0',
          size: '15', // Maximum 15 sponsors
          'isActive.equals': 'true' // Only active sponsors
        });

        const baseUrl = getAppUrl();
        const response = await fetch(`${baseUrl}/api/proxy/event-sponsors?${params.toString()}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
        });

        if (response.ok) {
          const data = await response.json();
          const sponsorsList = Array.isArray(data) ? data : [];

          // Limit to maximum 15 sponsors (top priority ranking)
          const limitedSponsors = sponsorsList.slice(0, 15);
          console.log('✅ Fetched sponsors for homepage:', limitedSponsors.length, 'out of', sponsorsList.length);

          // Cache the data
          try {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify({
              data: limitedSponsors,
              timestamp: Date.now()
            }));
          } catch (error) {
            console.warn('Failed to cache sponsors data:', error);
          }

          setSponsors(limitedSponsors);
        } else {
          console.warn('Failed to fetch sponsors:', response.status);
          setFetchError(true);
        }
      } catch (error) {
        console.error('Error fetching sponsors:', error);
        setFetchError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchSponsors();
  }, []);

  // Don't render anything while loading - section will appear only when fully loaded
  if (loading) {
    return null;
  }

  if (fetchError) {
    return (
      <section className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-5 h-2 bg-yellow-400 rounded"></div>
              <p className="text-gray-600 font-medium">Sponsors</p>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Sponsors
            </h2>
          </div>
          <div className="text-center text-gray-500 py-8">
            <div className="bg-white rounded-lg shadow-sm p-8 max-w-md mx-auto">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Sponsors Information Temporarily Unavailable</h3>
              <p className="text-gray-500">We're currently updating our sponsors information. Please check back later.</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (sponsors.length === 0) {
    return (
      <section className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-5 h-2 bg-yellow-400 rounded"></div>
              <p className="text-gray-600 font-medium">Sponsors</p>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Sponsors
            </h2>
          </div>
          <div className="text-center text-gray-500 py-8">
            <div className="bg-white rounded-lg shadow-sm p-8 max-w-md mx-auto">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Sponsors Available</h3>
              <p className="text-gray-500">We're currently seeking sponsors for our events. Contact us to learn about sponsorship opportunities!</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-5 h-2 bg-yellow-400 rounded"></div>
            <p className="text-gray-600 font-medium">Sponsors</p>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Our Sponsors
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Grateful for the support of our amazing sponsors who make our events and community initiatives possible
          </p>
        </div>

        {/* Sponsors List - Single column layout with equal height cards */}
        <div className="space-y-8 mb-8">
          {sponsors.map((sponsor, index) => (
            <SponsorCard
              key={sponsor.id ?? index}
              sponsor={sponsor}
              backgroundClass={getRandomBackground(index)}
              onCardClick={() => sponsor.websiteUrl && window.open(sponsor.websiteUrl, '_blank')}
            />
          ))}
        </div>

        {/* View All Sponsors Button */}
        <div className="text-center">
          <Link
            href="/sponsors"
            className="inline-flex flex-shrink-0 h-14 rounded-xl bg-indigo-100 hover:bg-indigo-200 items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
            title="See All Sponsors"
            aria-label="See All Sponsors"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-200 flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <span className="font-semibold text-indigo-700">See All Sponsors</span>
          </Link>
        </div>
      </div>

    </section>
  );
};

export default OurSponsorsSection;
