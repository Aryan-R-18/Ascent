import type { Update } from '@/types';
import { timeAgo } from '@/lib/utils';

export function RecentUpdates({ updates }: { updates: Update[] }) {
  return (
    <div className="bg-white rounded-xl border p-5">
      <h2 className="font-semibold mb-4">Recent Updates</h2>
      {updates.length === 0 ? (
        <p className="text-sm text-gray-400">No updates yet</p>
      ) : (
        <ul className="space-y-4">
          {updates.map((u) => (
            <li key={u.id} className="border-b last:border-0 pb-4 last:pb-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium">{u.title}</p>
                <span className="text-xs text-gray-400">{timeAgo(u.createdAt)}</span>
              </div>
              <p className="text-sm text-gray-500 line-clamp-2">{u.content}</p>
              {u.author && <p className="text-xs text-gray-400 mt-1">by {u.author.name}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
