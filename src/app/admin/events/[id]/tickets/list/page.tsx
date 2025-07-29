import { EventTicketTransactionDTO, EventTicketTransactionStatisticsDTO } from '@/types';
import { FaSearch, FaTicketAlt, FaEnvelope, FaUser, FaHashtag, FaCalendarAlt, FaChevronLeft, FaChevronRight, FaUsers, FaPhotoVideo, FaTags, FaPercent } from 'react-icons/fa';
import Link from 'next/link';
import React, { useState, useRef } from 'react';
import { Pagination } from '@/components/Pagination';
import TicketPaginationClient from './TicketPaginationClient';
import ReactDOM from 'react-dom';
import TicketTableClient from './TicketTableClient';

interface SearchParams {
  page?: string;
  pageSize?: string;
  email?: string;
  transactionId?: string;
  name?: string;
}

const PAGE_SIZE = 10;

function buildQueryString(query: Record<string, any>) {
  const params = new URLSearchParams();
  for (const key in query) {
    const value = query[key];
    if (Array.isArray(value)) {
      value.forEach(v => params.append(key, v));
    } else if (typeof value !== 'undefined' && value !== null && value !== '') {
      params.append(key, value);
    }
  }
  return params.toString();
}

async function fetchTickets(eventId: string, searchParams: SearchParams) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  // Use 0-based page for API
  const page = Math.max(0, parseInt(searchParams.page || '0', 10));
  const pageSize = parseInt(searchParams.pageSize || PAGE_SIZE.toString(), 10);
  const query: Record<string, any> = {
    'eventId.equals': eventId,
    _sort: 'purchaseDate,desc',
    page,
    size: pageSize,
  };
  if (searchParams.email) query['email.contains'] = searchParams.email;
  if (searchParams.transactionId) query['id.equals'] = searchParams.transactionId;
  if (searchParams.name) query['firstName.contains'] = searchParams.name;
  const qs = buildQueryString(query);
  const res = await fetch(`${baseUrl}/api/proxy/event-ticket-transactions?${qs}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch tickets');
  const rows = await res.json();
  // Read total count from x-total-count header
  const totalCount = parseInt(res.headers.get('x-total-count') || '0', 10);
  return { rows, totalCount };
}

async function fetchStatistics(eventId: string): Promise<EventTicketTransactionStatisticsDTO | null> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/proxy/event-ticket-transactions/statistics/${eventId}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export default async function TicketListPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<SearchParams> }) {
  const { id: eventId } = await params;
  const sp = await searchParams;
  // Use 0-based page for API, 1-based for display
  const page = Math.max(0, parseInt(sp.page || '0', 10));
  const pageSize = parseInt(sp.pageSize || PAGE_SIZE.toString(), 10);
  const email = (sp.email || '').trim();
  const transactionId = (sp.transactionId || '').trim();
  const name = (sp.name || '').trim();

  let rows: EventTicketTransactionDTO[] = [];
  let totalCount = 0;
  let error: string | null = null;
  let statistics: EventTicketTransactionStatisticsDTO | null = null;
  try {
    const result = await fetchTickets(eventId, { page: page.toString(), pageSize: pageSize.toString(), email, transactionId, name });
    rows = Array.isArray(result.rows) ? result.rows : [];
    totalCount = result.totalCount;
    statistics = await fetchStatistics(eventId);
  } catch (err: any) {
    error = err.message || 'Failed to load tickets';
  }

  // Fix: If there are rows but totalCount is 0, set totalCount as fallback
  if (rows.length > 0 && totalCount === 0) {
    totalCount = page * pageSize + rows.length;
  }

  // Pagination math
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = page + 1; // 1-based for display
  const hasTickets = rows.length > 0;
  const startItem = hasTickets ? page * pageSize + 1 : 0;
  const endItem = hasTickets ? page * pageSize + rows.length : 0;
  const prevPage = Math.max(0, page - 1);
  const nextPage = page + 1 < totalPages ? page + 1 : page;
  const isPrevDisabled = page === 0;
  const isNextDisabled = page >= totalPages - 1 || !hasTickets || endItem >= totalCount;

  // Debug output for pagination
  console.log('Pagination debug:', { totalCount, pageSize, currentPage, page, totalPages, rowsLength: rows.length });

  // Pagination math for controls
  const hasPrevPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;
  const startItemControl = totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endItemControl = (currentPage - 1) * pageSize + rows.length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Responsive Button Group */}
      <div className="w-full overflow-x-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mb-6 justify-items-center mx-auto max-w-6xl">
          <Link href="/admin/manage-usage" className="w-full max-w-xs flex flex-col items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg shadow-sm hover:shadow-md p-3 sm:p-4 text-xs sm:text-sm transition-all duration-200">
            <FaUsers className="text-lg sm:text-xl mb-2" />
            <span className="font-semibold text-center leading-tight">Manage Usage<br />[Users]</span>
          </Link>
          <Link href={`/admin/events/${eventId}/media/list`} className="w-full max-w-xs flex flex-col items-center justify-center bg-yellow-50 hover:bg-yellow-100 text-yellow-800 rounded-lg shadow-sm hover:shadow-md p-3 sm:p-4 text-xs sm:text-sm transition-all duration-200">
            <FaPhotoVideo className="text-lg sm:text-xl mb-2" />
            <span className="font-semibold text-center leading-tight">Manage Media Files</span>
          </Link>
          <Link href="/admin" className="w-full max-w-xs flex flex-col items-center justify-center bg-green-50 hover:bg-green-100 text-green-800 rounded-lg shadow-sm hover:shadow-md p-3 sm:p-4 text-xs sm:text-sm transition-all duration-200">
            <FaCalendarAlt className="text-lg sm:text-xl mb-2" />
            <span className="font-semibold text-center leading-tight">Manage Events</span>
          </Link>
          <Link href={`/admin/events/${eventId}/ticket-types/list`} className="w-full max-w-xs flex flex-col items-center justify-center bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-lg shadow-sm hover:shadow-md p-3 sm:p-4 text-xs sm:text-sm transition-all duration-200">
            <FaTags className="text-lg sm:text-xl mb-2" />
            <span className="font-semibold text-center leading-tight">Manage Ticket Types</span>
          </Link>
          <Link href={`/admin/events/${eventId}/tickets/list`} className="w-full max-w-xs flex flex-col items-center justify-center bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg shadow-sm hover:shadow-md p-3 sm:p-4 text-xs sm:text-sm transition-all duration-200">
            <FaTicketAlt className="text-lg sm:text-xl mb-2" />
            <span className="font-semibold text-center leading-tight">Manage Tickets</span>
          </Link>
          <Link href={`/admin/events/${eventId}/discount-codes/list`} className="w-full max-w-xs flex flex-col items-center justify-center bg-pink-50 hover:bg-pink-100 text-pink-800 rounded-lg shadow-sm hover:shadow-md p-3 sm:p-4 text-xs sm:text-sm transition-all duration-200">
            <FaPercent className="text-lg sm:text-xl mb-2" />
            <span className="font-semibold text-center leading-tight">Manage Discount Codes</span>
          </Link>
        </div>
      </div>
      {/* Statistics Dashboard */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-teal-100 to-blue-100 rounded-lg shadow flex flex-wrap gap-6 p-4 items-center justify-between">
          <div className="flex flex-col items-center min-w-[120px]">
            <span className="text-xs text-gray-500">Total Tickets Sold</span>
            <span className="text-2xl font-bold text-teal-700">{statistics ? statistics.totalTicketsSold : '--'}</span>
          </div>
          <div className="flex flex-col items-center min-w-[120px]">
            <span className="text-xs text-gray-500">Total Amount</span>
            <span className="text-2xl font-bold text-blue-700">{statistics ? `$${statistics.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '--'}</span>
          </div>
          <div className="flex flex-col items-center min-w-[120px]">
            <span className="text-xs text-gray-500">By Status</span>
            {statistics ? (
              <div className="flex flex-col gap-1 text-sm mt-1">
                {Object.entries(statistics.ticketsByStatus).map(([status, count]) => (
                  <span key={status} className="text-gray-700">{status}: <span className="font-semibold">{count}</span> ({statistics.amountByStatus[status] !== undefined ? `$${statistics.amountByStatus[status].toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '--'})</span>
                ))}
              </div>
            ) : (
              <span className="text-gray-400">--</span>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaTicketAlt className="text-teal-500" /> Tickets Sold
        </h1>
        <form className="flex flex-wrap gap-2 items-center bg-white rounded-lg shadow px-4 py-2" method="get">
          <div className="flex items-center gap-1">
            <FaEnvelope className="text-gray-400" />
            <input name="email" placeholder="Search by email" defaultValue={email} className="border rounded px-2 py-1 text-sm" />
          </div>
          <div className="flex items-center gap-1">
            <FaHashtag className="text-gray-400" />
            <input name="transactionId" placeholder="Transaction ID" defaultValue={transactionId} className="border rounded px-2 py-1 text-sm" />
          </div>
          <div className="flex items-center gap-1">
            <FaUser className="text-gray-400" />
            <input name="name" placeholder="Name" defaultValue={name} className="border rounded px-2 py-1 text-sm" />
          </div>
          <button type="submit" className="ml-2 bg-teal-600 hover:bg-teal-700 text-white px-3 py-1 rounded flex items-center gap-1 text-sm">
            <FaSearch /> Search
          </button>
        </form>
      </div>
      <div className="bg-white rounded-lg shadow p-4 overflow-x-auto">
        {error && <div className="text-red-500 font-semibold mb-4">{error}</div>}
        <div className="text-xs text-gray-500 mb-2">Hover over the <b>ID</b> or <b>Name</b> columns to see full ticket details.</div>
        <table className="min-w-full divide-y divide-gray-300 border border-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 border-b border-r border-gray-300">ID</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 border-b border-r border-gray-300">Name</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 border-b border-r border-gray-300">Email</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 border-b border-r border-gray-300">Quantity</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 border-b border-r border-gray-300">Total</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 border-b border-r border-gray-300">Purchase Date</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 border-b border-gray-300">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-300 bg-white">
            <TicketTableClient rows={rows} />
          </tbody>
        </table>
        {/* Pagination Controls */}
        <div className="mt-8">
          <div className="flex justify-between items-center">
            <Link
              href={`?${buildQueryString({ ...sp, page: page - 1 })}`}
              className={`px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors${!hasPrevPage ? ' pointer-events-none opacity-50' : ''}`}
              aria-disabled={!hasPrevPage}
              tabIndex={!hasPrevPage ? -1 : 0}
            >
              <FaChevronLeft /> Previous
            </Link>
            <div className="text-sm font-semibold text-gray-700">
              Page {currentPage} of {totalPages}
            </div>
            <Link
              href={`?${buildQueryString({ ...sp, page: page + 1 })}`}
              className={`px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors${!hasNextPage ? ' pointer-events-none opacity-50' : ''}`}
              aria-disabled={!hasNextPage}
              tabIndex={!hasNextPage ? -1 : 0}
            >
              Next <FaChevronRight />
            </Link>
          </div>
          <div className="text-center text-sm text-gray-600 mt-2">
            Showing <span className="font-medium">{rows.length > 0 ? startItemControl : 0}</span> to <span className="font-medium">{rows.length > 0 ? endItemControl : 0}</span> of <span className="font-medium">{totalCount}</span> tickets
          </div>
        </div>
      </div>
    </div>
  );
}