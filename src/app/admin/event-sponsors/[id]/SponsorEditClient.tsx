'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaSpinner } from 'react-icons/fa';
import AdminNavigation from '@/components/AdminNavigation';
import SponsorImageUploadDialog from '@/components/sponsors/SponsorImageUploadDialog';
import SponsorMediaGallery from '@/components/sponsors/SponsorMediaGallery';
import SponsorImageUploadArea from '@/components/sponsors/SponsorImageUploadArea';
import type { EventSponsorsDTO, EventMediaDTO } from '@/types';
import { updateEventSponsorServer, fetchSponsorMediaServer } from '../ApiServerActions';
import PaginatedMediaList from './PaginatedMediaList';
import { useAdminTenantId } from '../../AdminTenantContext';

interface SponsorEditClientProps {
  sponsor: EventSponsorsDTO;
  initialMediaList: EventMediaDTO[];
  totalMediaCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
}

export default function SponsorEditClient({
  sponsor: initialSponsor,
  initialMediaList,
  totalMediaCount,
  currentPage,
  pageSize,
  totalPages,
}: SponsorEditClientProps) {
  const router = useRouter();
  const [sponsor, setSponsor] = useState<EventSponsorsDTO>(initialSponsor);
  const [formData, setFormData] = useState<Partial<EventSponsorsDTO>>(initialSponsor);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Upload dialog states (kept for backward compatibility, but not used in new UI)
  const [logoUploadOpen, setLogoUploadOpen] = useState(false);
  const [heroUploadOpen, setHeroUploadOpen] = useState(false);
  const [bannerUploadOpen, setBannerUploadOpen] = useState(false);

  // Media refresh state
  const [mediaRefreshKey, setMediaRefreshKey] = useState(0);

  React.useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sponsor.id) return;

    try {
      setLoading(true);
      const updatedSponsor = await updateEventSponsorServer(sponsor.id, formData, tenantId);
      setSponsor(updatedSponsor);
      setToastMessage({ type: 'success', message: 'Sponsor updated successfully' });

      // Refresh media list after update in case URLs changed
      setMediaRefreshKey(prev => prev + 1);
    } catch (err: any) {
      setToastMessage({ type: 'error', message: err.message || 'Failed to update sponsor' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUploadSuccess = (imageUrl: string, imageType: 'logo' | 'hero' | 'banner') => {
    // Update sponsor with new image URL
    const urlField = imageType === 'logo' ? 'logoUrl' : imageType === 'hero' ? 'heroImageUrl' : 'bannerImageUrl';
    const updatedSponsor = { ...sponsor, [urlField]: imageUrl };
    setSponsor(updatedSponsor);
    setFormData({ ...formData, [urlField]: imageUrl });
    setToastMessage({ type: 'success', message: `${imageType.charAt(0).toUpperCase() + imageType.slice(1)} image uploaded successfully` });

    // Refresh media list
    setMediaRefreshKey(prev => prev + 1);

    // Dialog will be closed by the component itself
  };

  const sponsorTypes = [
    'Platinum',
    'Gold',
    'Silver',
    'Bronze',
    'Community Partner',
    'Media Partner',
    'Food & Beverage',
    'Entertainment',
    'Other'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ paddingTop: '180px' }}>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/admin/event-sponsors')}
            className="flex items-center space-x-2 text-foreground hover:text-primary reverent-transition"
          >
            <FaArrowLeft className="h-4 w-4" />
            <span>Back to Sponsors</span>
          </button>
        </div>
      </div>

      <h1 className="font-heading font-semibold text-3xl text-foreground mb-2">Edit Sponsor</h1>
      <p className="font-body text-muted-foreground mb-8">
        {sponsor.name || 'Sponsor Details'}
      </p>

      <AdminNavigation currentPage="event-sponsors" />

      {/* Toast Message */}
      {toastMessage && (
        <div className={`mb-4 p-4 rounded-lg sacred-shadow ${
          toastMessage.type === 'success'
            ? 'bg-success/10 border border-success/20 text-success-foreground'
            : 'bg-destructive/10 border border-destructive/20 text-destructive-foreground'
        }`}>
          {toastMessage.message}
        </div>
      )}

      {/* Edit Form */}
      <div className="bg-card rounded-lg sacred-shadow p-6 mb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Sponsor Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                required
                className="w-full border border-border rounded-lg px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-ring reverent-transition"
                placeholder="Enter sponsor name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Type *
              </label>
              <select
                name="type"
                value={formData.type || ''}
                onChange={handleChange}
                required
                className="w-full border border-border rounded-lg px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-ring reverent-transition"
              >
                <option value="">Select sponsor type</option>
                {sponsorTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Company Name
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName || ''}
                onChange={handleChange}
                className="w-full border border-border rounded-lg px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-ring reverent-transition"
                placeholder="Enter company name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Priority Ranking *
              </label>
              <input
                type="number"
                name="priorityRanking"
                value={formData.priorityRanking || 1}
                onChange={handleChange}
                min="1"
                required
                className="w-full border border-border rounded-lg px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-ring reverent-transition"
                placeholder="Enter priority ranking (1 = highest priority)"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Lower numbers indicate higher priority (1 = highest priority)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Contact Email
              </label>
              <input
                type="email"
                name="contactEmail"
                value={formData.contactEmail || ''}
                onChange={handleChange}
                className="w-full border border-border rounded-lg px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-ring reverent-transition"
                placeholder="Enter contact email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Contact Phone
              </label>
              <input
                type="tel"
                name="contactPhone"
                value={formData.contactPhone || ''}
                onChange={handleChange}
                className="w-full border border-border rounded-lg px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-ring reverent-transition"
                placeholder="Enter contact phone"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Website URL
              </label>
              <input
                type="url"
                name="websiteUrl"
                value={formData.websiteUrl || ''}
                onChange={handleChange}
                className="w-full border border-border rounded-lg px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-ring reverent-transition"
                placeholder="https://example.com"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive || false}
                onChange={handleChange}
                className="h-4 w-4 text-primary focus:ring-ring border-border rounded"
              />
              <label className="ml-2 block text-sm text-foreground">
                Active Sponsor
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Tagline
            </label>
            <input
              type="text"
              name="tagline"
              value={formData.tagline || ''}
              onChange={handleChange}
              maxLength={500}
              className="w-full border border-border rounded-lg px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-ring reverent-transition"
              placeholder="Enter sponsor tagline (max 500 characters)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              rows={4}
              className="w-full border border-border rounded-lg px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-ring reverent-transition"
              placeholder="Enter detailed description about the sponsor"
            />
          </div>

          {/* Social Media Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Facebook URL
              </label>
              <input
                type="url"
                name="facebookUrl"
                value={formData.facebookUrl || ''}
                onChange={handleChange}
                className="w-full border border-border rounded-lg px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-ring reverent-transition"
                placeholder="https://facebook.com/sponsor"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Twitter URL
              </label>
              <input
                type="url"
                name="twitterUrl"
                value={formData.twitterUrl || ''}
                onChange={handleChange}
                className="w-full border border-border rounded-lg px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-ring reverent-transition"
                placeholder="https://twitter.com/sponsor"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                LinkedIn URL
              </label>
              <input
                type="url"
                name="linkedinUrl"
                value={formData.linkedinUrl || ''}
                onChange={handleChange}
                className="w-full border border-border rounded-lg px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-ring reverent-transition"
                placeholder="https://linkedin.com/company/sponsor"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Instagram URL
              </label>
              <input
                type="url"
                name="instagramUrl"
                value={formData.instagramUrl || ''}
                onChange={handleChange}
                className="w-full border border-border rounded-lg px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-ring reverent-transition"
                placeholder="https://instagram.com/sponsor"
              />
            </div>
          </div>

          {/* Image Upload Section with Drag-and-Drop */}
          <div className="border-t border-border pt-6">
            <h3 className="text-lg font-heading font-medium text-foreground mb-4">Images</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Upload multiple images per type. Drag and drop images directly or click to browse. All images will appear in the Overview section below.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <SponsorImageUploadArea
                sponsorId={sponsor.id!}
                imageType="logo"
                currentImageUrl={sponsor.logoUrl}
                onUploadSuccess={(imageUrl) => handleImageUploadSuccess(imageUrl, 'logo')}
                disabled={loading || !sponsor.id}
              />
              <SponsorImageUploadArea
                sponsorId={sponsor.id!}
                imageType="hero"
                currentImageUrl={sponsor.heroImageUrl}
                onUploadSuccess={(imageUrl) => handleImageUploadSuccess(imageUrl, 'hero')}
                disabled={loading || !sponsor.id}
              />
              <SponsorImageUploadArea
                sponsorId={sponsor.id!}
                imageType="banner"
                currentImageUrl={sponsor.bannerImageUrl}
                onUploadSuccess={(imageUrl) => handleImageUploadSuccess(imageUrl, 'banner')}
                disabled={loading || !sponsor.id}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => router.push('/admin/event-sponsors')}
              className="px-4 py-2 text-sm font-medium text-foreground bg-card border border-border rounded-md hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring reverent-transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary border border-transparent rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring reverent-transition disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center space-x-2">
                  <FaSpinner className="animate-spin h-4 w-4" />
                  <span>Saving...</span>
                </span>
              ) : (
                'Update Sponsor'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Overview Section with Paginated Media Files */}
      <div className="bg-card rounded-lg sacred-shadow p-6">
        <h2 className="font-heading font-semibold text-2xl text-foreground mb-4">Overview</h2>
        <p className="font-body text-muted-foreground mb-6">
          Media files associated with this sponsor. Files are sorted by priority ranking (lower = higher priority).
        </p>

        <PaginatedMediaList
          sponsorId={sponsor.id!}
          initialMediaList={initialMediaList}
          totalCount={totalMediaCount}
          currentPage={currentPage}
          pageSize={pageSize}
          totalPages={totalPages}
          refreshKey={mediaRefreshKey}
        />
      </div>

      {/* Image Upload Dialogs */}
      {sponsor.id && (
        <>
          <SponsorImageUploadDialog
            sponsor={sponsor}
            imageType="logo"
            isOpen={logoUploadOpen}
            onClose={() => setLogoUploadOpen(false)}
            onUploadSuccess={(imageUrl) => handleImageUploadSuccess(imageUrl, 'logo')}
            eventId={0} // Use 0 for main sponsor page
          />
          <SponsorImageUploadDialog
            sponsor={sponsor}
            imageType="hero"
            isOpen={heroUploadOpen}
            onClose={() => setHeroUploadOpen(false)}
            onUploadSuccess={(imageUrl) => handleImageUploadSuccess(imageUrl, 'hero')}
            eventId={0} // Use 0 for main sponsor page
          />
          <SponsorImageUploadDialog
            sponsor={sponsor}
            imageType="banner"
            isOpen={bannerUploadOpen}
            onClose={() => setBannerUploadOpen(false)}
            onUploadSuccess={(imageUrl) => handleImageUploadSuccess(imageUrl, 'banner')}
            eventId={0} // Use 0 for main sponsor page
          />
        </>
      )}
    </div>
  );
}

