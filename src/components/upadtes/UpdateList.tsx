import type { DailyUpdate } from '@/types';
import { timeAgo } from '@/lib/utils';

export function UpdateList({ updates }: { updates: DailyUpdate[] }) {
  if (updates.length === 0) return <p className="text-muted-foreground text-sm">No updates yet.</p>;

  return (
    <ul className="space-y-4">
      {updates.map((u) => (
        <li key={u.id} className="bg-card rounded-xl border p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">{timeAgo(u.date)}</span>
          </div>
          <p className="text-sm text-foreground whitespace-pre-wrap">{u.content}</p>
          {u.author && <p className="text-xs text-muted-foreground mt-2">by {u.author.name}</p>}
        </li>
      ))}
    </ul>
  );
}
