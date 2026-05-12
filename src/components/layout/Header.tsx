'use client';

import { useAuth } from '@/hooks/use-auth';
import { useUnreadCount, useNotifications, useMarkAllRead } from '@/hooks/use-queries';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Bell, LogOut, Moon, Sun, Menu } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { timeAgo } from '@/lib/utils';
import { useUIStore } from '@/store/ui.store';

export function Header() {
  const { user, logout } = useAuth();
  const { data: countData } = useUnreadCount();
  const { data: notifications } = useNotifications();
  const markAllRead = useMarkAllRead();
  const { theme, setTheme } = useTheme();
  const [notifOpen, setNotifOpen] = useState(false);
  const { toggleSidebar } = useUIStore();

  const unread = countData?.count ?? 0;
  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) ?? '?';

  return (
    <header className="h-14 bg-glass border-b border-[var(--glass-border)] flex items-center justify-between px-6 gap-4 shrink-0 shadow-sm sticky top-0 z-50">
      <button onClick={toggleSidebar} className="p-2 rounded-lg hover:bg-accent/50 transition-colors" aria-label="Toggle sidebar">
        <Menu size={18} />
      </button>

      <div className="flex items-center gap-2 ml-auto">
        {/* Dark mode toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle theme"
        >
          <Sun size={16} className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon size={16} className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        {/* Notifications */}
        <div className="relative">
          <Button variant="ghost" size="icon" onClick={() => setNotifOpen(!notifOpen)} aria-label="Notifications">
            <Bell size={16} />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-bold">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </Button>

          {notifOpen && (
            <div className="absolute right-0 top-10 w-80 bg-background border rounded-lg shadow-lg z-50">
              <div className="flex items-center justify-between p-3 border-b">
                <span className="font-semibold text-sm">Notifications</span>
                {unread > 0 && (
                  <button onClick={() => markAllRead.mutate()} className="text-xs text-primary hover:underline">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {!notifications?.length ? (
                  <p className="text-sm text-muted-foreground p-4 text-center">No notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className={cn('p-3 border-b last:border-0 hover:bg-accent/50', !n.read && 'bg-primary/5')}>
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>
                      <p className="text-xs text-muted-foreground mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User */}
        {user && (
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium hidden sm:block">{user.name}</span>
            <Button variant="ghost" size="icon" onClick={logout} aria-label="Sign out">
              <LogOut size={16} />
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
