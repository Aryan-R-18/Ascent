'use client';

import { useState } from 'react';
import { useCreateTask } from '@/hooks/use-queries';
import type { Priority } from '@/types';

export function TaskForm({ clubId, onClose }: { clubId: string; onClose: () => void }) {
  const createTask = useCreateTask(clubId);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [dueDate, setDueDate] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await createTask.mutateAsync({ title, priority, dueDate: dueDate || undefined });
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border rounded-xl p-5 mb-6 space-y-3">
      <h2 className="font-semibold">New Task</h2>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task title"
        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        required
      />
      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value as Priority)}
        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <option value="LOW">Low</option>
        <option value="MEDIUM">Medium</option>
        <option value="HIGH">High</option>
      </select>
      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
      <div className="flex gap-2">
        <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm">
          Create
        </button>
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600">
          Cancel
        </button>
      </div>
    </form>
  );
}
