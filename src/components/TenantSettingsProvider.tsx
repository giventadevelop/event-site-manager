'use client';

import React, { useEffect, useState } from 'react';
import { TenantSettingsDTO } from '@/types';
import { parseTenantDefaultHeroUrls } from '@/lib/hero/defaultHeroImages';

interface TenantSettingsContextType {
  settings: TenantSettingsDTO | null;
  loading: boolean;
  showEventsSection: boolean;
  showTeamSection: boolean;
  showSponsorsSection: boolean;
  showHeaderHome: boolean;
  showHeaderAbout: boolean;
  showHeaderEvents: boolean;
  showHeaderFeatures: boolean;
  showHeaderCalendar: boolean;
  showHeaderGallery: boolean;
  showHeaderContact: boolean;
  showHeaderNews: boolean;
  showHeaderDownloads: boolean;
  showHeaderLinks: boolean;
}

function normalizeTenantSettings(settings: TenantSettingsDTO): TenantSettingsDTO {
  const defaultHeroImageUrls = parseTenantDefaultHeroUrls(settings);
  if (defaultHeroImageUrls.length === 0) {
    return settings;
  }
  return {
    ...settings,
    defaultHeroImageUrls,
  };
}

const TenantSettingsContext = React.createContext<TenantSettingsContextType>({
  settings: null,
  loading: true,
  showEventsSection: true, // Default to true for backward compatibility
  showTeamSection: true,
  showSponsorsSection: true,
  showHeaderHome: true,
  showHeaderAbout: true,
  showHeaderEvents: true,
  showHeaderFeatures: true,
  showHeaderCalendar: true,
  showHeaderGallery: true,
  showHeaderContact: true,
  showHeaderNews: false,
  showHeaderDownloads: false,
  showHeaderLinks: false,
});

export const useTenantSettings = () => React.useContext(TenantSettingsContext);

interface TenantSettingsProviderProps {
  children: React.ReactNode;
}

export const TenantSettingsProvider: React.FC<TenantSettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<TenantSettingsDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  // Cache key for sessionStorage
  const CACHE_KEY = 'homepage_tenant_settings_cache';
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  const MAX_RETRIES = 2;
  const RETRY_DELAY = 2000; // 2 seconds

  useEffect(() => {
    async function fetchTenantSettings() {
      // Check cache first
      try {
        const cachedData = sessionStorage.getItem(CACHE_KEY);
        if (cachedData) {
          const { data, timestamp } = JSON.parse(cachedData);
          if (Date.now() - timestamp < CACHE_DURATION) {
            console.log('✅ Using cached tenant settings data');
            setSettings(data);
            setLoading(false);
            return;
          }
        }
      } catch (error) {
        console.warn('Failed to read tenant settings cache:', error);
      }

      try {
        const response = await fetch(
          `/api/proxy/tenant-settings`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            cache: 'no-store',
          }
        );

        if (response.ok) {
          const data = await response.json();
          const tenantSettings = Array.isArray(data) ? data[0] : data;

          if (tenantSettings) {
            console.log('✅ Tenant settings fetched successfully:', {
              tenantId: tenantSettings.tenantId,
              showEvents: tenantSettings.showEventsSectionInHomePage,
              showTeam: tenantSettings.showTeamMembersSectionInHomePage,
              showSponsors: tenantSettings.showSponsorsSectionInHomePage
            });

            setSettings(normalizeTenantSettings(tenantSettings));

            // Cache the result
            try {
              sessionStorage.setItem(CACHE_KEY, JSON.stringify({
                data: tenantSettings,
                timestamp: Date.now()
              }));
            } catch (error) {
              console.warn('Failed to cache tenant settings:', error);
            }
          } else {
            console.warn('⚠️ No tenant settings found, using defaults');
            setSettings(null);
          }
        } else {
          // Handle different error status codes gracefully
          if (response.status === 500) {
            console.warn('⚠️ Tenant settings service temporarily unavailable');
          } else if (response.status === 404) {
            console.warn('⚠️ Tenant settings endpoint not found');
          } else {
            console.warn(`⚠️ Failed to fetch tenant settings (${response.status})`);
          }

          // Retry logic for server errors
          if ((response.status >= 500 || response.status === 0) && retryCount < MAX_RETRIES) {
            console.log(`🔄 Retrying tenant settings fetch (attempt ${retryCount + 1}/${MAX_RETRIES})`);
            setTimeout(() => {
              setRetryCount(prev => prev + 1);
            }, RETRY_DELAY);
            return; // Don't set loading to false yet
          }

          setSettings(null);
        }
      } catch (error) {
        // Handle network errors and other exceptions gracefully
        if (error instanceof TypeError && error.message.includes('fetch')) {
          console.warn('⚠️ Network error fetching tenant settings');
        } else {
          console.warn('⚠️ Error fetching tenant settings:', error);
        }

        // Retry logic for network errors
        if (retryCount < MAX_RETRIES) {
          console.log(`🔄 Retrying tenant settings fetch after network error (attempt ${retryCount + 1}/${MAX_RETRIES})`);
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, RETRY_DELAY);
          return; // Don't set loading to false yet
        }

        setSettings(null);
        setLoading(false); // Always stop loading after max retries
      }

      // Always set loading to false after successful fetch or after all retries exhausted
      setLoading(false);
    }

    fetchTenantSettings();
  }, [CACHE_KEY, CACHE_DURATION, retryCount]);

  // Determine section visibility with fallback to true (show by default)
  // This ensures the app continues to work even if tenant settings fail
  const showEventsSection = settings?.showEventsSectionInHomePage ?? true;
  const showTeamSection = settings?.showTeamMembersSectionInHomePage ?? true;
  const showSponsorsSection = settings?.showSponsorsSectionInHomePage ?? true;
  // Header menu: legacy items default ON; news/downloads/links default OFF
  const showHeaderHome = settings?.showHeaderHome ?? true;
  const showHeaderAbout = settings?.showHeaderAbout ?? true;
  const showHeaderEvents = settings?.showHeaderEvents ?? true;
  const showHeaderFeatures = settings?.showHeaderFeatures ?? true;
  const showHeaderCalendar = settings?.showHeaderCalendar ?? true;
  const showHeaderGallery = settings?.showHeaderGallery ?? true;
  const showHeaderContact = settings?.showHeaderContact ?? true;
  const showHeaderNews = settings?.showHeaderNews ?? false;
  const showHeaderDownloads = settings?.showHeaderDownloads ?? false;
  const showHeaderLinks = settings?.showHeaderLinks ?? false;

  const contextValue: TenantSettingsContextType = {
    settings,
    loading,
    showEventsSection,
    showTeamSection,
    showSponsorsSection,
    showHeaderHome,
    showHeaderAbout,
    showHeaderEvents,
    showHeaderFeatures,
    showHeaderCalendar,
    showHeaderGallery,
    showHeaderContact,
    showHeaderNews,
    showHeaderDownloads,
    showHeaderLinks,
  };

  return (
    <TenantSettingsContext.Provider value={contextValue}>
      {children}
    </TenantSettingsContext.Provider>
  );
};

