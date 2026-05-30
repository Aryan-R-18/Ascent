'use client';

import { useState } from 'react';
import { useMeetings, useCreateMeeting, useUpdateMeeting, useDeleteMeeting, useClubDetail } from '@/hooks/use-queries';
import { useClub } from '@/hooks/use-club';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDateTime, cn } from '@/lib/utils';
import { Plus, Calendar, MapPin, Trash2, Edit, FileText } from 'lucide-react';
import type { Meeting, MeetingStatus } from '@/types';
import Link from 'next/link';
import { toast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/auth.store';

const statusVariant: Record<MeetingStatus, string> = {
  SCHEDULED: 'secondary',
  IN_PROGRESS: 'default',
  COMPLETED: 'success',
  CANCELLED: 'destructive',
};

export default function MeetingsPage() {
  const { clubId } = useClub();
  const { data: meetings, isLoading } = useMeetings(clubId);
  const { data: club } = useClubDetail(clubId);
  const { user } = useAuthStore();
  const createMeeting = useCreateMeeting(clubId);
  const deleteMeeting = useDeleteMeeting(clubId);
  const [showForm, setShowForm] = useState(false);

  const myMembership = club?.members?.find((m) => m.userId === user?.id);
  const canSchedule = !!myMembership;

  async function handleDelete(id: string) {
    await deleteMeeting.mutateAsync(id);
    toast({ title: 'Meeting deleted' });
  }

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Meetings</h1>
          <p className="text-muted-foreground text-sm mt-1">{meetings?.length ?? 0} total</p>
        </div>
        {canSchedule && (
          <Button onClick={() => setShowForm(true)}>
            <Plus size={16} /> Schedule Meeting
          </Button>
        )}
      </div>

      {meetings?.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Calendar size={40} className="mx-auto mb-3 opacity-30" />
          <p>No meetings yet. Schedule your first one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {meetings?.map((m) => (
            <Card key={m.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold truncate">{m.title}</h3>
                    <Badge variant={statusVariant[m.status] as any} className="shrink-0">
                      {m.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar size={13} /> {formatDateTime(m.scheduledAt)}
                    </span>
                    {m.location && (
                      <span className="flex items-center gap-1">
                        <MapPin size={13} /> {m.location}
                      </span>
                    )}
                  </div>
                  {m.agenda && <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{m.agenda}</p>}
                  {m._count && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {m._count.notes} MoM · {m._count.tasks} tasks
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/meetings/${clubId}/${m.id}`} aria-label="View meeting">
                      <FileText size={16} />
                    </Link>
                  </Button>
                  {canSchedule && (
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(m.id)} aria-label="Delete meeting">
                      <Trash2 size={16} className="text-destructive" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <MeetingFormDialog
        open={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={async (data: any) => {
          await createMeeting.mutateAsync(data);
          setShowForm(false);
          toast({ title: 'Meeting scheduled' });
        }}
        loading={createMeeting.isPending}
      />
    </div>
  );
}

function MeetingFormDialog({ open, onClose, onSubmit, loading }: {
  open: boolean; onClose: () => void;
  onSubmit: (data: any) => Promise<void>; loading: boolean;
}) {
  const [title, setTitle] = useState('');
  const [agenda, setAgenda] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [location, setLocation] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit({ title, agenda, scheduledAt: new Date(scheduledAt).toISOString(), location: location || undefined });
    setTitle(''); setAgenda(''); setScheduledAt(''); setLocation('');
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>Schedule Meeting</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Meeting title" required />
          </div>
          <div className="space-y-1.5">
            <Label>Date & Time</Label>
            <Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label>Location (optional)</Label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Room / link" />
          </div>
          <div className="space-y-1.5">
            <Label>Agenda (optional)</Label>
            <Textarea value={agenda} onChange={(e) => setAgenda(e.target.value)} placeholder="Meeting agenda..." rows={3} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Scheduling...' : 'Schedule'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PageSkeleton() {
  return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-8 w-40" />
      {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24" />)}
    </div>
  );
}
