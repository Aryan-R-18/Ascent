'use client';

import { useState } from 'react';
import { useCreateDailyUpdate } from '@/hooks/use-queries';

export function UpdateForm({ clubId, onClose }: { clubId: string; onClose: () => void }) {
  const createUpdate = useCreateDailyUpdate(clubId);
  const [content, setContent] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await createUpdate.mutateAsync({ content });
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card border rounded-xl p-5 mb-6 space-y-3">
      <h2 className="font-semibold">Post Update</h2>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What did you work on today?"
        rows={4}
        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none bg-background"
        required
      />
      <div className="flex gap-2">
        <button type="submit" disabled={createUpdate.isPending}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm hover:bg-primary/90 disabled:opacity-50">
          {createUpdate.isPending ? 'Posting...' : 'Post'}
        </button>
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
          Cancel
        </button>
      </div>
    </form>
  );
}
