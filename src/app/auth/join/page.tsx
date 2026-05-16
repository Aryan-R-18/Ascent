'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePublicClubs, useJoinClub } from '@/hooks/use-queries';
import { Building2, Eye, EyeOff, Loader2, ArrowLeft, Users, CheckCircle2 } from 'lucide-react';

export default function JoinPage() {
  const { data: clubs, isLoading: loadingClubs } = usePublicClubs();
  const joinClub = useJoinClub();
  const [step, setStep] = useState<'pick' | 'form' | 'done'>('pick');
  const [selectedClub, setSelectedClub] = useState<{ id: string; name: string } | null>(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', message: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setError('');
    try {
      await joinClub.mutateAsync({
        clubId: selectedClub!.id,
        data: { name: form.name, email: form.email, password: form.password, message: form.message || undefined },
      });
      setStep('done');
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Failed to submit request. Try again.');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft size={14} /> Back
        </Link>

        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <Building2 size={18} className="text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold">ClubSync</span>
        </div>

        {/* Step: Done */}
        {step === 'done' && (
          <div className="bg-card border rounded-xl shadow-sm p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={28} className="text-green-600" />
            </div>
            <h1 className="text-xl font-semibold mb-2">Request Sent!</h1>
            <p className="text-sm text-muted-foreground mb-6">
              Your request to join <span className="font-medium text-foreground">{selectedClub?.name}</span> has been submitted.
              The coordinator will review it and you'll be able to log in once approved.
            </p>
            <Link href="/auth/login"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
              Go to Login
            </Link>
          </div>
        )}

        {/* Step: Pick club */}
        {step === 'pick' && (
          <div className="bg-card border rounded-xl shadow-sm p-8">
            <h1 className="text-xl font-semibold mb-1">Join a Club</h1>
            <p className="text-sm text-muted-foreground mb-6">Select the club you want to join</p>

            {loadingClubs ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : clubs?.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No clubs available yet.</p>
            ) : (
              <div className="space-y-2">
                {clubs?.map((club) => (
                  <button key={club.id} onClick={() => { setSelectedClub(club); setStep('form'); }}
                    className="w-full text-left p-4 border rounded-lg hover:bg-accent hover:border-primary/50 transition-all group">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{club.name}</p>
                        {club.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{club.description}</p>}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users size={12} />
                        {club._count.members}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step: Fill form */}
        {step === 'form' && selectedClub && (
          <div className="bg-card border rounded-xl shadow-sm p-8">
            <button onClick={() => setStep('pick')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
              <ArrowLeft size={14} /> Change club
            </button>
            <h1 className="text-xl font-semibold mb-1">Join {selectedClub.name}</h1>
            <p className="text-sm text-muted-foreground mb-6">Fill in your details — the coordinator will approve your request</p>

            {error && (
              <div className="mb-4 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="name">Full Name</label>
                <input id="name" type="text" value={form.name} onChange={set('name')}
                  placeholder="Your name" required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="email">Email</label>
                <input id="email" type="email" value={form.email} onChange={set('email')}
                  placeholder="you@example.com" required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="password">Password</label>
                <div className="relative">
                  <input id="password" type={showPassword ? 'text' : 'password'} value={form.password}
                    onChange={set('password')} placeholder="Min. 8 characters" required minLength={8}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="message">Message (optional)</label>
                <textarea id="message" value={form.message} onChange={set('message')} rows={2}
                  placeholder="Why do you want to join?"
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none" />
              </div>

              <button type="submit" disabled={joinClub.isPending}
                className="w-full h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">
                {joinClub.isPending && <Loader2 size={15} className="animate-spin" />}
                {joinClub.isPending ? 'Sending...' : 'Send Join Request'}
              </button>
            </form>
          </div>
        )}

        <p className="text-sm text-center mt-4 text-muted-foreground">
          Already approved?{' '}
          <Link href="/auth/login" className="text-primary font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
