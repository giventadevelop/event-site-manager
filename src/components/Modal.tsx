import React from 'react';
import { createPortal } from 'react-dom';

export function Modal({
  open,
  onClose,
  children,
  title,
  preventBackdropClose = false
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  preventBackdropClose?: boolean;
}) {
  if (!open) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.target === e.currentTarget && !preventBackdropClose) {
      onClose();
    }
  };

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleCloseClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-40"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-lg shadow-xl p-6 min-w-[350px] max-w-2xl w-full relative max-h-[90vh] overflow-y-auto"
        onClick={handleModalClick}
      >
        <button
          className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white font-bold text-xl w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
          onClick={handleCloseClick}
          aria-label="Close"
        >
          &times;
        </button>
        {title && (
          <h2 className="text-xl font-semibold mb-6 pr-8">{title}</h2>
        )}
        {children}
      </div>
    </div>
  );

  return typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null;
}