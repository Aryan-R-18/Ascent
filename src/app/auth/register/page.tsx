'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { usePublicClubs, useRequestToJoin } from '@/hooks/use-queries';
import { Building2, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

export default function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const router = useRouter();
  
  // Owner Registration State
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [showOwnerPassword, setShowOwnerPassword] = useState(false);
  const [ownerError, setOwnerError] = useState('');
  const [ownerLoading, setOwnerLoading] = useState(false);

  // Member Registration State
  const { data: clubs, isLoading: loadingClubs } = usePublicClubs();
  const requestToJoin = useRequestToJoin();
  const [selectedClub, setSelectedClub] = useState<string>('');
  const [memberName, setMemberName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [memberPassword, setMemberPassword] = useState('');
  const [showMemberPassword, setShowMemberPassword] = useState(false);
  const [memberError, setMemberError] = useState('');

  if (isAuthenticated) {
    router.replace('/clubs');
    return null;
  }

  // Helpers for password strength
  const getStrength = (pw: string) => pw.length === 0 ? null : pw.length < 8 ? 'weak' : pw.length < 12 ? 'good' : 'strong';
  const strengthColor = { weak: 'bg-destructive', good: 'bg-yellow-500', strong: 'bg-green-500' };
  const strengthWidth = { weak: 'w-1/3', good: 'w-2/3', strong: 'w-full' };

  const ownerPwStrength = getStrength(ownerPassword);
  const memberPwStrength = getStrength(memberPassword);

  async function handleOwnerSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (ownerPassword.length < 8) {
      setOwnerError('Password must be at least 8 characters');
      return;
    }
    setOwnerError('');
    setOwnerLoading(true);
    try {
      await register(ownerEmail, ownerPassword, ownerName);
    } catch (err: any) {
      setOwnerError(err?.response?.data?.error ?? 'Registration failed. Try again.');
    } finally {
      setOwnerLoading(false);
    }
  }

  async function handleMemberSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedClub) {
      setMemberError('Please select a club first');
      return;
    }
    if (memberPassword.length < 8) {
      setMemberError('Password must be at least 8 characters');
      return;
    }
    setMemberError('');
    
    try {
       await requestToJoin.mutateAsync({ 
          name: memberName, 
          email: memberEmail, 
          password: memberPassword,
          clubId: selectedClub 
       }, {
         onSuccess: () => {
           toast({ title: 'Request Sent', description: 'Once approved, you can login.' });
           setMemberName('');
           setMemberEmail('');
           setMemberPassword('');
           router.push('/auth/login');
         }
       });
    } catch (err: any) {
       setMemberError(err?.response?.data?.error ?? 'Failed to submit request');
    }
  }

  return (
    <div className="min-h-screen flex py-16 items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <Building2 size={18} className="text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold">ClubSync</span>
        </div>

        {/* Card */}
        <div className="bg-card border rounded-xl shadow-sm p-8">
          <h1 className="text-xl font-semibold mb-1">Create your account</h1>
          <p className="text-sm text-muted-foreground mb-6">Choose how you want to join</p>

          <Tabs defaultValue="member" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="member">Join a Club</TabsTrigger>
              <TabsTrigger value="owner">Create a Club</TabsTrigger>
            </TabsList>

            {/* MEMBER TAB */}
            <TabsContent value="member">
               {memberError && (
                <div className="mb-4 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  {memberError}
                </div>
               )}
               <form onSubmit={handleMemberSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Select a Club</label>
                    <Select value={selectedClub} onValueChange={setSelectedClub} required>
                       <SelectTrigger>
                          <SelectValue placeholder={loadingClubs ? "Loading clubs..." : "Choose a club"} />
                       </SelectTrigger>
                       <SelectContent>
                          {clubs?.map(club => (
                             <SelectItem key={club.id} value={club.id}>{club.name}</SelectItem>
                          ))}
                       </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Full Name</label>
                    <input type="text" value={memberName} onChange={e => setMemberName(e.target.value)} required 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Email</label>
                    <input type="email" value={memberEmail} onChange={e => setMemberEmail(e.target.value)} required 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Password</label>
                    <div className="relative">
                      <input type={showMemberPassword ? 'text' : 'password'} value={memberPassword} onChange={e => setMemberPassword(e.target.value)} required minLength={8}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
                      <button type="button" onClick={() => setShowMemberPassword(!showMemberPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showMemberPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {memberPwStrength && (
                      <div className="space-y-1 mt-2">
                        <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${strengthColor[memberPwStrength]} ${strengthWidth[memberPwStrength]}`} />
                        </div>
                      </div>
                    )}
                  </div>

                  <button type="submit" disabled={requestToJoin.isPending}
                    className="w-full mt-2 h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    {requestToJoin.isPending ? 'Sending...' : 'Request to Join'}
                  </button>
               </form>
            </TabsContent>

            {/* OWNER TAB */}
            <TabsContent value="owner">
              {ownerError && (
                <div className="mb-4 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  {ownerError}
                </div>
              )}
              <form onSubmit={handleOwnerSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium" htmlFor="name">Full Name</label>
                  <input id="name" type="text" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} required autoComplete="name"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium" htmlFor="email">Email</label>
                  <input id="email" type="email" value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} required autoComplete="email"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium" htmlFor="password">Password</label>
                  <div className="relative">
                    <input id="password" type={showOwnerPassword ? 'text' : 'password'} value={ownerPassword} onChange={(e) => setOwnerPassword(e.target.value)} required minLength={8} autoComplete="new-password"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
                    <button type="button" onClick={() => setShowOwnerPassword(!showOwnerPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showOwnerPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {ownerPwStrength && (
                    <div className="space-y-1 mt-2">
                      <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${strengthColor[ownerPwStrength]} ${strengthWidth[ownerPwStrength]}`} />
                      </div>
                    </div>
                  )}
                </div>

                <div className="rounded-lg bg-muted/50 p-3 space-y-1.5">
                  {['Create and manage clubs', 'Be the Club Coordinator', 'Approve joining requests'].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 size={13} className="text-primary shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>

                <button type="submit" disabled={ownerLoading}
                  className="w-full h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {ownerLoading && <Loader2 size={15} className="animate-spin" />}
                  {ownerLoading ? 'Creating account...' : 'Create coordinator account'}
                </button>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        <p className="text-sm text-center mt-4 text-muted-foreground">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
