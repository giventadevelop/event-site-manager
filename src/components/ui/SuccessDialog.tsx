'use client';

import { Modal } from '../Modal';

interface SuccessDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  buttonText?: string;
}

export function SuccessDialog({ 
  open, 
  onClose, 
  title, 
  message, 
  buttonText = "OK" 
}: SuccessDialogProps) {
  console.log('[SUCCESS DIALOG] Component called with open:', open, 'title:', title);
  
  if (!open) {
    console.log('[SUCCESS DIALOG] Not rendering because open is false');
    return null;
  }
  
  console.log('[SUCCESS DIALOG] Rendering dialog');

  return (
    <Modal open={open} onClose={onClose} title={undefined}>
      <div className="text-center">
        <div className="flex flex-col items-center space-y-4">
          {/* Success Icon */}
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          {/* Title */}
          <h3 className="text-xl font-semibold text-gray-800">
            {title}
          </h3>
          
          {/* Message */}
          <p className="text-gray-600 max-w-sm">
            {message}
          </p>
          
          {/* Action Button */}
          <button
            onClick={onClose}
            className="flex-shrink-0 h-14 rounded-xl bg-green-100 hover:bg-green-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
            title={buttonText}
            aria-label={buttonText}
            type="button"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-200 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="font-semibold text-green-700">{buttonText}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}

