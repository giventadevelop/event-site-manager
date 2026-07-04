'use client';

import React, { useEffect, useState, useTransition } from 'react';
import AdminNavigation from '@/components/AdminNavigation';
import { useAdminTenantId } from '../AdminTenantContext';
import TenantSiteTypePicker from '../TenantSiteTypePicker';
import type { PublicProfileDTO } from '@/types/profileSite';
import {
  fetchPublicProfileServer,
  upsertPublicProfileServer,
  fetchProfileCollectionServer,
  createProfileItemServer,
  updateProfileItemServer,
  deleteProfileItemServer,
  type ProfileCollectionPath,
} from './ApiServerActions';

/* ------------------------------------------------------------------------ */
/* Config-driven collection sections                                         */
/* ------------------------------------------------------------------------ */

interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'date' | 'number' | 'checkbox' | 'select' | 'textarea';
  options?: string[];
  required?: boolean;
}

interface CollectionConfig {
  key: string;
  title: string;
  path: ProfileCollectionPath;
  columns: { name: string; label: string }[];
  fields: FieldConfig[];
}

const COLLECTIONS: CollectionConfig[] = [
  {
    key: 'writings',
    title: 'Writings / Portfolio',
    path: '/api/profile-writings',
    columns: [
      { name: 'title', label: 'Title' },
      { name: 'writingType', label: 'Type' },
      { name: 'publicationName', label: 'Publication' },
      { name: 'status', label: 'Status' },
      { name: 'displayOrder', label: 'Order' },
    ],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'writingType', label: 'Type', type: 'select', options: ['ORIGINAL', 'REPUBLISHED', 'EXTERNAL_LINK'] },
      { name: 'externalUrl', label: 'External URL', type: 'text' },
      { name: 'publicationName', label: 'Publication', type: 'text' },
      { name: 'excerpt', label: 'Excerpt', type: 'textarea' },
      { name: 'publishedAt', label: 'Published', type: 'date' },
      { name: 'status', label: 'Status', type: 'select', options: ['DRAFT', 'PUBLISHED', 'ARCHIVED'] },
      { name: 'displayOrder', label: 'Display order', type: 'number' },
    ],
  },
  {
    key: 'achievements',
    title: 'Achievements',
    path: '/api/profile-achievements',
    columns: [
      { name: 'title', label: 'Title' },
      { name: 'category', label: 'Category' },
      { name: 'issuer', label: 'Issuer' },
      { name: 'achievementDate', label: 'Date' },
      { name: 'displayOrder', label: 'Order' },
    ],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'category', label: 'Category', type: 'select', options: ['AWARD', 'HONOR', 'SPEAKING', 'EDUCATION', 'OTHER'] },
      { name: 'issuer', label: 'Issuer', type: 'text' },
      { name: 'achievementDate', label: 'Date', type: 'date' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'url', label: 'URL', type: 'text' },
      { name: 'displayOrder', label: 'Display order', type: 'number' },
      { name: 'isFeatured', label: 'Featured', type: 'checkbox' },
    ],
  },
  {
    key: 'affiliations',
    title: 'Affiliations',
    path: '/api/profile-affiliations',
    columns: [
      { name: 'organizationName', label: 'Organization' },
      { name: 'role', label: 'Role' },
      { name: 'startDate', label: 'From' },
      { name: 'endDate', label: 'To' },
      { name: 'displayOrder', label: 'Order' },
    ],
    fields: [
      { name: 'organizationName', label: 'Organization', type: 'text', required: true },
      { name: 'role', label: 'Role', type: 'text' },
      { name: 'startDate', label: 'Start date', type: 'date' },
      { name: 'endDate', label: 'End date', type: 'date' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'url', label: 'URL', type: 'text' },
      { name: 'displayOrder', label: 'Display order', type: 'number' },
    ],
  },
  {
    key: 'media',
    title: 'Media Downloads',
    path: '/api/profile-media-assets',
    columns: [
      { name: 'title', label: 'Title' },
      { name: 'fileType', label: 'File type' },
      { name: 'isDownloadable', label: 'Downloadable' },
      { name: 'displayOrder', label: 'Order' },
    ],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'fileUrl', label: 'File URL', type: 'text', required: true },
      { name: 'fileType', label: 'File type', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'displayOrder', label: 'Display order', type: 'number' },
      { name: 'isDownloadable', label: 'Downloadable', type: 'checkbox' },
      { name: 'requiresEmail', label: 'Requires email', type: 'checkbox' },
    ],
  },
];

type ItemRecord = Record<string, unknown> & { id?: number | null };

const inputClass =
  'mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-2 text-sm';

