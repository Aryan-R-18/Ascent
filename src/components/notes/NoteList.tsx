import type { Note } from '@/types';
import { timeAgo } from '@/lib/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notesApi } from '@/lib/api';
import { Trash2 } from 'lucide-react';

export function NoteList({ notes, clubId }: { notes: Note[]; clubId: string }) {
  const qc = useQueryClient();
  const deleteNote = useMutation({
    mutationFn: (noteId: string) => notesApi.delete(clubId, noteId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notes', clubId] }),
  });

  if (notes.length === 0) return <p className="text-gray-400 text-sm">No notes yet.</p>;

  return (
    <ul className="space-y-3">
      {notes.map((n) => (
        <li key={n.id} className="bg-white rounded-xl border p-4">
          <div className="flex items-start justify-between mb-2">
            <p className="font-medium">{n.title}</p>
            <button
              onClick={() => deleteNote.mutate(n.id)}
              className="text-gray-400 hover:text-red-500 p-1"
              aria-label="Delete note"
            >
              <Trash2 size={16} />
            </button>
          </div>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{n.content}</p>
          <p className="text-xs text-gray-400 mt-2">
            {n.author?.name} · {timeAgo(n.createdAt)}
          </p>
        </li>
      ))}
    </ul>
  );
}
