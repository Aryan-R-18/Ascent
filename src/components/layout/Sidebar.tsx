'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useClubs } from '@/hooks/use-queries';
import { useClub } from '@/hooks/use-club';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Users, Calendar, CheckSquare,
  FileText, Bell, ChevronDown, Building2, Activity
} from 'lucide-react';
import { useState } from 'react';

const navItems = (clubId: string) => [
  { href: `/dashboard/${clubId}`, label: 'Dashboard', icon: LayoutDashboard },
  { href: `/meetings/${clubId}`, label: 'Meetings', icon: Calendar },
  { href: `/tasks/${clubId}`, label: 'Tasks', icon: CheckSquare },
  { href: `/updates/${clubId}`, label: 'Daily Updates', icon: Bell },
  { href: `/notes/${clubId}`, label: 'Notes', icon: FileText },
  { href: `/activity/${clubId}`, label: 'Activity', icon: Activity },
  { href: `/clubs/${clubId}/members`, label: 'Members', icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: clubs } = useClubs();
  const { clubId } = useClub();
  const [clubsOpen, setClubsOpen] = useState(false);

  const activeClub = clubs?.find((c) => c.id === clubId) ?? clubs?.[0];
  const activeClubId = activeClub?.id ?? '';

  return (
    <aside className="h-full w-60 bg-glass text-sidebar-foreground border-r border-[var(--glass-border)] shadow-md flex flex-col shrink-0 rounded-r-2xl overflow-hidden backdrop-blur-2xl">
      {/* Logo */}
      <div className="p-6 border-b border-[var(--glass-border)]/30 relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -z-10 animate-float" />
        <Link href="/clubs" className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
            <Building2 size={14} className="text-primary-foreground" />
          </div>
          <span className="font-bold text-lg">ClubSync</span>
        </Link>
      </div>

      {/* Club switcher */}
      {clubs && clubs.length > 0 && (
        <div className="p-2 border-b border-sidebar-border">
          <button
            onClick={() => setClubsOpen(!clubsOpen)}
            className="w-full flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-white/10 text-sm transition-colors"
          >
            <span className="truncate font-medium">{activeClub?.name ?? 'Select club'}</span>
            <ChevronDown size={14} className={cn('transition-transform', clubsOpen && 'rotate-180')} />
          </button>
          {clubsOpen && (
            <div className="mt-1 space-y-0.5">
              {clubs.map((c) => (
                <Link
                  key={c.id}
                  href={`/dashboard/${c.id}`}
                  onClick={() => setClubsOpen(false)}
                  className={cn(
                    'block px-2 py-1.5 rounded-md text-xs transition-colors',
                    c.id === activeClubId ? 'bg-white/20 font-medium' : 'hover:bg-white/10'
                  )}
                >
                  {c.name}
                </Link>
              ))}
              <Link
                href="/clubs"
                onClick={() => setClubsOpen(false)}
                className="block px-2 py-1.5 rounded-md text-xs text-sidebar-foreground/60 hover:bg-white/10"
              >
                + All clubs
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Nav */}
      {activeClubId && (
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {navItems(activeClubId).map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors',
                pathname === href || pathname.startsWith(href + '/')
                  ? 'bg-white/20 font-medium'
                  : 'text-sidebar-foreground/70 hover:bg-white/10 hover:text-sidebar-foreground'
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>
      )}

      {!activeClubId && (
        <div className="flex-1 p-4">
          <Link href="/clubs" className="flex items-center gap-2 text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground">
            <Users size={16} />
            View all clubs
          </Link>
        </div>
      )}
    </aside>
  );
}
