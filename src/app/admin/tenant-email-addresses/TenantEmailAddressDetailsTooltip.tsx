'use client';

import { createPortal } from 'react-dom';
import type { CSSProperties } from 'react';
import { FaTimes } from 'react-icons/fa';
import type { TenantEmailAddressDTO } from '@/types';

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '(empty)';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
}

interface TenantEmailAddressDetailsTooltipProps {
  item: TenantEmailAddressDTO;
  anchorRect: DOMRect | null;
  onClose: () => void;
  onTooltipMouseEnter: () => void;
  onTooltipMouseLeave: () => void;
}

export default function TenantEmailAddressDetailsTooltip({
  item,
  anchorRect,
  onClose,
  onTooltipMouseEnter,
  onTooltipMouseLeave,
}: TenantEmailAddressDetailsTooltipProps) {
  if (!anchorRect || typeof document === 'undefined') return null;

  const tooltipWidth = 450;
  const spacing = 12;
  let top = anchorRect.top;
  let left = anchorRect.right + spacing;

  const estimatedHeight = 320;
  if (top + estimatedHeight > window.innerHeight) {
    top = Math.max(spacing, window.innerHeight - estimatedHeight - spacing);
  }
  if (top < spacing) top = spacing;
  if (left + tooltipWidth > window.innerWidth - spacing) {
    left = Math.max(spacing, anchorRect.left - tooltipWidth - spacing);
  }

  const rows: { label: string; value: unknown }[] = [
    { label: 'ID', value: item.id },
    { label: 'Tenant ID', value: item.tenantId },
    { label: 'Type', value: item.emailType },
    { label: 'From Email', value: item.emailAddress },
    { label: 'Copy-To', value: item.copyToEmailAddress },
    { label: 'Reply-To', value: item.replyToEmailAddress },
    { label: 'Display Name', value: item.displayName },
    { label: 'Active', value: item.isActive },
    { label: 'Default', value: item.isDefault },
    { label: 'Description', value: item.description },
    { label: 'Created At', value: item.createdAt },
    { label: 'Updated At', value: item.updatedAt },
  ];

  const style: CSSProperties = {
    position: 'fixed',
    top: `${top}px`,
    left: `${left}px`,
    zIndex: 9999,
    background: 'white',
    border: '1px solid #cbd5e1',
    borderRadius: 8,
    boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
    padding: 16,
    width: `${tooltipWidth}px`,
    fontSize: 14,
    maxHeight: 400,
    overflowY: 'auto',
  };

  return createPortal(
    <div
      style={style}
      tabIndex={-1}
      className="admin-tooltip"
      onMouseEnter={onTooltipMouseEnter}
      onMouseLeave={onTooltipMouseLeave}
      role="dialog"
      aria-label={`Email address details for ${item.emailType}`}
    >
      <div className="sticky top-0 right-0 z-10 bg-white flex justify-end mb-2">
        <button
          type="button"
          onClick={onClose}
          className="w-10 h-10 text-2xl bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all"
          aria-label="Close tooltip"
          title="Close"
        >
          <FaTimes />
        </button>
      </div>
      <p className="text-sm font-semibold text-gray-900 mb-3">
        {item.emailType} — {item.emailAddress}
      </p>
      <table className="admin-tooltip-table">
        <tbody>
          {rows.map(({ label, value }) => (
            <tr key={label}>
              <th>{label}</th>
              <td>{formatValue(value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>,
    document.body
  );
}