function CollectionSection({ config, tenantId }: { config: CollectionConfig; tenantId: string }) {
  const [items, setItems] = useState<ItemRecord[]>([]);
  const [form, setForm] = useState<ItemRecord | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    fetchProfileCollectionServer<ItemRecord>(config.path, tenantId).then((list) => {
      if (!cancelled) setItems(list);
    });
    return () => {
      cancelled = true;
    };
  }, [config.path, tenantId]);

  const reload = async () =>
    setItems(await fetchProfileCollectionServer<ItemRecord>(config.path, tenantId));

  const startCreate = () => {
    const initial: ItemRecord = {};
    for (const f of config.fields) {
      if (f.type === 'checkbox') initial[f.name] = false;
      else if (f.type === 'select' && f.options?.length) initial[f.name] = f.options[0];
      else initial[f.name] = '';
    }
    setForm(initial);
    setEditingId(null);
    setError('');
  };

  const startEdit = (item: ItemRecord) => {
    setForm({ ...item });
    setEditingId((item.id as number) ?? null);
    setError('');
  };

  const submit = () => {
    if (!form) return;
    for (const f of config.fields) {
      if (f.required && !String(form[f.name] ?? '').trim()) {
        setError(`${f.label} is required`);
        return;
      }
    }
    setError('');
    // Strip empty strings so optional date/number fields don't fail backend validation
    const payload: ItemRecord = {};
    for (const f of config.fields) {
      const v = form[f.name];
      if (v === '' || v == null) continue;
      payload[f.name] = f.type === 'number' ? Number(v) : v;
    }
    startTransition(async () => {
      const result = editingId
        ? await updateProfileItemServer(config.path, editingId, tenantId, payload)
        : await createProfileItemServer(config.path, tenantId, payload);
      if (!result) {
        setError('Save failed');
        return;
      }
      await reload();
      setForm(null);
    });
  };

  const remove = (item: ItemRecord) => {
    if (item.id == null) return;
    if (!window.confirm(`Delete this ${config.title.toLowerCase()} entry?`)) return;
    const id = item.id as number;
    startTransition(async () => {
      const ok = await deleteProfileItemServer(config.path, id);
      if (ok) await reload();
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{config.title}</h2>
        <button
          type="button"
          onClick={startCreate}
          className="px-3 py-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm font-semibold"
        >
          + Add
        </button>
      </div>

      {form && (
        <div className="border border-gray-200 rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {config.fields.map((f) => (
              <div key={f.name} className={f.type === 'textarea' ? 'md:col-span-3' : ''}>
                <label className="block text-xs font-medium text-gray-600">
                  {f.label}
                  {f.required ? ' *' : ''}
                </label>
                {f.type === 'select' ? (
                  <select
                    value={String(form[f.name] ?? '')}
                    onChange={(e) => setForm((p) => (p ? { ...p, [f.name]: e.target.value } : p))}
                    className={inputClass}
                  >
                    {(f.options ?? []).map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                ) : f.type === 'checkbox' ? (
                  <input
                    type="checkbox"
                    checked={Boolean(form[f.name])}
                    onChange={(e) => setForm((p) => (p ? { ...p, [f.name]: e.target.checked } : p))}
                    className="mt-2"
                  />
                ) : f.type === 'textarea' ? (
                  <textarea
                    rows={2}
                    value={String(form[f.name] ?? '')}
                    onChange={(e) => setForm((p) => (p ? { ...p, [f.name]: e.target.value } : p))}
                    className={inputClass}
                  />
                ) : (
                  <input
                    type={f.type}
                    value={String(form[f.name] ?? '')}
                    onChange={(e) => setForm((p) => (p ? { ...p, [f.name]: e.target.value } : p))}
                    className={inputClass}
                  />
                )}
              </div>
            ))}
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setForm(null)}
              className="px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={submit}
              className="px-3 py-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm font-semibold disabled:opacity-50"
            >
              {isPending ? 'Saving…' : editingId ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {config.columns.map((c) => (
                <th
                  key={c.name}
                  className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  {c.label}
                </th>
              ))}
              <th />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.length === 0 && (
              <tr>
                <td
                  colSpan={config.columns.length + 1}
                  className="px-3 py-4 text-sm text-gray-500 text-center"
                >
                  No entries.
                </td>
              </tr>
            )}
            {items.map((item) => (
              <tr key={String(item.id)}>
                {config.columns.map((c) => (
                  <td key={c.name} className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                    {typeof item[c.name] === 'boolean'
                      ? item[c.name]
                        ? 'Yes'
                        : 'No'
                      : String(item[c.name] ?? '—')}
                  </td>
                ))}
                <td className="px-3 py-2 text-sm text-right whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => startEdit(item)}
                    className="text-blue-600 hover:text-blue-800 font-medium mr-3"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(item)}
                    className="text-red-600 hover:text-red-800 font-medium"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* Public profile form                                                       */
/* ------------------------------------------------------------------------ */

const PROFILE_FIELDS: FieldConfig[] = [
  { name: 'displayName', label: 'Display name', type: 'text', required: true },
  { name: 'tagline', label: 'Tagline', type: 'text' },
  { name: 'headline', label: 'Headline', type: 'text' },
  { name: 'publicSlug', label: 'Public slug', type: 'text' },
  { name: 'contactEmail', label: 'Contact email', type: 'text' },
  { name: 'location', label: 'Location', type: 'text' },
  { name: 'profileImageUrl', label: 'Profile image URL', type: 'text' },
  { name: 'coverImageUrl', label: 'Cover image URL', type: 'text' },
  { name: 'linkedinUrl', label: 'LinkedIn', type: 'text' },
  { name: 'twitterUrl', label: 'X / Twitter', type: 'text' },
  { name: 'facebookUrl', label: 'Facebook', type: 'text' },
  { name: 'instagramUrl', label: 'Instagram', type: 'text' },
  { name: 'youtubeUrl', label: 'YouTube', type: 'text' },
  { name: 'websiteUrl', label: 'Website', type: 'text' },
  { name: 'cvDocumentUrl', label: 'CV document URL', type: 'text' },
  { name: 'bioMarkdown', label: 'Bio (markdown)', type: 'textarea' },
  { name: 'isPublished', label: 'Published', type: 'checkbox' },
];

export default function ProfileSiteAdminPage() {
  const tenantId = useAdminTenantId();
  const [profile, setProfile] = useState<Partial<PublicProfileDTO>>({});
  const [loaded, setLoaded] = useState(false);
  const [message, setMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setMessage('');
    setLoaded(false);
    if (!tenantId) {
      setProfile({});
      return;
    }
    let cancelled = false;
    fetchPublicProfileServer(tenantId).then((p) => {
      if (!cancelled) {
        setProfile(p ?? {});
        setLoaded(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [tenantId]);

  const saveProfile = () => {
    if (!tenantId) return;
    if (!profile.displayName?.trim()) {
      setMessage('Display name is required');
      return;
    }
    startTransition(async () => {
      const result = await upsertPublicProfileServer(tenantId, {
        ...profile,
        displayName: profile.displayName as string,
      });
      setMessage(result ? 'Profile saved.' : 'Save failed.');
      if (result) setProfile(result);
    });
  };

  return (
    <div className="w-full overflow-x-hidden box-border" style={{ paddingTop: '120px' }}>
      <div className="w-full px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 mb-6 sm:mb-8">
        <AdminNavigation />
      </div>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-8 space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            Personal Profile Site
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Administer a tenant&apos;s public personal-profile site (PERSONAL_PROFILE / HYBRID site
            types): hero profile, writings, achievements, affiliations, and downloads
          </p>
        </div>

        {!tenantId && (
          <TenantSiteTypePicker
            siteTypes={['PERSONAL_PROFILE', 'HYBRID']}
            title="Personal profile tenants"
          />
        )}

        {tenantId && (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Public Profile — {tenantId}
                </h2>
                <button
                  type="button"
                  disabled={isPending || !loaded}
                  onClick={saveProfile}
                  className="px-4 py-2 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold disabled:opacity-50"
                >
                  {isPending ? 'Saving…' : 'Save Profile'}
                </button>
              </div>

              {!loaded && <p className="text-sm text-gray-500">Loading…</p>}

              {loaded && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {PROFILE_FIELDS.map((f) => (
                    <div key={f.name} className={f.type === 'textarea' ? 'md:col-span-3' : ''}>
                      <label className="block text-xs font-medium text-gray-600">
                        {f.label}
                        {f.required ? ' *' : ''}
                      </label>
                      {f.type === 'checkbox' ? (
                        <input
                          type="checkbox"
                          checked={Boolean((profile as Record<string, unknown>)[f.name])}
                          onChange={(e) =>
                            setProfile((p) => ({ ...p, [f.name]: e.target.checked }))
                          }
                          className="mt-2"
                        />
                      ) : f.type === 'textarea' ? (
                        <textarea
                          rows={4}
                          value={String((profile as Record<string, unknown>)[f.name] ?? '')}
                          onChange={(e) => setProfile((p) => ({ ...p, [f.name]: e.target.value }))}
                          className={inputClass}
                        />
                      ) : (
                        <input
                          type="text"
                          value={String((profile as Record<string, unknown>)[f.name] ?? '')}
                          onChange={(e) => setProfile((p) => ({ ...p, [f.name]: e.target.value }))}
                          className={inputClass}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {message && <p className="text-sm text-gray-700">{message}</p>}
            </div>

            {COLLECTIONS.map((c) => (
              <CollectionSection key={c.key} config={c} tenantId={tenantId} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
