'use client';

import { useState } from 'react';
import { useMeeting, useCreateMoM, useCreateTask, useClubDetail } from '@/hooks/use-queries';
import { useClub } from '@/hooks/use-club';
import { useParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MarkdownPreview } from '@/components/shared/MarkdownPreview';
import { formatDateTime, timeAgo } from '@/lib/utils';
import { Calendar, MapPin, Edit, Eye, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { MeetingStatus, Priority } from '@/types';

const statusVariant: Record<MeetingStatus, string> = {
  SCHEDULED: 'secondary', IN_PROGRESS: 'default', COMPLETED: 'success', CANCELLED: 'destructive',
};

const priorityVariant: Record<Priority, string> = {
  LOW: 'secondary', MEDIUM: 'outline', HIGH: 'destructive',
};

export default function MeetingDetailPage() {
  const { clubId } = useClub();
  const { user } = useAuthStore();
  const params = useParams();
  const meetingId = params.meetingId as string;
  const { data: meeting, isLoading } = useMeeting(clubId, meetingId);
  const { data: club } = useClubDetail(clubId);
  const createMoM = useCreateMoM(clubId, meetingId);
  const createTask = useCreateTask(clubId);

  const [showMoMForm, setShowMoMForm] = useState(false);
  const [momData, setMomData] = useState({ discussionPoints: '', decisions: '', actionItems: '' });
  const [preview, setPreview] = useState(false);

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskData, setTaskData] = useState({ title: '', description: '', priority: 'MEDIUM' as Priority, assigneeId: '', dueDate: '' });

  const myMembership = club?.members?.find((m) => m.userId === user?.id);
  const canManage = myMembership?.role === 'OWNER' || myMembership?.role === 'CORE_MEMBER';

  if (isLoading) return <Skeleton className="m-6 h-96" />;
  if (!meeting) return <p className="p-6 text-muted-foreground">Meeting not found</p>;

  async function handleMoMSubmit(e: React.FormEvent) {
    e.preventDefault();
    await createMoM.mutateAsync(momData);
    setShowMoMForm(false);
    setMomData({ discussionPoints: '', decisions: '', actionItems: '' });
    toast({ title: 'Minutes saved' });
  }

  async function handleTaskSubmit(e: React.FormEvent) {
    e.preventDefault();
    await createTask.mutateAsync({
      title: taskData.title,
      description: taskData.description || undefined,
      priority: taskData.priority,
      assigneeId: taskData.assigneeId || undefined,
      dueDate: taskData.dueDate ? new Date(taskData.dueDate).toISOString() : undefined,
      meetingId,
    });
    setShowTaskForm(false);
    setTaskData({ title: '', description: '', priority: 'MEDIUM', assigneeId: '', dueDate: '' });
    toast({ title: 'Task added to meeting' });
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
              {canManage && <Button onClick={() => setShowMoMForm(true)}><Plus size={16} /> Add Minutes</Button>}
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

          {meeting.notes && meeting.notes.length > 0 && !showMoMForm && canManage && (
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

        <TabsContent value="tasks" className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {meeting.tasks?.length === 0 ? 'No tasks linked to this meeting' : `${meeting.tasks?.length} task${meeting.tasks!.length !== 1 ? 's' : ''}`}
            </p>
            {canManage && (
              <Button size="sm" onClick={() => setShowTaskForm(true)}><Plus size={15} /> Add Task</Button>
            )}
          </div>

          {meeting.tasks && meeting.tasks.length > 0 && (
            <div className="space-y-2">
              {meeting.tasks.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{t.title}</p>
                    {t.assignee && <p className="text-xs text-muted-foreground">Assigned to {t.assignee.name}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={priorityVariant[t.priority] as any} className="text-xs">{t.priority}</Badge>
                    <Badge variant={t.status === 'DONE' ? 'success' : 'secondary' as any}>{t.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Task Dialog */}
      <Dialog open={showTaskForm} onOpenChange={setShowTaskForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Task to Meeting</DialogTitle></DialogHeader>
          <form onSubmit={handleTaskSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input value={taskData.title} onChange={(e) => setTaskData({ ...taskData, title: e.target.value })} placeholder="Task title" required />
            </div>
            <div className="space-y-1.5">
              <Label>Description (optional)</Label>
              <Textarea value={taskData.description} onChange={(e) => setTaskData({ ...taskData, description: e.target.value })} placeholder="Details..." rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Select value={taskData.priority} onValueChange={(v) => setTaskData({ ...taskData, priority: v as Priority })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(['LOW', 'MEDIUM', 'HIGH'] as Priority[]).map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Due Date (optional)</Label>
                <Input type="date" value={taskData.dueDate} onChange={(e) => setTaskData({ ...taskData, dueDate: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Assign to (optional)</Label>
              <Select value={taskData.assigneeId} onValueChange={(v) => setTaskData({ ...taskData, assigneeId: v })}>
                <SelectTrigger><SelectValue placeholder="Select member" /></SelectTrigger>
                <SelectContent>
                  {club?.members?.map((m) => (
                    <SelectItem key={m.userId} value={m.userId}>{m.user.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowTaskForm(false)}>Cancel</Button>
              <Button type="submit" disabled={createTask.isPending}>{createTask.isPending ? 'Adding...' : 'Add Task'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
