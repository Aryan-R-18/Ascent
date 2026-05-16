'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useClubs, useJoinRequests } from '@/hooks/use-queries';
import { useClub } from '@/hooks/use-club';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Users, Calendar, CheckSquare,
  FileText, Bell, ChevronDown, Building2, Activity, UserPlus
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
  { href: `/clubs/${clubId}/join-requests`, label: 'Join Requests', icon: UserPlus, badge: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: clubs } = useClubs();
  const { clubId } = useClub();
  const [clubsOpen, setClubsOpen] = useState(false);
  const { data: joinRequests } = useJoinRequests(clubId);
  const pendingCount = joinRequests?.length ?? 0;

  const activeClub = clubs?.find((c) => c.id === clubId) ?? clubs?.[0];
  const activeClubId = activeClub?.id ?? '';

  return (
    <aside className="h-full w-60 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col shrink-0">
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <Link href="/clubs" className="flex items-center gap-2">
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
                <Link key={c.id} href={`/dashboard/${c.id}`} onClick={() => setClubsOpen(false)}
                  className={cn('block px-2 py-1.5 rounded-md text-xs transition-colors',
                    c.id === activeClubId ? 'bg-white/20 font-medium' : 'hover:bg-white/10')}>
                  {c.name}
                </Link>
              ))}
              <Link href="/clubs" onClick={() => setClubsOpen(false)}
                className="block px-2 py-1.5 rounded-md text-xs text-sidebar-foreground/60 hover:bg-white/10">
                + All clubs
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Nav */}
      {activeClubId && (
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {navItems(activeClubId).map(({ href, label, icon: Icon, badge }) => (
            <Link key={href} href={href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors',
                pathname === href || pathname.startsWith(href + '/')
                  ? 'bg-white/20 font-medium'
                  : 'text-sidebar-foreground/70 hover:bg-white/10 hover:text-sidebar-foreground'
              )}>
              <Icon size={16} />
              <span className="flex-1">{label}</span>
              {badge && pendingCount > 0 && (
                <span className="bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {pendingCount}
                </span>
              )}
            </Link>
          ))}
        </nav>
      )}

      {!activeClubId && (
        <div className="flex-1 p-4">
          <Link href="/clubs" className="flex items-center gap-2 text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground">
            <Users size={16} /> View all clubs
          </Link>
        </div>
      )}
    </aside>
  );
}
