'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { usePublicClubs, useRequestToJoin } from '@/hooks/use-queries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, Users, Rocket, Target, Zap, ChevronRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Footer } from '@/components/layout/Footer';

const itemVariants: any = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};
const containerVariants: any = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } }
};

export default function ExplorePage() {
  const { data: clubs, isLoading } = usePublicClubs();
  const requestToJoin = useRequestToJoin();
  const [selectedClub, setSelectedClub] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { scrollYProgress } = useScroll();
  const yBg = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  async function handleJoinSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedClub) return;
    
    try {
      await requestToJoin.mutateAsync({ name, email, password, clubId: selectedClub }, {
         onSuccess: () => {
           toast({ title: 'Join request submitted', description: 'Wait for the coordinator to approve.' });
           setSelectedClub(null);
           setName(''); setEmail(''); setPassword('');
         }
      });
    } catch (err: any) {
      toast({ title: 'Error', description: err?.response?.data?.error || 'Failed to submit request', variant: 'destructive' });
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden selection:bg-primary/30">
      {/* Dynamic Background Pattern */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20 dark:opacity-10 mix-blend-color-dodge filter blur-[100px]">
         <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary rounded-full animate-pulse" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-emerald-600 rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <header className="relative z-50 border-b border-primary/10 bg-background/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg text-primary-foreground shadow-[0_0_15px_rgba(34,139,34,0.4)]">
              <Building2 size={20} />
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white to-gray-400 dark:from-white dark:to-gray-500 bg-clip-text text-transparent">ClubSync</span>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
            <Link href="/auth/login"><Button variant="ghost" className="rounded-full">Sign in</Button></Link>
            <Link href="/auth/register" className="hidden sm:inline-block"><Button className="rounded-full shadow-[0_0_15px_rgba(34,139,34,0.4)] hover:shadow-[0_0_25px_rgba(34,139,34,0.6)] transition-all">Register as Coordinator</Button></Link>
          </motion.div>
        </div>
      </header>

      <main className="relative z-10 w-full">
        {/* Animated Hero Section */}
        <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
          <motion.div style={{ y: yBg }} className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(34,139,34,0.15)_0,transparent_50%)]" />
          
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-4xl mx-auto z-10">
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
              <Zap size={14} className="fill-primary" />
              <span>Next Generation Club Operations</span>
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-black mb-6 tracking-tighter leading-[1.1]">
              Synchronize your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">Ambitions.</span>
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              The ultimate platform to orchestrate club activities, delegate tasks, log minutes of meetings, and foster incredible collaboration securely.
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="rounded-full h-14 px-8 text-lg font-semibold shadow-[0_0_20px_rgba(34,139,34,0.3)] group" onClick={() => document.getElementById('explore')?.scrollIntoView({ behavior: 'smooth' })}>
                Explore Clubs <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </motion.div>
        </section>

        {/* Explore Clubs Section */}
        <section id="explore" className="max-w-6xl mx-auto px-4 py-24">
          <div className="mb-16 text-center">
             <h2 className="text-3xl md:text-5xl font-extrabold mb-4">Discover Communities</h2>
             <div className="h-1 w-20 bg-primary mx-auto rounded-full" />
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>
          ) : clubs?.length === 0 ? (
            <div className="text-center py-16 bg-card/40 backdrop-blur-sm rounded-2xl border border-primary/10">
              <Rocket size={48} className="mx-auto mb-4 text-primary opacity-50" />
              <p className="text-xl text-muted-foreground font-medium">No clubs found. Be the first vanguard to create one!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {clubs?.map((club, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 50 }} 
                  whileInView={{ opacity: 1, y: 0 }} 
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  key={club.id}
                >
                  <Card className="h-full bg-card/40 backdrop-blur-md border-primary/20 hover:border-primary/50 hover:shadow-[0_0_30px_rgba(34,139,34,0.15)] transition-all overflow-hidden relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardHeader>
                      <CardTitle className="text-2xl font-bold">{club.name}</CardTitle>
                      {club.description && <CardDescription className="line-clamp-2 mt-2 text-sm">{club.description}</CardDescription>}
                    </CardHeader>
                    <CardContent className="mt-auto">
                      <div className="flex items-center justify-between pt-4 border-t border-primary/10">
                        <div className="flex items-center gap-2 text-sm font-medium text-foreground/80 bg-primary/10 px-3 py-1 rounded-full">
                          <Users size={16} className="text-primary" />
                          <span>{club._count?.members || 0}</span>
                        </div>
                        <Button className="rounded-full transition-transform active:scale-95" onClick={() => setSelectedClub(club.id)}>
                          Join Request
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Professional Full Footer */}
      <div className="relative z-10">
        <Footer />
      </div>

      {/* Join Request Modal */}
      <Dialog open={!!selectedClub} onOpenChange={(open) => !open && setSelectedClub(null)}>
        <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-emerald-400">Verify Identity</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleJoinSubmit} className="space-y-5 mt-4">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">Full Name</Label>
              <Input required value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" className="h-12 bg-background/50 focus:bg-background transition-colors" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">Email</Label>
              <Input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="john@example.com" className="h-12 bg-background/50" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">Password</Label>
              <Input required type="password" minLength={8} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 8 characters" className="h-12 bg-background/50" />
            </div>
            <div className="pt-4 flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setSelectedClub(null)}>Cancel</Button>
              <Button type="submit" disabled={requestToJoin.isPending} className="shadow-[0_0_15px_rgba(34,139,34,0.3)] font-bold">
                {requestToJoin.isPending ? 'Intializing...' : 'Submit Request'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
