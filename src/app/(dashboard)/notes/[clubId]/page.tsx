'use client';

import { useState } from 'react';
import { useNotes, useCreateNote, useUpdateNote, useDeleteNote, useTags, useCreateTag } from '@/hooks/use-queries';
import { useClub } from '@/hooks/use-club';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MarkdownPreview } from '@/components/shared/MarkdownPreview';
import { timeAgo, cn } from '@/lib/utils';
import { Plus, Search, Pin, Trash2, Edit, Eye, Tag, X } from 'lucide-react';
import type { Note } from '@/types';
import { toast } from '@/hooks/use-toast';

export default function NotesPage() {
  const { clubId } = useClub();
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState<string | undefined>();
  const { data: notes, isLoading } = useNotes(clubId, { search: search || undefined, tagId: activeTag });
  const { data: tags } = useTags();
  const createNote = useCreateNote(clubId);
  const updateNote = useUpdateNote(clubId);
  const deleteNote = useDeleteNote(clubId);
  const [showForm, setShowForm] = useState(false);
  const [editNote, setEditNote] = useState<Note | null>(null);
  const [viewNote, setViewNote] = useState<Note | null>(null);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Blogs & Technical Content</h1>
          <p className="text-muted-foreground text-sm mt-1">{notes?.length ?? 0} blogs</p>
        </div>
        <Button onClick={() => setShowForm(true)}><Plus size={16} /> New Blog</Button>
      </div>

      {/* Search + Tag filter */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search blogs..." className="pl-8 h-9" />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {tags?.map((tag) => (
            <button
              key={tag.id}
              onClick={() => setActiveTag(activeTag === tag.id ? undefined : tag.id)}
              className={cn('flex items-center gap-1 px-2 py-1 rounded-full text-xs border transition-colors', activeTag === tag.id ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-accent')}
              style={activeTag !== tag.id ? { borderColor: tag.color, color: tag.color } : {}}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tag.color }} />
              {tag.name}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-48" />)}
        </div>
      ) : notes?.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p>No blogs found. Create your first blog.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes?.map((note) => (
            <Card key={note.id} className={cn('hover:shadow-md transition-shadow cursor-pointer', note.isPinned && 'ring-1 ring-primary/30')}>
              <CardHeader className="pb-2 pt-4 px-4">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm font-semibold line-clamp-1 flex items-center gap-1.5">
                    {note.isPinned && <Pin size={12} className="text-primary shrink-0" />}
                    {note.title}
                  </CardTitle>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => setEditNote(note)} className="p-1 hover:text-primary" aria-label="Edit"><Edit size={13} /></button>
                    <button onClick={() => deleteNote.mutate(note.id)} className="p-1 hover:text-destructive" aria-label="Delete"><Trash2 size={13} /></button>
                  </div>
                </div>
                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {note.tags.map((nt) => (
                      <span key={nt.tagId} className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: nt.tag.color + '20', color: nt.tag.color }}>
                        {nt.tag.name}
                      </span>
                    ))}
                  </div>
                )}
              </CardHeader>
              <CardContent className="px-4 pb-4" onClick={() => setViewNote(note)}>
                <p className="text-xs text-muted-foreground line-clamp-4">{note.content}</p>
                <p className="text-[10px] text-muted-foreground mt-2">{note.author?.name} · {timeAgo(note.updatedAt)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit form */}
      <NoteFormDialog
        open={showForm || !!editNote}
        note={editNote}
        tags={tags ?? []}
        onClose={() => { setShowForm(false); setEditNote(null); }}
        onSubmit={async (data: any) => {
          if (editNote) {
            await updateNote.mutateAsync({ noteId: editNote.id, data });
            toast({ title: 'Note updated' });
          } else {
            await createNote.mutateAsync(data);
            toast({ title: 'Note created' });
          }
          setShowForm(false); setEditNote(null);
        }}
        loading={createNote.isPending || updateNote.isPending}
      />

      {/* View note */}
      {viewNote && (
        <Dialog open onOpenChange={() => setViewNote(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{viewNote.title}</DialogTitle>
            </DialogHeader>
            {viewNote.tags && viewNote.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {viewNote.tags.map((nt) => (
                  <span key={nt.tagId} className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: nt.tag.color + '20', color: nt.tag.color }}>
                    {nt.tag.name}
                  </span>
                ))}
              </div>
            )}
            <MarkdownPreview content={viewNote.content} />
            <p className="text-xs text-muted-foreground">{viewNote.author?.name} · {timeAgo(viewNote.updatedAt)}</p>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function NoteFormDialog({ open, note, tags, onClose, onSubmit, loading }: any) {
  const [title, setTitle] = useState(note?.title ?? '');
  const [content, setContent] = useState(note?.content ?? '');
  const [isPinned, setIsPinned] = useState(note?.isPinned ?? false);
  const [selectedTags, setSelectedTags] = useState<string[]>(note?.tags?.map((t: any) => t.tagId) ?? []);
  const [preview, setPreview] = useState(false);
  const createTag = useCreateTag();
  const [newTag, setNewTag] = useState('');

  // Reset when note changes
  useState(() => {
    setTitle(note?.title ?? '');
    setContent(note?.content ?? '');
    setIsPinned(note?.isPinned ?? false);
    setSelectedTags(note?.tags?.map((t: any) => t.tagId) ?? []);
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit({ title, content, isPinned, tagIds: selectedTags });
  }

  async function handleCreateTag() {
    if (!newTag.trim()) return;
    const tag = await createTag.mutateAsync({ name: newTag.trim() });
    setSelectedTags([...selectedTags, tag.id]);
    setNewTag('');
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{note ? 'Edit Note' : 'New Note'}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>Content (Markdown)</Label>
              <button type="button" onClick={() => setPreview(!preview)} className="text-xs text-muted-foreground flex items-center gap-1">
                {preview ? <Edit size={12} /> : <Eye size={12} />} {preview ? 'Edit' : 'Preview'}
              </button>
            </div>
            {preview ? (
              <div className="border rounded-md p-3 min-h-[200px]"><MarkdownPreview content={content} /></div>
            ) : (
              <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={8} placeholder="# My Note&#10;&#10;Write in **Markdown**..." required />
            )}
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((tag: any) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => setSelectedTags(selectedTags.includes(tag.id) ? selectedTags.filter((t) => t !== tag.id) : [...selectedTags, tag.id])}
                  className={cn('flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-colors', selectedTags.includes(tag.id) ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-accent')}
                >
                  {tag.name}
                  {selectedTags.includes(tag.id) && <X size={10} />}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="New tag name" className="h-8 text-xs" />
              <Button type="button" variant="outline" size="sm" onClick={handleCreateTag}>Add</Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="pinned" checked={isPinned} onChange={(e) => setIsPinned(e.target.checked)} className="rounded" />
            <Label htmlFor="pinned" className="cursor-pointer">Pin this Blog</Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : note ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
