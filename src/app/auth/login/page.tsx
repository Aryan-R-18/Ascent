'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/lib/api';
import { Building2, Eye, EyeOff, Loader2 } from 'lucide-react';

function LoginForm() {
  const { login, logout, isAuthenticated } = useAuth();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams?.get('from');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // null = still checking, true = verified, false = stale
  const [sessionValid, setSessionValid] = useState<boolean | null>(isAuthenticated ? null : false);

  useEffect(() => {
    if (!isAuthenticated) {
      setSessionValid(false);
      return;
    }
    // Verify the token is still valid before redirecting
    authApi.me()
      .then(() => {
        const dest = from && !from.startsWith('/auth') ? from : '/clubs';
        router.replace(dest);
        // keep sessionValid as null (spinner) while redirect happens
      })
      .catch(() => {
        // Token is stale — clear persisted auth so the form shows
        clearAuth();
        setSessionValid(false);
      });
  }, []); // run once on mount only

  // Warm up the backend on mount
  useEffect(() => {
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
    fetch(`${BASE_URL}/health`, { method: 'GET' }).catch(() => {});
  }, []);

  if (sessionValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 size={24} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const dest = from && !from.startsWith('/auth') ? from : '/clubs';
      await login(email, password, dest);
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <Building2 size={18} className="text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold">Ascent</span>
        </div>

        <div className="bg-card border rounded-xl shadow-sm p-8">
          <h1 className="text-xl font-semibold mb-1">Welcome back</h1>
          <p className="text-sm text-muted-foreground mb-6">Sign in to your account</p>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="email">Email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" required autoComplete="email"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="password">Password</label>
              <div className="relative">
                <input id="password" type={showPassword ? 'text' : 'password'} value={password}
                  onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required autoComplete="current-password"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">
              {loading && <Loader2 size={15} className="animate-spin" />}
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <button onClick={() => logout()}
            className="w-full mt-3 text-xs text-muted-foreground hover:text-foreground text-center">
            Not you? Sign out and switch account
          </button>
        </div>

        <div className="flex items-center justify-center gap-4 mt-4 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">← Home</Link>
          <span>·</span>
          <Link href="/auth/register" className="text-primary font-medium hover:underline">Create coordinator account</Link>
          <span>·</span>
          <Link href="/auth/join" className="hover:text-foreground">Join a club</Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 size={24} className="animate-spin text-muted-foreground" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
