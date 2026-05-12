'use client';

import { useState } from 'react';
import { useCreateMeeting } from '@/hooks/use-queries';

export function MeetingForm({ clubId, onClose }: { clubId: string; onClose: () => void }) {
  const createMeeting = useCreateMeeting(clubId);
  const [title, setTitle] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [location, setLocation] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await createMeeting.mutateAsync({ title, scheduledAt, location: location || undefined });
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border rounded-xl p-5 mb-6 space-y-3">
      <h2 className="font-semibold">Schedule Meeting</h2>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        required
      />
      <input
        type="datetime-local"
        value={scheduledAt}
        onChange={(e) => setScheduledAt(e.target.value)}
        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        required
      />
      <input
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="Location (optional)"
        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
      <div className="flex gap-2">
        <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm">
          Schedule
        </button>
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600">
          Cancel
        </button>
      </div>
    </form>
  );
}
