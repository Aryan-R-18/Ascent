'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Building2, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';

export default function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', clubName: '', clubDescription: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) router.replace('/clubs');
  }, [isAuthenticated, router]);

  if (isAuthenticated) return null;

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (!form.clubName.trim()) { setError('Club name is required'); return; }
    setError('');
    setLoading(true);
    try {
      await register(form.email, form.password, form.name, form.clubName, form.clubDescription || undefined);
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Registration failed. Try again.');
    } finally {
      setLoading(false);
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

        <div className="bg-card border rounded-xl shadow-sm p-8">
          <h1 className="text-xl font-semibold mb-1">Create your club</h1>
          <p className="text-sm text-muted-foreground mb-6">You'll be the coordinator (owner) of this club</p>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Club details */}
            <div className="p-3 bg-muted/40 rounded-lg space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Club Details</p>
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="clubName">Club Name</label>
                <input id="clubName" type="text" value={form.clubName} onChange={set('clubName')}
                  placeholder="e.g. Tech Club, Robotics Society" required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="clubDesc">Description (optional)</label>
                <input id="clubDesc" type="text" value={form.clubDescription} onChange={set('clubDescription')}
                  placeholder="What's this club about?"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              </div>
            </div>

            {/* Account details */}
            <div className="p-3 bg-muted/40 rounded-lg space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Your Account</p>
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="name">Full Name</label>
                <input id="name" type="text" value={form.name} onChange={set('name')}
                  placeholder="Alice Johnson" required autoComplete="name"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="email">Email</label>
                <input id="email" type="email" value={form.email} onChange={set('email')}
                  placeholder="you@example.com" required autoComplete="email"
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
            </div>

            <button type="submit" disabled={loading}
              className="w-full h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">
              {loading && <Loader2 size={15} className="animate-spin" />}
              {loading ? 'Creating...' : 'Create Club & Account'}
            </button>
          </form>
        </div>

        <p className="text-sm text-center mt-4 text-muted-foreground">
          Want to join an existing club?{' '}
          <Link href="/auth/join" className="text-primary font-medium hover:underline">Request to join</Link>
        </p>
      </div>
    </div>
  );
}
