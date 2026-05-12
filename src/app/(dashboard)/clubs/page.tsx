'use client';

import { useState } from 'react';
import { useClubs, useCreateClub } from '@/hooks/use-queries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Users, Calendar, CheckSquare, Building2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/utils';

const roleVariant = { OWNER: 'default', ADMIN: 'secondary', CORE_MEMBER: 'outline', MEMBER: 'outline' } as const;

export default function ClubsPage() {
  const { data: clubs, isLoading } = useClubs();
  const createClub = useCreateClub();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await createClub.mutateAsync({ name, description: description || undefined });
    setName(''); setDescription(''); setShowForm(false);
    toast({ title: 'Club created' });
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">My Clubs</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your club memberships</p>
        </div>
        <Button onClick={() => setShowForm(true)}><Plus size={16} /> New Club</Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48" />)}
        </div>
      ) : clubs?.length === 0 ? (
        <div className="text-center py-20">
          <Building2 size={48} className="mx-auto mb-4 text-muted-foreground/30" />
          <p className="text-muted-foreground mb-4">You're not in any clubs yet</p>
          <Button onClick={() => setShowForm(true)}><Plus size={16} /> Create your first club</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clubs?.map((club) => (
            <Link key={club.id} href={`/dashboard/${club.id}`}>
              <Card className="hover:shadow-md transition-all hover:-translate-y-0.5 h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{club.name}</CardTitle>
                    {club.role && <Badge variant={roleVariant[club.role] as any} className="text-xs shrink-0">{club.role.replace('_', ' ')}</Badge>}
                  </div>
                  {club.description && <CardDescription className="line-clamp-2">{club.description}</CardDescription>}
                </CardHeader>
                <CardContent>
                  {club._count && (
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Users size={12} /> {club._count.members}</span>
                      <span className="flex items-center gap-1"><Calendar size={12} /> {club._count.meetings}</span>
                      <span className="flex items-center gap-1"><CheckSquare size={12} /> {club._count.tasks}</span>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">Created {formatDate(club.createdAt)}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Club</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Club Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Tech Club" required />
            </div>
            <div className="space-y-1.5">
              <Label>Description (optional)</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What's this club about?" rows={3} />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" disabled={createClub.isPending}>{createClub.isPending ? 'Creating...' : 'Create Club'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
