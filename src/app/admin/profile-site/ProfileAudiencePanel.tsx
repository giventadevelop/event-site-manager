'use client';

import React, { useCallback, useEffect, useState } from 'react';
import type {
  ProfileAudienceContactDTO,
  ProfileAudienceContactOptInStatus,
  ProfileAudienceContactSource,
} from '@/types/profileSite';
import {
  fetchProfileAudienceContactsServer,
  createProfileAudienceContactServer,
  updateProfileAudienceContactServer,
  deleteProfileAudienceContactServer,
  bulkImportProfileAudienceServer,
  sendToProfileAudienceServer,
} from './ApiServerActions';

const SOURCE_LABELS: Record<ProfileAudienceContactSource, string> = {
  SUBSCRIBE_FORM: 'Subscribe',
  CONTACT_FORM: 'Contact',
  CSV_IMPORT: 'CSV',
  GATED_DOWNLOAD: 'Download',
  ADMIN_MANUAL: 'Manual',
};

interface Props {
  tenantId: string;
  setMessage: (msg: string) => void;
}

export default function ProfileAudiencePanel({ tenantId, setMessage }: Props) {
  const [contacts, setContacts] = useState<ProfileAudienceContactDTO[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [saving, setSaving] = useState(false);
  const [templateId, setTemplateId] = useState('');
  const [form, setForm] = useState<Partial<ProfileAudienceContactDTO> | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { contacts: rows, totalCount: total } = await fetchProfileAudienceContactsServer(tenantId, {
      emailContains: search || undefined,
      page,
      size: 20,
    });
    setContacts(rows);
    setTotalCount(total);
    setLoading(false);
  }, [tenantId, search, page]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSaveContact() {
    if (!form?.email?.trim()) {
      setMessage('Email is required.');
      return;
    }
    setSaving(true);
    let ok = false;
    if (form.id) {
      const updated = await updateProfileAudienceContactServer(tenantId, form.id, form);
      ok = !!updated;
    } else {
      const created = await createProfileAudienceContactServer(tenantId, {
        email: form.email.trim(),
        firstName: form.firstName ?? '',
        lastName: form.lastName ?? '',
        notes: form.notes ?? '',
        publicProfileId: form.publicProfileId ?? 0,
        source: 'ADMIN_MANUAL',
        optInStatus: (form.optInStatus as ProfileAudienceContactOptInStatus) ?? 'OPTED_IN',
      });
      ok = !!created;
    }
    setSaving(false);
    if (ok) {
      setForm(null);
      setMessage('Contact saved.');
      await load();
    } else {
      setMessage('Failed to save contact.');
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this contact?')) return;
    const ok = await deleteProfileAudienceContactServer(id);
    setMessage(ok ? 'Contact deleted.' : 'Failed to delete contact.');
    if (ok) await load();
  }

  async function handleCsvImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter((l) => l.trim());
    const rows = lines.slice(lines[0]?.toLowerCase().includes('email') ? 1 : 0);
    const parsed = rows.map((line) => {
      const [email, firstName = '', lastName = '', notes = ''] = line.split(',').map((s) => s.trim());
      return { email, firstName, lastName, notes, optInStatus: 'OPTED_IN' as const };
    });
    setSaving(true);
    const result = await bulkImportProfileAudienceServer(tenantId, parsed);
    setSaving(false);
    e.target.value = '';
    if (result) {
      setMessage(
        `Import: ${result.createdCount} created, ${result.updatedCount} updated, ${result.skippedCount} skipped.`
      );
      await load();
    } else {
      setMessage('CSV import failed.');
    }
  }

  async function handleSend() {
    const id = parseInt(templateId, 10);
    if (!id || Number.isNaN(id)) {
      setMessage('Enter a valid promotion email template ID.');
      return;
    }
    setSaving(true);
    const result = await sendToProfileAudienceServer(id);
    setSaving(false);
    setMessage(result.success ? 'Send to profile audience started.' : `Send failed: ${result.message ?? ''}`);
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / 20));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Profile audience</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Contacts for tenant <code>{tenantId}</code>. Separate from member email subscriptions.
      </p>
      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Search email…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          className="border border-gray-400 rounded-lg px-3 py-2 text-sm flex-1 min-w-[200px]"
        />
        <button type="button" onClick={() => setForm({ email: '', optInStatus: 'OPTED_IN' })} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold">
          Add contact
        </button>
        <label className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-semibold cursor-pointer">
          Import CSV
          <input type="file" accept=".csv" className="hidden" onChange={handleCsvImport} disabled={saving} />
        </label>
      </div>
      {loading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : contacts.length === 0 ? (
        <p className="text-sm text-gray-500">No contacts.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-2 pr-3">Email</th>
                <th className="py-2 pr-3">Name</th>
                <th className="py-2 pr-3">Source</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr key={c.id} className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-2 pr-3">{c.email}</td>
                  <td className="py-2 pr-3">{[c.firstName, c.lastName].filter(Boolean).join(' ') || '—'}</td>
                  <td className="py-2 pr-3">{SOURCE_LABELS[c.source] ?? c.source}</td>
                  <td className="py-2 pr-3">{c.optInStatus}</td>
                  <td className="py-2 space-x-2">
                    <button type="button" onClick={() => setForm(c)} className="text-blue-600 text-xs">Edit</button>
                    {c.id != null && (
                      <button type="button" onClick={() => handleDelete(c.id!)} className="text-red-600 text-xs">Delete</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {totalPages > 1 && (
        <div className="flex justify-between text-sm">
          <button type="button" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Previous</button>
          <span>Page {page + 1} of {totalPages}</span>
          <button type="button" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      )}
      <div className="border-t pt-4 flex flex-wrap gap-3 items-end">
        <label className="block">
          <span className="text-xs font-medium">Newsletter template ID</span>
          <input type="number" value={templateId} onChange={(e) => setTemplateId(e.target.value)} className="mt-1 block border rounded-lg px-3 py-2 w-32" />
        </label>
        <button type="button" onClick={handleSend} disabled={saving} className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold disabled:opacity-50">
          Send to audience
        </button>
      </div>
      {form && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full space-y-3">
            <h3 className="font-semibold">{form.id ? 'Edit' : 'Add'} contact</h3>
            <input type="email" placeholder="Email" value={form.email ?? ''} onChange={(e) => setForm((f) => ({ ...f!, email: e.target.value }))} className="w-full border rounded-lg px-3 py-2" />
            <input type="text" placeholder="First name" value={form.firstName ?? ''} onChange={(e) => setForm((f) => ({ ...f!, firstName: e.target.value }))} className="w-full border rounded-lg px-3 py-2" />
            <input type="text" placeholder="Last name" value={form.lastName ?? ''} onChange={(e) => setForm((f) => ({ ...f!, lastName: e.target.value }))} className="w-full border rounded-lg px-3 py-2" />
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setForm(null)}>Cancel</button>
              <button type="button" onClick={handleSaveContact} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
