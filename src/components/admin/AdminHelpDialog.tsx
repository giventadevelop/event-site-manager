'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { FaQuestionCircle, FaTimes } from 'react-icons/fa';

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes adminHelpFadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  if (!document.head.querySelector('style[data-admin-help-animations]')) {
    style.setAttribute('data-admin-help-animations', 'true');
    document.head.appendChild(style);
  }
}

export type AdminHelpAccent = 'blue' | 'teal';

const ACCENT_STYLES: Record<
  AdminHelpAccent,
  { icon: string; iconHover: string; ring: string; border: string; header: string; headerBorder: string; headerHover: string; spinner: string }
> = {
  blue: {
    icon: 'text-blue-500 hover:text-blue-700',
    iconHover: 'hover:text-blue-700',
    ring: 'focus:ring-blue-500',
    border: 'border-blue-500',
    header: 'from-blue-500 to-blue-600',
    headerBorder: 'border-blue-700',
    headerHover: 'hover:bg-blue-700',
    spinner: 'border-blue-500',
  },
  teal: {
    icon: 'text-teal-600 hover:text-teal-800',
    iconHover: 'hover:text-teal-800',
    ring: 'focus:ring-teal-500',
    border: 'border-teal-500',
    header: 'from-teal-500 to-teal-600',
    headerBorder: 'border-teal-700',
    headerHover: 'hover:bg-teal-700',
    spinner: 'border-teal-500',
  },
};

export interface AdminHelpDialogProps {
  title: string;
  ariaLabel: string;
  documentationUrl?: string;
  customContent?: React.ReactNode;
  accent?: AdminHelpAccent;
}

function extractHelpHtml(rawHtml: string): string {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawHtml, 'text/html');
    const fragment = doc.querySelector('.admin-help-content');
    if (fragment) return fragment.innerHTML;
    return doc.body?.innerHTML?.trim() || rawHtml;
  } catch {
    return rawHtml;
  }
}

/**
 * Admin help dialog — click the ? icon to open guidelines (portal).
 * Fetches static HTML from public/documentation or shows customContent.
 */
export default function AdminHelpDialog({
  title,
  ariaLabel,
  documentationUrl,
  customContent,
  accent = 'blue',
}: AdminHelpDialogProps) {
  const styles = ACCENT_STYLES[accent];
  const [isOpen, setIsOpen] = useState(false);
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const iconRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const calculatePosition = useCallback(() => {
    if (!iconRef.current) return { top: 0, left: 0 };

    const iconRect = iconRef.current.getBoundingClientRect();
    const tooltipWidth = 800;
    const tooltipHeight = 600;
    const spacing = 12;

    let top = iconRect.bottom + spacing;
    let left = iconRect.left;

    if (left + tooltipWidth > window.innerWidth) {
      left = window.innerWidth - tooltipWidth - 20;
    }
    if (top + tooltipHeight > window.innerHeight) {
      top = iconRect.top - tooltipHeight - spacing;
    }
    if (left < 20) left = 20;
    if (top < 20) top = 20;

    return { top, left };
  }, []);

  useEffect(() => {
    if (!isOpen || customContent || !documentationUrl) return;
    if (htmlContent || loading) return;

    setLoading(true);
    setError(null);
    fetch(documentationUrl)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch documentation');
        return res.text();
      })
      .then((html) => {
        setHtmlContent(extractHelpHtml(html));
        setLoading(false);
      })
      .catch((err) => {
        console.error('[AdminHelpDialog] Error fetching documentation:', err);
        setError('Unable to load help documentation');
        setLoading(false);
      });
  }, [isOpen, customContent, documentationUrl, htmlContent, loading]);

  useEffect(() => {
    if (isOpen) {
      setPosition(calculatePosition());
    }
  }, [isOpen, calculatePosition]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dialogRef.current &&
        !dialogRef.current.contains(event.target as Node) &&
        iconRef.current &&
        !iconRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  const handleClose = () => setIsOpen(false);

  return (
    <>
      <button
        ref={iconRef}
        type="button"
        onClick={handleToggle}
        className={`inline-flex items-center justify-center w-5 h-5 text-current focus:outline-none focus:ring-2 focus:ring-offset-1 rounded-full transition-colors ${styles.icon} ${styles.ring}`}
        title={ariaLabel}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
      >
        <FaQuestionCircle className="w-5 h-5" />
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={dialogRef}
            className={`fixed z-[9999] bg-white rounded-lg shadow-2xl border-2 ${styles.border} overflow-hidden`}
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
              width: 'min(90vw, 800px)',
              maxHeight: 'min(80vh, 600px)',
              animation: 'adminHelpFadeIn 0.3s ease-in-out forwards',
              opacity: 0,
            }}
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            <div
              className={`sticky top-0 bg-gradient-to-r ${styles.header} text-white px-4 py-3 flex items-center justify-between border-b ${styles.headerBorder} z-10`}
            >
              <h3 className="text-lg font-bold text-yellow-200 drop-shadow-md pr-4">{title}</h3>
              <button
                type="button"
                onClick={handleClose}
                className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full ${styles.headerHover} transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-teal-600`}
                aria-label="Close guidelines dialog"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto" style={{ maxHeight: 'calc(min(80vh, 600px) - 60px)' }}>
              {loading && (
                <div className="p-8 text-center text-gray-500">
                  <div
                    className={`inline-block animate-spin rounded-full h-8 w-8 border-b-2 ${styles.spinner} mb-2`}
                  />
                  <p>Loading guidelines...</p>
                </div>
              )}

              {error && (
                <div className="p-8 text-center">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-700">{error}</p>
                    {documentationUrl && (
                      <p className="text-sm text-red-600 mt-2">
                        Expected file:
                        <br />
                        <code className="text-xs">{documentationUrl}</code>
                      </p>
                    )}
                  </div>
                  {customContent && <div className="p-6 text-left">{customContent}</div>}
                </div>
              )}

              {customContent && !loading && !error && <div className="p-6">{customContent}</div>}

              {!loading && !error && !customContent && htmlContent && (
                <div
                  className="p-6 admin-help-dialog-body"
                  dangerouslySetInnerHTML={{ __html: htmlContent }}
                />
              )}

              {!loading && !error && !customContent && !htmlContent && !documentationUrl && (
                <div className="p-8 text-center text-gray-500">
                  <p>No help content available.</p>
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
