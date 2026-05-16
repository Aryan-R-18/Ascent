import type { DailyUpdate } from '@/types';
import { timeAgo } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function RecentUpdates({ updates }: { updates: DailyUpdate[] }) {
  return (
    <div className="bg-card border rounded-xl p-5">
      <h2 className="font-semibold mb-4">Recent Updates</h2>
      {updates.length === 0 ? (
        <p className="text-sm text-muted-foreground">No updates yet</p>
      ) : (
        <ul className="space-y-3">
          {updates.map((u) => (
            <li key={u.id} className="flex gap-3">
              <Avatar className="h-7 w-7 shrink-0">
                <AvatarImage src={u.author?.avatarUrl} />
                <AvatarFallback className="text-[10px]">
                  {u.author?.name?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-xs font-medium">
                  {u.author?.name}{' '}
                  <span className="text-muted-foreground font-normal">· {timeAgo(u.date)}</span>
                </p>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">{u.content}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
