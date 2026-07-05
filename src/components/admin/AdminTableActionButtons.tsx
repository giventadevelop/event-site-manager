'use client';

import Link from 'next/link';

interface AdminTableActionButtonsProps {
  viewHref?: string;
  editHref?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  viewTitle?: string;
  editTitle?: string;
  deleteTitle?: string;
  compact?: boolean;
}

export default function AdminTableActionButtons({
  viewHref,
  editHref,
  onEdit,
  onDelete,
  viewTitle = 'View details',
  editTitle = 'Edit',
  deleteTitle = 'Delete',
  compact = true,
}: AdminTableActionButtonsProps) {
  const size = compact ? 'w-10 h-10' : 'w-14 h-14';
  const iconSize = compact ? 'w-5 h-5' : 'w-10 h-10';

  return (
    <div className="flex flex-wrap items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
      {viewHref && (
        <Link
          href={viewHref}
          className={`flex-shrink-0 ${size} rounded-xl bg-green-100 hover:bg-green-200 flex items-center justify-center transition-all duration-300 hover:scale-110`}
          title={viewTitle}
          aria-label={viewTitle}
        >
          <svg className={`${iconSize} text-green-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </Link>
      )}
      {editHref && (
        <Link
          href={editHref}
          className={`flex-shrink-0 ${size} rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-all duration-300 hover:scale-110`}
          title={editTitle}
          aria-label={editTitle}
        >
          <svg className={`${iconSize} text-blue-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </Link>
      )}
      {onEdit && !editHref && (
        <button
          type="button"
          onClick={onEdit}
          className={`flex-shrink-0 ${size} rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-all duration-300 hover:scale-110`}
          title={editTitle}
          aria-label={editTitle}
        >
          <svg className={`${iconSize} text-blue-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      )}
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className={`flex-shrink-0 ${size} rounded-xl bg-red-100 hover:bg-red-200 flex items-center justify-center transition-all duration-300 hover:scale-110`}
          title={deleteTitle}
          aria-label={deleteTitle}
        >
          <svg className={`${iconSize} text-red-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
    </div>
  );
}
