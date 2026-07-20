'use client';

import { Modal } from '../Modal';

interface ErrorDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  buttonText?: string;
}

export function ErrorDialog({
  open,
  onClose,
  title,
  message,
  buttonText = 'OK',
}: ErrorDialogProps) {
  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} title={undefined}>
      <div className="text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>

          <p className="text-gray-600 max-w-sm whitespace-pre-wrap">{message}</p>

          <button
            onClick={onClose}
            className="flex-shrink-0 h-14 rounded-xl bg-red-100 hover:bg-red-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
            title={buttonText}
            aria-label={buttonText}
            type="button"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-200 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <span className="font-semibold text-red-700">{buttonText}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
