import type { Update } from '@/types';
import { timeAgo } from '@/lib/utils';

export function UpdateList({ updates }: { updates: Update[] }) {
  if (updates.length === 0) return <p className="text-gray-400 text-sm">No updates yet.</p>;

  return (
    <ul className="space-y-4">
      {updates.map((u) => (
        <li key={u.id} className="bg-white rounded-xl border p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="font-semibold">{u.title}</p>
            <span className="text-xs text-gray-400">{timeAgo(u.createdAt)}</span>
          </div>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{u.content}</p>
          {u.author && <p className="text-xs text-gray-400 mt-2">by {u.author.name}</p>}
        </li>
      ))}
    </ul>
  );
}
