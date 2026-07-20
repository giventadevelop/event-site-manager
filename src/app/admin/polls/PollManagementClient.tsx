'use client';

import { useState, useEffect } from 'react';
import { PollList } from './components/PollList';
import { PollCreationForm } from './components/PollCreationForm';
import { PollDetailsModal } from './components/PollDetailsModal';
import { SuccessDialog } from '@/components/ui/SuccessDialog';
import { ErrorDialog } from '@/components/ui/ErrorDialog';
import AdminTenantIdBanner from '@/components/admin/AdminTenantIdBanner';
import {
  createEventPollServer,
  updateEventPollServer,
  deleteEventPollServer,
  createEventPollOptionServer,
  updateEventPollOptionServer,
  fetchEventPollOptionsServer,
  deleteEventPollOptionServer,
} from './ApiServerActions';
import type { EventPollDTO, EventPollOptionDTO } from '@/types';

interface PollManagementClientProps {
  initialPolls: EventPollDTO[];
}

function errorMessageFrom(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
}

export function PollManagementClient({ initialPolls }: PollManagementClientProps) {
  const [polls, setPolls] = useState<EventPollDTO[]>(initialPolls);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPoll, setEditingPoll] = useState<EventPollDTO | null>(null);
  const [viewingPoll, setViewingPoll] = useState<EventPollDTO | null>(null);
  const [pollOptions, setPollOptions] = useState<EventPollOptionDTO[]>([]);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ title: '', message: '' });
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState({ title: '', message: '' });

  useEffect(() => {
    setPolls(initialPolls);
  }, [initialPolls]);

  const showSuccess = (title: string, message: string) => {
    setSuccessMessage({ title, message });
    setShowSuccessDialog(true);
  };

  const showError = (title: string, message: string) => {
    setErrorMessage({ title, message });
    setShowErrorDialog(true);
  };

  const handleCreatePoll = async (
    pollData: Omit<EventPollDTO, 'id' | 'createdAt' | 'updatedAt'>,
    options: Omit<EventPollOptionDTO, 'id' | 'createdAt' | 'updatedAt' | 'pollId'>[]
  ) => {
    try {
      setIsLoading(true);

      const createdPoll = await createEventPollServer(pollData);

      await Promise.all(
        options.map((option) =>
          createEventPollOptionServer({
            ...option,
            pollId: createdPoll.id,
          })
        )
      );

      setPolls((prev) => [createdPoll, ...prev]);
      setShowCreateForm(false);
      showSuccess(
        'Poll Created Successfully!',
        'Your new poll has been created and is now available for voting.'
      );
    } catch (error) {
      console.error('Error creating poll:', error);
      showError(
        'Failed to Create Poll',
        errorMessageFrom(error, 'Failed to create poll. Please try again.')
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePoll = async (
    pollData: Omit<EventPollDTO, 'id' | 'createdAt' | 'updatedAt'>,
    options: (Omit<EventPollOptionDTO, 'id' | 'createdAt' | 'updatedAt' | 'pollId'> & {
      id?: number;
    })[]
  ) => {
    if (!editingPoll?.id) return;

    try {
      setIsLoading(true);

      const updatedPoll = await updateEventPollServer(editingPoll.id, {
        ...pollData,
        // Preserve tenant/createdAt from the loaded poll so update does not depend on a re-fetch
        tenantId: editingPoll.tenantId,
        createdAt: editingPoll.createdAt,
      });

      const existingOptions = await fetchEventPollOptionsServer({
        'pollId.equals': editingPoll.id,
      });

      const existingOptionIds = options.filter((opt) => opt.id).map((opt) => opt.id!);
      const newOptions = options.filter((opt) => !opt.id);

      const optionsToDelete = existingOptions.filter(
        (existing) => !existingOptionIds.includes(existing.id!)
      );

      await Promise.all(
        optionsToDelete.map((option) =>
          option.id ? deleteEventPollOptionServer(option.id) : Promise.resolve()
        )
      );

      const updatePromises = options
        .filter((opt) => opt.id)
        .map((option) => {
          const { id, ...optionData } = option;
          const existing = pollOptions.find((o) => o.id === id);
          return updateEventPollOptionServer(id!, {
            ...optionData,
            pollId: editingPoll.id,
            tenantId: existing?.tenantId ?? editingPoll.tenantId,
            createdAt: existing?.createdAt,
          });
        });

      const createPromises = newOptions.map((option) =>
        createEventPollOptionServer({
          ...option,
          pollId: editingPoll.id,
        })
      );

      await Promise.all([...updatePromises, ...createPromises]);

      // Re-fetch options so the next edit shows persisted values
      const refreshedOptions = await fetchEventPollOptionsServer({
        'pollId.equals': editingPoll.id,
      });
      setPollOptions(refreshedOptions);

      setPolls((prev) =>
        prev.map((poll) => (poll.id === editingPoll.id ? updatedPoll : poll))
      );
      setEditingPoll(null);
      showSuccess(
        'Poll Updated Successfully!',
        'Your poll has been updated with the latest changes.'
      );
    } catch (error) {
      console.error('Error updating poll:', error);
      showError(
        'Failed to Update Poll',
        errorMessageFrom(error, 'Failed to update poll. Please try again.')
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePoll = async (pollId: number) => {
    try {
      setIsLoading(true);

      const options = await fetchEventPollOptionsServer({
        'pollId.equals': pollId,
      });

      await Promise.all(
        options.map((option) =>
          option.id ? deleteEventPollOptionServer(option.id) : Promise.resolve()
        )
      );

      await deleteEventPollServer(pollId);

      setPolls((prev) => prev.filter((poll) => poll.id !== pollId));
      showSuccess(
        'Poll Deleted Successfully!',
        'The poll has been permanently removed from the system.'
      );
    } catch (error) {
      console.error('Error deleting poll:', error);
      showError(
        'Failed to Delete Poll',
        errorMessageFrom(error, 'Failed to delete poll. Please try again.')
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewPoll = async (poll: EventPollDTO) => {
    try {
      const options = await fetchEventPollOptionsServer({
        'pollId.equals': poll.id,
      });
      setPollOptions(options);
      setViewingPoll(poll);
    } catch (error) {
      console.error('Error fetching poll options:', error);
      showError(
        'Failed to Load Poll',
        errorMessageFrom(error, 'Failed to load poll details.')
      );
    }
  };

  const handleEditPoll = async (poll: EventPollDTO) => {
    try {
      const options = await fetchEventPollOptionsServer({
        'pollId.equals': poll.id,
      });
      setPollOptions(options);
      setEditingPoll(poll);
    } catch (error) {
      console.error('Error fetching poll options:', error);
      showError(
        'Failed to Load Poll',
        errorMessageFrom(error, 'Failed to load poll for editing.')
      );
    }
  };

  const dialogs = (
    <>
      <SuccessDialog
        open={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        title={successMessage.title}
        message={successMessage.message}
        buttonText="Continue"
      />
      <ErrorDialog
        open={showErrorDialog}
        onClose={() => setShowErrorDialog(false)}
        title={errorMessage.title}
        message={errorMessage.message}
        buttonText="Close"
      />
    </>
  );

  if (showCreateForm) {
    return (
      <>
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">Create New Poll</h2>
            <p className="text-gray-600 mt-2">Configure your poll settings and options</p>
          </div>

          <PollCreationForm
            onSubmit={handleCreatePoll}
            onCancel={() => setShowCreateForm(false)}
            isLoading={isLoading}
          />
        </div>
        {dialogs}
      </>
    );
  }

  if (editingPoll) {
    return (
      <>
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">Edit Poll</h2>
            <p className="text-gray-600 mt-2">Update poll settings and options</p>
            <AdminTenantIdBanner tenantId={editingPoll.tenantId} entityLabel="poll" />
          </div>

          <PollCreationForm
            key={`edit-poll-${editingPoll.id}-${pollOptions.map((o) => `${o.id}:${o.optionText}`).join('|')}`}
            onSubmit={handleUpdatePoll}
            onCancel={() => setEditingPoll(null)}
            initialData={editingPoll}
            initialOptions={pollOptions}
            isLoading={isLoading}
          />
        </div>
        {dialogs}
      </>
    );
  }

  if (viewingPoll) {
    return (
      <>
        <PollDetailsModal
          poll={viewingPoll}
          options={pollOptions}
          onClose={() => setViewingPoll(null)}
        />
        {dialogs}
      </>
    );
  }

  return (
    <>
      <PollList
        polls={polls}
        onEdit={handleEditPoll}
        onDelete={handleDeletePoll}
        onView={handleViewPoll}
        onCreate={() => setShowCreateForm(true)}
        isLoading={isLoading}
      />
      {dialogs}
    </>
  );
}
