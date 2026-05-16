'use client';

import { useState } from 'react';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask, useClubDetail } from '@/hooks/use-queries';
import { useClub } from '@/hooks/use-club';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn, formatDate, timeAgo } from '@/lib/utils';
import { Plus, Trash2, MessageSquare, Clock, AlertCircle, ChevronRight } from 'lucide-react';
import type { Task, TaskStatus, Priority } from '@/types';
import Link from 'next/link';
import { toast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/auth.store';

const statusCols: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED'];
const priorityVariant = { HIGH: 'destructive', MEDIUM: 'warning', LOW: 'secondary' } as const;
const statusVariant = { TODO: 'secondary', IN_PROGRESS: 'default', DONE: 'success', CANCELLED: 'destructive' } as const;

export default function TasksPage() {
  const { clubId } = useClub();
  const { data: tasks, isLoading } = useTasks(clubId);
  const { data: club } = useClubDetail(clubId);
  const { user } = useAuthStore();
  const createTask = useCreateTask(clubId);
  const updateTask = useUpdateTask(clubId);
  const deleteTask = useDeleteTask(clubId);
  const [showForm, setShowForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [view, setView] = useState<'board' | 'list'>('list');

  const myMembership = club?.members?.find((m) => m.userId === user?.id);
  const canManageTask = myMembership?.role === 'OWNER' || myMembership?.role === 'CORE_MEMBER';

  const grouped = statusCols.reduce((acc, s) => {
    acc[s] = tasks?.filter((t) => t.status === s) ?? [];
    return acc;
  }, {} as Record<TaskStatus, Task[]>);

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
          <p className="text-muted-foreground text-sm mt-1">{tasks?.length ?? 0} total</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border rounded-md overflow-hidden">
            {(['list', 'board'] as const).map((v) => (
              <button key={v} onClick={() => setView(v)} className={cn('px-3 py-1.5 text-xs capitalize', view === v ? 'bg-primary text-primary-foreground' : 'hover:bg-accent')}>
                {v}
              </button>
            ))}
          </div>
          {canManageTask && (
            <Button onClick={() => setShowForm(true)}><Plus size={16} /> New Task</Button>
          )}
        </div>
      </div>

      {view === 'list' ? (
        <div className="space-y-2">
          {tasks?.length === 0 && <p className="text-center py-16 text-muted-foreground">No tasks yet</p>}
          {tasks?.map((t) => (
            <TaskRow key={t.id} task={t} onStatusChange={(status) => updateTask.mutate({ taskId: t.id, data: { status } })} onDelete={() => deleteTask.mutate(t.id)} onClick={() => setSelectedTask(t)} canManageTask={canManageTask} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statusCols.map((status) => (
            <div key={status} className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <Badge variant={statusVariant[status] as any} className="text-xs">{status.replace('_', ' ')}</Badge>
                <span className="text-xs text-muted-foreground">{grouped[status].length}</span>
              </div>
              {grouped[status].map((t) => (
                <Card key={t.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedTask(t)}>
                  <CardContent className="p-3">
                    <p className="text-sm font-medium line-clamp-2">{t.title}</p>
                    <div className="flex items-center justify-between mt-2">
                      <Badge variant={priorityVariant[t.priority] as any} className="text-[10px] px-1.5 py-0">{t.priority}</Badge>
                      {t.assignee && (
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={t.assignee.avatarUrl} />
                          <AvatarFallback className="text-[9px]">{t.assignee.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ))}
        </div>
      )}

      <TaskFormDialog
        open={showForm}
        onClose={() => setShowForm(false)}
        members={club?.members ?? []}
        onSubmit={async (data: any) => {
          await createTask.mutateAsync(data);
          setShowForm(false);
          toast({ title: 'Task created' });
        }}
        loading={createTask.isPending}
      />

      {selectedTask && (
        <TaskDetailDialog
          task={selectedTask}
          clubId={clubId}
          onClose={() => setSelectedTask(null)}
          onStatusChange={(status: any) => { updateTask.mutate({ taskId: selectedTask.id, data: { status } }); setSelectedTask({ ...selectedTask, status }); }}
        />
      )}
    </div>
  );
}

function TaskRow({ task, onStatusChange, onDelete, onClick, canManageTask }: {
  task: Task; onStatusChange: (s: TaskStatus) => void; onDelete: () => void; onClick: () => void; canManageTask: boolean;
}) {
  const overdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';
  return (
    <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/30 transition-colors group">
      <Select value={task.status} onValueChange={(v) => onStatusChange(v as TaskStatus)}>
        <SelectTrigger className="w-32 h-7 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {statusCols.map((s) => <SelectItem key={s} value={s} className="text-xs">{s.replace('_', ' ')}</SelectItem>)}
        </SelectContent>
      </Select>

      <button onClick={onClick} className="flex-1 text-left min-w-0">
        <div className="flex items-center gap-2">
          {overdue && <AlertCircle size={13} className="text-destructive shrink-0" />}
          <p className="text-sm font-medium truncate">{task.title}</p>
        </div>
        {task.assignee && <p className="text-xs text-muted-foreground">{task.assignee.name}</p>}
      </button>

      <div className="flex items-center gap-2 shrink-0">
        <Badge variant={priorityVariant[task.priority] as any} className="text-[10px] px-1.5 py-0">{task.priority}</Badge>
        {task.dueDate && (
          <span className={cn('text-xs flex items-center gap-0.5', overdue ? 'text-destructive' : 'text-muted-foreground')}>
            <Clock size={11} /> {formatDate(task.dueDate)}
          </span>
        )}
        {(task._count?.comments ?? 0) > 0 && (
          <span className="text-xs text-muted-foreground flex items-center gap-0.5">
            <MessageSquare size={11} /> {task._count!.comments}
          </span>
        )}
        {canManageTask && (
          <button onClick={onDelete} className="opacity-0 group-hover:opacity-100 p-1 hover:text-destructive transition-all" aria-label="Delete">
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

function TaskFormDialog({ open, onClose, members, onSubmit, loading }: any) {
  const [form, setForm] = useState({ title: '', description: '', priority: 'MEDIUM', dueDate: '', assigneeId: '' });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit({ ...form, dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : undefined, assigneeId: form.assigneeId || undefined });
    setForm({ title: '', description: '', priority: 'MEDIUM', dueDate: '', assigneeId: '' });
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>New Task</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['LOW', 'MEDIUM', 'HIGH'].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Due Date</Label>
              <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Assign To</Label>
            <Select value={form.assigneeId} onValueChange={(v) => setForm({ ...form, assigneeId: v })}>
              <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
              <SelectContent>
                {members.map((m: any) => (
                  <SelectItem key={m.userId} value={m.userId}>{m.user.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Task'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function TaskDetailDialog({ task, clubId, onClose, onStatusChange }: any) {
  const { data: fullTask } = useTask(clubId, task.id);
  const addComment = useAddComment(clubId, task.id);
  const [comment, setComment] = useState('');

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!comment.trim()) return;
    await addComment.mutateAsync(comment);
    setComment('');
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Select value={task.status} onValueChange={onStatusChange}>
              <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {statusCols.map((s) => <SelectItem key={s} value={s} className="text-xs">{s.replace('_', ' ')}</SelectItem>)}
              </SelectContent>
            </Select>
            <Badge variant={priorityVariant[task.priority as Priority] as any}>{task.priority}</Badge>
          </div>

          {task.description && <p className="text-sm text-muted-foreground">{task.description}</p>}

          {/* History */}
          {fullTask?.history && fullTask.history.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">History</p>
              <div className="space-y-1">
                {fullTask.history.map((h: any) => (
                  <p key={h.id} className="text-xs text-muted-foreground">
                    <span className="font-medium">{h.user.name}</span> changed {h.field} from <span className="font-medium">{h.oldValue || 'none'}</span> to <span className="font-medium">{h.newValue}</span> · {timeAgo(h.createdAt)}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Comments */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Comments</p>
            <div className="space-y-3 mb-3">
              {fullTask?.comments?.map((c: any) => (
                <div key={c.id} className="flex gap-2">
                  <Avatar className="h-6 w-6 shrink-0">
                    <AvatarImage src={c.author.avatarUrl} />
                    <AvatarFallback className="text-[9px]">{c.author.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-lg px-3 py-2 flex-1">
                    <p className="text-xs font-medium">{c.author.name} <span className="text-muted-foreground font-normal">· {timeAgo(c.createdAt)}</span></p>
                    <p className="text-sm mt-0.5">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleComment} className="flex gap-2">
              <Input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add a comment..." className="text-sm" />
              <Button type="submit" size="sm" disabled={addComment.isPending}>Post</Button>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Import these at the top — adding here to avoid circular issues
import { useTask, useAddComment } from '@/hooks/use-queries';

function PageSkeleton() {
  return (
    <div className="p-6 space-y-3">
      <Skeleton className="h-8 w-32" />
      {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14" />)}
    </div>
  );
}
