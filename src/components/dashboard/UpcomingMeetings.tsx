import type { Meeting } from '@/types';
import { formatDateTime } from '@/lib/utils';
import { Calendar } from 'lucide-react';

export function UpcomingMeetings({ meetings }: { meetings: Meeting[] }) {
  return (
    <div className="bg-white rounded-xl border p-5">
      <h2 className="font-semibold mb-4">Upcoming Meetings</h2>
      {meetings.length === 0 ? (
        <p className="text-sm text-gray-400">No upcoming meetings</p>
      ) : (
        <ul className="space-y-3">
          {meetings.map((m) => (
            <li key={m.id} className="flex items-start gap-3">
              <Calendar size={16} className="text-primary-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium">{m.title}</p>
                <p className="text-xs text-gray-400">{formatDateTime(m.scheduledAt)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
