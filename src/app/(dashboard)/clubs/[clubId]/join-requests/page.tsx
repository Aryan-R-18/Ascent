'use client';

import { useJoinRequests, useApproveRequest, useRejectRequest } from '@/hooks/use-queries';
import { useClub } from '@/hooks/use-club';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CheckCircle2, XCircle, Clock, Users } from 'lucide-react';
import { timeAgo } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

export default function JoinRequestsPage() {
  const { clubId } = useClub();
  const { data: requests, isLoading } = useJoinRequests(clubId);
  const approve = useApproveRequest(clubId);
  const reject = useRejectRequest(clubId);

  async function handleApprove(id: string, name: string) {
    await approve.mutateAsync(id);
    toast({ title: `${name} approved`, description: 'They can now log in.' });
  }

  async function handleReject(id: string, name: string) {
    await reject.mutateAsync(id);
    toast({ title: `${name}'s request rejected`, variant: 'destructive' });
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users size={22} /> Join Requests
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Approve or reject pending membership requests
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : !requests?.length ? (
        <div className="text-center py-16 text-muted-foreground">
          <Clock size={40} className="mx-auto mb-3 opacity-30" />
          <p>No pending requests</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((r: any) => (
            <div key={r.id} className="bg-card border rounded-xl p-4 flex items-start gap-4">
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarFallback className="text-sm font-medium">
                  {r.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{r.name}</p>
                <p className="text-xs text-muted-foreground">{r.email}</p>
                {r.message && (
                  <p className="text-xs text-muted-foreground mt-1 italic">"{r.message}"</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">{timeAgo(r.createdAt)}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleApprove(r.id, r.name)}
                  disabled={approve.isPending}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  <CheckCircle2 size={13} />
                  Approve
                </button>
                <button
                  onClick={() => handleReject(r.id, r.name)}
                  disabled={reject.isPending}
                  className="flex items-center gap-1.5 px-3 py-1.5 border text-xs font-medium rounded-lg hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 disabled:opacity-50 transition-colors"
                >
                  <XCircle size={13} />
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
