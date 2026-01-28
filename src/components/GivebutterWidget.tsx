'use client';

import React, { useEffect, useState } from 'react';

interface GivebutterWidgetProps {
  campaignId?: string;
  widgetId?: string;
  className?: string;
}

/**
 * Givebutter Widget Component
 * Embeds a Givebutter donation widget into the page
 * 
 * Usage:
 * <GivebutterWidget campaignId="mhoZp0" /> - For campaign form
 * <GivebutterWidget widgetId="your-widget-id" /> - For specific widget
 */
export default function GivebutterWidget({ 
  campaignId = 'mhoZp0', 
  widgetId,
  className = '' 
}: GivebutterWidgetProps) {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  useEffect(() => {
    // Check if Givebutter script is already loaded
    if (typeof window !== 'undefined') {
      const script = document.querySelector('script[src*="widgets.givebutter.com"]');
      if (script) {
        setIsScriptLoaded(true);
        return;
      }

      // Wait for script to load from head
      const checkScript = setInterval(() => {
        const script = document.querySelector('script[src*="widgets.givebutter.com"]');
        if (script && (window as any).Givebutter) {
          setIsScriptLoaded(true);
          clearInterval(checkScript);
        }
      }, 100);

      // Cleanup after 10 seconds
      setTimeout(() => clearInterval(checkScript), 10000);

      return () => clearInterval(checkScript);
    }
  }, []);

  // Use custom element approach - Givebutter will automatically initialize these
  if (widgetId) {
    return (
      <div className={`givebutter-widget-container ${className}`}>
        <givebutter-widget id={widgetId} />
      </div>
    );
  }

  // Use campaign form approach
  return (
    <div className={`givebutter-widget-container ${className}`}>
      <givebutter-form campaign={campaignId} />
      {!isScriptLoaded && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading donation form...</p>
          </div>
        </div>
      )}
    </div>
  );
}
