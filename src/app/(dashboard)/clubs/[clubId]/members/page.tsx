'use client';

import { useState } from 'react';
import { useClubDetail, useInviteMember, useRemoveMember, useUpdateMemberRole, useJoinRequests, useApproveRequest, useRejectRequest } from '@/hooks/use-queries';
import { useClub } from '@/hooks/use-club';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserPlus, Trash2, Check, X } from 'lucide-react';
import type { ClubRole } from '@/types';
import { toast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';

const roleVariant: Record<ClubRole, string> = {
  OWNER: 'default', ADMIN: 'secondary', CORE_MEMBER: 'outline', MEMBER: 'outline',
};

export default function MembersPage() {
  const { clubId } = useClub();
  const { user } = useAuthStore();
  const { data: club, isLoading } = useClubDetail(clubId);
  const inviteMember = useInviteMember(clubId);
  const removeMember = useRemoveMember(clubId);
  const updateRole = useUpdateMemberRole(clubId);
  const [showInvite, setShowInvite] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<ClubRole>('MEMBER');

  const { data: joinRequests } = useJoinRequests(clubId);
  const approveReq = useApproveRequest(clubId);
  const rejectReq = useRejectRequest(clubId);

  const myMembership = club?.members?.find((m) => m.userId === user?.id);
  const canManage = myMembership?.role === 'OWNER';

  const roleWeight: Record<ClubRole, number> = { OWNER: 1, CORE_MEMBER: 2, MEMBER: 3, ADMIN: 4 };
  const sortedMembers = [...(club?.members ?? [])].sort((a, b) => roleWeight[a.role] - roleWeight[b.role]);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    await inviteMember.mutateAsync({ email, role });
    setEmail(''); setShowInvite(false);
    toast({ title: 'Member invited' });
  }

  if (isLoading) return <div className="p-6 space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16" />)}</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Members</h1>
          <p className="text-muted-foreground text-sm mt-1">{club?.members?.length ?? 0} members</p>
        </div>
        {canManage && (
          <Button onClick={() => setShowInvite(true)}><UserPlus size={16} /> Invite Member</Button>
        )}
      </div>

      {canManage && joinRequests && joinRequests.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Pending Join Requests</h2>
          <div className="space-y-2">
            {(joinRequests as any[]).map((req: any) => (
              <Card key={req.id} className="border-primary/50 bg-primary/5">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{req.name}</p>
                    <p className="text-xs text-muted-foreground">{req.email} · Requested {formatDate(req.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="h-8" onClick={() => rejectReq.mutate(req.id)} disabled={rejectReq.isPending}>
                      <X size={14} className="mr-1 text-destructive" /> Reject
                    </Button>
                    <Button size="sm" className="h-8" onClick={() => approveReq.mutate(req.id)} disabled={approveReq.isPending}>
                      <Check size={14} className="mr-1" /> Approve
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

  <h2 className="text-lg font-semibold mb-3">Current Members</h2>
      <div className="space-y-2">
        {sortedMembers.map((m) => (
          <Card key={m.id}>
            <CardContent className="p-4 flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={m.user.avatarUrl} />
                <AvatarFallback className="text-xs">{m.user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{m.user.name}</p>
                <p className="text-xs text-muted-foreground">{m.user.email} · Joined {formatDate(m.joinedAt)}</p>
              </div>
              <div className="flex items-center gap-2">
                {canManage && m.role !== 'OWNER' ? (
                  <Select value={m.role} onValueChange={(v) => updateRole.mutate({ userId: m.userId, role: v as ClubRole })}>
                    <SelectTrigger className="w-32 h-7 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(['OWNER', 'CORE_MEMBER', 'MEMBER'] as ClubRole[]).map((r) => (
                        <SelectItem key={r} value={r} className="text-xs">{r.replace('_', ' ')}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant={roleVariant[m.role] as any} className="text-xs">{m.role.replace('_', ' ')}</Badge>
                )}
                {canManage && m.role !== 'OWNER' && m.userId !== user?.id && (
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeMember.mutate(m.userId)} aria-label="Remove member">
                    <Trash2 size={14} className="text-destructive" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent>
          <DialogHeader><DialogTitle>Invite Member</DialogTitle></DialogHeader>
          <form onSubmit={handleInvite} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Email address</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="member@example.com" required />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as ClubRole)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(['OWNER', 'CORE_MEMBER', 'MEMBER'] as ClubRole[]).map((r) => (
                    <SelectItem key={r} value={r}>{r.replace('_', ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowInvite(false)}>Cancel</Button>
              <Button type="submit" disabled={inviteMember.isPending}>{inviteMember.isPending ? 'Inviting...' : 'Invite'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
