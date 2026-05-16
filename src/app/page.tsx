import Link from 'next/link';
import { Building2, Users, Calendar, CheckSquare, Bell, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Building2 size={16} className="text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">ClubSync</span>
          </div>
          <Link href="/auth/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Sign in
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-medium px-3 py-1.5 rounded-full mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          Club management, simplified
        </div>
        <h1 className="text-5xl font-bold tracking-tight mb-6 leading-tight">
          Run your club.<br />
          <span className="text-primary">Not your inbox.</span>
        </h1>
        <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
          ClubSync brings meetings, tasks, daily updates, and member management into one place — so your club actually gets things done.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/auth/register"
            className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors w-full sm:w-auto justify-center"
          >
            Start as Coordinator
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/auth/join"
            className="flex items-center gap-2 border px-6 py-3 rounded-lg font-medium hover:bg-accent transition-colors w-full sm:w-auto justify-center"
          >
            <Users size={16} />
            Join a Club
          </Link>
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-primary hover:underline">Sign in</Link>
        </p>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Calendar, title: 'Meeting Notes', desc: 'Record MoM with discussion points, decisions, and action items in Markdown.' },
            { icon: CheckSquare, title: 'Task Tracking', desc: 'Assign tasks with priorities, deadlines, and track progress with comments.' },
            { icon: Bell, title: 'Daily Updates', desc: 'Members post daily logs. Stay in sync without endless status meetings.' },
            { icon: Users, title: 'Role Management', desc: 'Owner, Admin, Core Member, Member — full RBAC with approval workflows.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-card border rounded-xl p-5">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <Icon size={18} className="text-primary" />
              </div>
              <h3 className="font-semibold mb-1">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} ClubSync. Built for clubs that mean business.
      </footer>
    </div>
  );
}
