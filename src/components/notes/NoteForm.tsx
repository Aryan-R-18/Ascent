'use client';

import { useState } from 'react';
import { useCreateNote } from '@/hooks/use-queries';

export function NoteForm({ clubId, onClose }: { clubId: string; onClose: () => void }) {
  const createNote = useCreateNote(clubId);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await createNote.mutateAsync({ title, content });
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border rounded-xl p-5 mb-6 space-y-3">
      <h2 className="font-semibold">New Note</h2>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        required
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Content"
        rows={4}
        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
        required
      />
      <div className="flex gap-2">
        <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm">
          Save
        </button>
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600">
          Cancel
        </button>
      </div>
    </form>
  );
}
