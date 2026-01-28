'use client';

import { useState } from 'react';
import FocusGroupCoverImageUpload from '@/components/FocusGroupCoverImageUpload';
import FocusGroupEventSearch from './components/FocusGroupEventSearch';
import AssociatedEventsTable from './components/AssociatedEventsTable';
import type { FocusGroupDTO, EventDetailsDTO } from '@/types';

interface FocusGroupEditFormProps {
  group: FocusGroupDTO | null;
  focusGroupId: number;
  updateFocusGroup: (formData: FormData) => Promise<void>;
  initialEvents?: EventDetailsDTO[];
  initialTotalCount?: number;
}

export default function FocusGroupEditForm({
  group,
  focusGroupId,
  updateFocusGroup,
  initialEvents = [],
  initialTotalCount = 0,
}: FocusGroupEditFormProps) {
  const [coverImageUrl, setCoverImageUrl] = useState<string | undefined>(group?.coverImageUrl);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleImageUploaded = (imageUrl: string) => {
    setCoverImageUrl(imageUrl);
    // Update the hidden input field so it's included in form submission
    const hiddenInput = document.getElementById('coverImageUrl') as HTMLInputElement;
    if (hiddenInput) {
      hiddenInput.value = imageUrl;
    }
  };

  const handleError = (error: string) => {
    console.error('Focus group cover image upload error:', error);
    // Error dialog is handled by the upload component
  };

  const handleEventAssociated = () => {
    // Trigger refresh of the events table
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div>
      {/* Event Search Component - Above form */}
      <FocusGroupEventSearch
        focusGroupId={focusGroupId}
        onEventAssociated={handleEventAssociated}
      />

      {/* Form Fields */}
      <form action={updateFocusGroup} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input name="name" defaultValue={group?.name} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
          <input name="slug" defaultValue={group?.slug} pattern="[a-z0-9-]+" title="lowercase letters, numbers, hyphens only" className="w-full border rounded px-3 py-2" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea name="description" rows={4} defaultValue={group?.description} className="w-full border rounded px-3 py-2" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
          <FocusGroupCoverImageUpload
            focusGroupId={focusGroupId}
            currentImageUrl={coverImageUrl}
            onImageUploaded={handleImageUploaded}
            onError={handleError}
          />
          {/* Hidden input to include coverImageUrl in form submission */}
          <input
            type="hidden"
            id="coverImageUrl"
            name="coverImageUrl"
            value={coverImageUrl || ''}
          />
        </div>
        <div className="flex items-center gap-2">
          <input type="hidden" name="isActive" value="false" />
          <input type="checkbox" name="isActive" value="true" defaultChecked={!!group?.isActive} className="h-4 w-4" />
          <span className="text-sm">Active</span>
        </div>
        <div className="md:col-span-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
        </div>
      </form>

      {/* Associated Events Table - Below form */}
      <AssociatedEventsTable
        key={refreshKey}
        focusGroupId={focusGroupId}
        initialEvents={initialEvents}
        initialTotalCount={initialTotalCount}
      />
    </div>
  );
}



