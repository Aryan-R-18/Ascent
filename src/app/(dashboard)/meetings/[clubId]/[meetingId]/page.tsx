'use client';

import { useState } from 'react';
import { useMeeting, useCreateMoM, useUpdateMeeting } from '@/hooks/use-queries';
import { useClub } from '@/hooks/use-club';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MarkdownPreview } from '@/components/shared/MarkdownPreview';
import { formatDateTime, timeAgo } from '@/lib/utils';
import { Calendar, MapPin, Edit, Eye, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { MeetingStatus } from '@/types';

const statusVariant: Record<MeetingStatus, string> = {
  SCHEDULED: 'secondary', IN_PROGRESS: 'default', COMPLETED: 'success', CANCELLED: 'destructive',
};

export default function MeetingDetailPage() {
  const { clubId } = useClub();
  const params = useParams();
  const meetingId = params.meetingId as string;
  const { data: meeting, isLoading } = useMeeting(clubId, meetingId);
  const createMoM = useCreateMoM(clubId, meetingId);
  const [showMoMForm, setShowMoMForm] = useState(false);
  const [momData, setMomData] = useState({ discussionPoints: '', decisions: '', actionItems: '' });
  const [preview, setPreview] = useState(false);

  if (isLoading) return <Skeleton className="m-6 h-96" />;
  if (!meeting) return <p className="p-6 text-muted-foreground">Meeting not found</p>;

  async function handleMoMSubmit(e: React.FormEvent) {
    e.preventDefault();
    await createMoM.mutateAsync(momData);
    setShowMoMForm(false);
    setMomData({ discussionPoints: '', decisions: '', actionItems: '' });
    toast({ title: 'Minutes saved' });
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold">{meeting.title}</h1>
          <Badge variant={statusVariant[meeting.status] as any}>{meeting.status.replace('_', ' ')}</Badge>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
          <span className="flex items-center gap-1"><Calendar size={13} /> {formatDateTime(meeting.scheduledAt)}</span>
          {meeting.location && <span className="flex items-center gap-1"><MapPin size={13} /> {meeting.location}</span>}
        </div>
        {meeting.agenda && (
          <div className="mt-3 p-3 bg-muted rounded-lg">
            <p className="text-xs font-medium text-muted-foreground mb-1">AGENDA</p>
            <p className="text-sm whitespace-pre-wrap">{meeting.agenda}</p>
          </div>
        )}
      </div>

      <Tabs defaultValue="mom">
        <TabsList>
          <TabsTrigger value="mom">Minutes of Meeting</TabsTrigger>
          <TabsTrigger value="tasks">Tasks ({meeting.tasks?.length ?? 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="mom" className="space-y-4 mt-4">
          {meeting.notes?.length === 0 && !showMoMForm && (
            <div className="text-center py-10 text-muted-foreground">
              <p className="mb-3">No minutes recorded yet</p>
              <Button onClick={() => setShowMoMForm(true)}><Plus size={16} /> Add Minutes</Button>
            </div>
          )}

          {meeting.notes?.map((mom) => (
            <Card key={mom.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">by {mom.author?.name} · {timeAgo(mom.createdAt)}</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Discussion Points</p>
                  <MarkdownPreview content={mom.discussionPoints} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Decisions Made</p>
                  <MarkdownPreview content={mom.decisions} />
                </div>
                {mom.actionItems && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Action Items</p>
                    <MarkdownPreview content={mom.actionItems} />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {meeting.notes && meeting.notes.length > 0 && !showMoMForm && (
            <Button variant="outline" onClick={() => setShowMoMForm(true)}><Plus size={16} /> Add More Minutes</Button>
          )}

          {showMoMForm && (
            <Card>
              <CardHeader><CardTitle className="text-base">Record Minutes</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleMoMSubmit} className="space-y-4">
                  {(['discussionPoints', 'decisions', 'actionItems'] as const).map((field) => (
                    <div key={field} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label>{field === 'discussionPoints' ? 'Discussion Points' : field === 'decisions' ? 'Decisions Made' : 'Action Items (optional)'}</Label>
                        <button type="button" onClick={() => setPreview(!preview)} className="text-xs text-muted-foreground flex items-center gap-1">
                          {preview ? <Edit size={12} /> : <Eye size={12} />} {preview ? 'Edit' : 'Preview'}
                        </button>
                      </div>
                      {preview ? (
                        <div className="border rounded-md p-3 min-h-[80px]">
                          <MarkdownPreview content={momData[field]} />
                        </div>
                      ) : (
                        <Textarea
                          value={momData[field]}
                          onChange={(e) => setMomData({ ...momData, [field]: e.target.value })}
                          placeholder={`Markdown supported...`}
                          rows={4}
                          required={field !== 'actionItems'}
                        />
                      )}
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Button type="submit" disabled={createMoM.isPending}>
                      {createMoM.isPending ? 'Saving...' : 'Save Minutes'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowMoMForm(false)}>Cancel</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="tasks" className="mt-4">
          {meeting.tasks?.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tasks linked to this meeting</p>
          ) : (
            <div className="space-y-2">
              {meeting.tasks?.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{t.title}</p>
                    {t.assignee && <p className="text-xs text-muted-foreground">Assigned to {t.assignee.name}</p>}
                  </div>
                  <Badge variant={t.status === 'DONE' ? 'success' : 'secondary' as any}>{t.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
