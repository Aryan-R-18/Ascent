import type { Meeting } from '@/types';
import { formatDateTime } from '@/lib/utils';
import { useDeleteMeeting } from '@/hooks/use-queries';
import { Trash2 } from 'lucide-react';

export function MeetingList({ meetings, clubId }: { meetings: Meeting[]; clubId: string }) {
  const deleteMeeting = useDeleteMeeting(clubId);

  if (meetings.length === 0) return <p className="text-gray-400 text-sm">No meetings scheduled.</p>;

  return (
    <ul className="space-y-3">
      {meetings.map((m) => (
        <li key={m.id} className="bg-white rounded-xl border p-4 flex items-start justify-between">
          <div>
            <p className="font-medium">{m.title}</p>
            <p className="text-sm text-gray-500">{formatDateTime(m.scheduledAt)}</p>
            {m.location && <p className="text-xs text-gray-400">{m.location}</p>}
          </div>
          <button
            onClick={() => deleteMeeting.mutate(m.id)}
            className="text-gray-400 hover:text-red-500 p-1"
            aria-label="Delete meeting"
          >
            <Trash2 size={16} />
          </button>
        </li>
      ))}
    </ul>
  );
}
