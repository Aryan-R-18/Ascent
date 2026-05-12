'use client';

import { useState } from 'react';
import { useDailyUpdates, useCreateDailyUpdate, useDeleteDailyUpdate, useClubDetail } from '@/hooks/use-queries';
import { useClub } from '@/hooks/use-club';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MarkdownPreview } from '@/components/shared/MarkdownPreview';
import { formatDate, timeAgo } from '@/lib/utils';
import { Plus, Trash2, Filter, Eye, Edit } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/auth.store';

export default function UpdatesPage() {
  const { clubId } = useClub();
  const { user } = useAuthStore();
  const { data: club } = useClubDetail(clubId);
  const [filters, setFilters] = useState<{ authorId?: string; from?: string; to?: string }>({});
  const { data, isLoading } = useDailyUpdates(clubId, filters);
  const createUpdate = useCreateDailyUpdate(clubId);
  const deleteUpdate = useDeleteDailyUpdate(clubId);
  const [showForm, setShowForm] = useState(false);
  const [content, setContent] = useState('');
  const [completedTasks, setCompletedTasks] = useState('');
  const [preview, setPreview] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await createUpdate.mutateAsync({
      content,
      completedTasks: completedTasks.split('\n').map((s) => s.trim()).filter(Boolean),
    });
    setContent(''); setCompletedTasks(''); setShowForm(false);
    toast({ title: 'Update posted' });
  }

  const updates = data?.updates ?? [];

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Daily Updates</h1>
          <p className="text-muted-foreground text-sm mt-1">Team activity feed</p>
        </div>
        <Button onClick={() => setShowForm(true)}><Plus size={16} /> Post Update</Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Select value={filters.authorId ?? 'all'} onValueChange={(v) => setFilters({ ...filters, authorId: v === 'all' ? undefined : v })}>
          <SelectTrigger className="w-40 h-8 text-xs">
            <SelectValue placeholder="All members" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All members</SelectItem>
            {club?.members?.map((m) => (
              <SelectItem key={m.userId} value={m.userId}>{m.user.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input type="date" value={filters.from ?? ''} onChange={(e) => setFilters({ ...filters, from: e.target.value || undefined })} className="w-36 h-8 text-xs" placeholder="From" />
        <Input type="date" value={filters.to ?? ''} onChange={(e) => setFilters({ ...filters, to: e.target.value || undefined })} className="w-36 h-8 text-xs" placeholder="To" />
        {(filters.authorId || filters.from || filters.to) && (
          <Button variant="ghost" size="sm" onClick={() => setFilters({})}>Clear</Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32" />)}</div>
      ) : updates.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p>No updates yet. Be the first to post!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {updates.map((u) => (
            <Card key={u.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage src={u.author?.avatarUrl} />
                      <AvatarFallback className="text-xs">{u.author?.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-sm">{u.author?.name}</span>
                        <span className="text-xs text-muted-foreground">{formatDate(u.date)}</span>
                        <span className="text-xs text-muted-foreground">· {timeAgo(u.createdAt)}</span>
                      </div>
                      <MarkdownPreview content={u.content} />
                      {u.completedTasks.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-semibold text-muted-foreground mb-1">✅ Completed</p>
                          <ul className="space-y-0.5">
                            {u.completedTasks.map((t, i) => (
                              <li key={i} className="text-sm text-muted-foreground flex items-center gap-1.5">
                                <span className="w-1 h-1 rounded-full bg-green-500 shrink-0" /> {t}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                  {u.authorId === user?.id && (
                    <button onClick={() => deleteUpdate.mutate(u.id)} className="text-muted-foreground hover:text-destructive p-1 shrink-0" aria-label="Delete">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Post Daily Update</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>What did you work on? (Markdown supported)</Label>
                <button type="button" onClick={() => setPreview(!preview)} className="text-xs text-muted-foreground flex items-center gap-1">
                  {preview ? <Edit size={12} /> : <Eye size={12} />} {preview ? 'Edit' : 'Preview'}
                </button>
              </div>
              {preview ? (
                <div className="border rounded-md p-3 min-h-[120px]"><MarkdownPreview content={content} /></div>
              ) : (
                <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Today I worked on..." rows={5} required />
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Completed tasks (one per line)</Label>
              <Textarea value={completedTasks} onChange={(e) => setCompletedTasks(e.target.value)} placeholder="Fixed login bug&#10;Reviewed PR #42" rows={3} />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" disabled={createUpdate.isPending}>{createUpdate.isPending ? 'Posting...' : 'Post Update'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
