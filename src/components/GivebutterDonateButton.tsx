'use client';

import React, { useEffect, useState } from 'react';

interface GivebutterDonateButtonProps {
  campaignId?: string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Givebutter Donate Button Component
 * Creates a button that opens a Givebutter donation popup modal
 * 
 * Uses Givebutter's native button element which opens a modal when clicked.
 * Falls back to popup window if custom element is not available.
 * 
 * Usage:
 * <GivebutterDonateButton campaignId="mhoZp0">
 *   <span>Donate Now</span>
 * </GivebutterDonateButton>
 */
export default function GivebutterDonateButton({ 
  campaignId = 'mhoZp0',
  className = '',
  children
}: GivebutterDonateButtonProps) {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [useCustomElement, setUseCustomElement] = useState(false);

  useEffect(() => {
    // Wait for Givebutter script and custom element to be defined
    const checkGivebutter = () => {
      if (typeof window === 'undefined') return false;
      
      const script = document.querySelector('script[src*="widgets.givebutter.com"]');
      if (!script) return false;

      // Check if custom element is defined
      const isCustomElementDefined = 
        customElements.get('givebutter-button') !== undefined ||
        (window as any).Givebutter ||
        (window as any).givebutter;

      if (isCustomElementDefined) {
        setIsScriptLoaded(true);
        setUseCustomElement(true);
        return true;
      }
      return false;
    };

    // Check immediately
    if (checkGivebutter()) return;

    // Poll for script and custom element
    const interval = setInterval(() => {
      if (checkGivebutter()) {
        clearInterval(interval);
      }
    }, 100);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      console.warn('[GivebutterDonateButton] Givebutter custom element not available, using popup window fallback');
      setIsScriptLoaded(true); // Still allow button to work with fallback
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  // Use Givebutter's native button element if available (opens modal automatically)
  if (useCustomElement && isScriptLoaded) {
    return (
      <givebutter-button 
        campaign={campaignId}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        {children}
      </givebutter-button>
    );
  }

  // Fallback: Regular button that opens popup window (desktop) or new tab (mobile)
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Detect mobile device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || 
                     (window.innerWidth <= 768);

    if (isMobile) {
      // Mobile: Open in new tab (better UX, supports PRB)
      // Mobile browsers typically don't support popup windows well
      // Opening in new tab ensures Apple Pay/Google Pay PRB work correctly
      console.log('[GivebutterDonateButton] Mobile device detected - opening in new tab for PRB support');
      window.open(`https://givebutter.com/${campaignId}`, '_blank');
      return;
    }

    // Desktop: Try popup window first
    const width = 800;
    const height = 900;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    const popup = window.open(
      `https://givebutter.com/${campaignId}`,
      'GivebutterDonation',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no`
    );
    
    if (popup) {
      popup.focus();
      // Monitor popup for closure (optional - for analytics or callbacks)
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          console.log('[GivebutterDonateButton] Donation popup closed');
        }
      }, 500);
      
      // Cleanup interval after 10 minutes
      setTimeout(() => clearInterval(checkClosed), 600000);
    } else {
      // Popup blocked - fallback to new tab
      console.warn('[GivebutterDonateButton] Popup blocked, opening in new tab');
      window.open(`https://givebutter.com/${campaignId}`, '_blank');
    }
  };

  return (
    <button
      onClick={handleClick}
      className={className}
      title="Donate Now"
      aria-label="Donate Now"
      type="button"
    >
      {children}
    </button>
  );
}
