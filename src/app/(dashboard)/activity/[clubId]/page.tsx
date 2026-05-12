'use client';

import { useActivity } from '@/hooks/use-queries';
import { useClub } from '@/hooks/use-club';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { timeAgo } from '@/lib/utils';
import { Activity } from 'lucide-react';
import { useState } from 'react';

const actionLabels: Record<string, string> = {
  created_task: 'created task',
  updated_task: 'updated task',
  created_meeting: 'scheduled meeting',
  updated_meeting: 'updated meeting',
  created_mom: 'added meeting minutes',
  posted_daily_update: 'posted a daily update',
  created_note: 'created note',
  invited_member: 'invited member',
  updated_club: 'updated club settings',
};

export default function ActivityPage() {
  const { clubId } = useClub();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useActivity(clubId, page);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Activity size={22} /> Activity Log</h1>
        <p className="text-muted-foreground text-sm mt-1">Everything that's happened in this club</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(8)].map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
      ) : !data?.logs?.length ? (
        <p className="text-center py-16 text-muted-foreground">No activity yet</p>
      ) : (
        <>
          <div className="space-y-2">
            {data.logs.map((log: any) => (
              <Card key={log.id}>
                <CardContent className="p-4 flex items-start gap-3">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={log.user?.avatarUrl} />
                    <AvatarFallback className="text-xs">{log.user?.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{log.user?.name}</span>{' '}
                      <span className="text-muted-foreground">{actionLabels[log.action] ?? log.action.replace(/_/g, ' ')}</span>
                      {log.meta?.title && <span className="font-medium"> "{log.meta.title}"</span>}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{timeAgo(log.createdAt)}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {data.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
              <span className="text-sm text-muted-foreground">Page {page} of {data.pages}</span>
              <Button variant="outline" size="sm" disabled={page === data.pages} onClick={() => setPage(page + 1)}>Next</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
