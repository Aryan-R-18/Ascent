'use client';

import { useDashboard } from '@/hooks/use-queries';
import { useClub } from '@/hooks/use-club';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDateTime, timeAgo, cn } from '@/lib/utils';
import { Calendar, CheckSquare, Users, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import type { TaskStatus } from '@/types';

const statusColors: Record<TaskStatus, string> = {
  TODO: 'secondary',
  IN_PROGRESS: 'default',
  DONE: 'success',
  CANCELLED: 'destructive',
} as any;

const priorityColors = { HIGH: 'destructive', MEDIUM: 'warning', LOW: 'secondary' } as const;

export default function DashboardPage() {
  const { clubId, club } = useClub();
  const { data, isLoading } = useDashboard(clubId);

  if (isLoading) return <DashboardSkeleton />;
  if (!data) return null;

  const taskStatusMap = Object.fromEntries(data.taskStats.map((s) => [s.status, s.count]));

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">{club?.name}</h1>
        <p className="text-muted-foreground text-sm mt-1">Welcome back — here's what's happening</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Members', value: data.memberCount, icon: Users, color: 'text-blue-500' },
          { label: 'Upcoming Meetings', value: data.upcomingMeetings.length, icon: Calendar, color: 'text-purple-500' },
          { label: 'My Open Tasks', value: data.myTasks.length, icon: CheckSquare, color: 'text-orange-500' },
          { label: 'Done Tasks', value: taskStatusMap['DONE'] ?? 0, icon: TrendingUp, color: 'text-green-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className={cn('p-2 rounded-lg bg-muted', color)}>
                <Icon size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Meetings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar size={16} /> Upcoming Meetings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.upcomingMeetings.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming meetings</p>
            ) : (
              <ul className="space-y-3">
                {data.upcomingMeetings.map((m) => (
                  <li key={m.id}>
                    <Link href={`/meetings/${clubId}`} className="flex items-start gap-3 hover:bg-accent/50 rounded-md p-2 -mx-2 transition-colors">
                      <div className="p-1.5 bg-primary/10 rounded-md shrink-0">
                        <Calendar size={14} className="text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{m.title}</p>
                        <p className="text-xs text-muted-foreground">{formatDateTime(m.scheduledAt)}</p>
                        {m.location && <p className="text-xs text-muted-foreground">{m.location}</p>}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* My Tasks */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckSquare size={16} /> My Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.myTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No open tasks assigned to you</p>
            ) : (
              <ul className="space-y-2">
                {data.myTasks.map((t) => (
                  <li key={t.id}>
                    <Link href={`/tasks/${clubId}`} className="flex items-center justify-between hover:bg-accent/50 rounded-md p-2 -mx-2 transition-colors">
                      <div className="flex items-center gap-2 min-w-0">
                        {t.dueDate && new Date(t.dueDate) < new Date() && (
                          <AlertCircle size={14} className="text-destructive shrink-0" />
                        )}
                        <p className="text-sm truncate">{t.title}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        <Badge variant={priorityColors[t.priority] as any} className="text-[10px] px-1.5 py-0">
                          {t.priority}
                        </Badge>
                        {t.dueDate && (
                          <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                            <Clock size={10} /> {timeAgo(t.dueDate)}
                          </span>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Updates + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Daily Updates</CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentUpdates.length === 0 ? (
              <p className="text-sm text-muted-foreground">No updates yet</p>
            ) : (
              <ul className="space-y-3">
                {data.recentUpdates.map((u) => (
                  <li key={u.id} className="flex gap-3">
                    <Avatar className="h-7 w-7 shrink-0">
                      <AvatarImage src={u.author?.avatarUrl} />
                      <AvatarFallback className="text-[10px]">{u.author?.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-xs font-medium">{u.author?.name} <span className="text-muted-foreground font-normal">· {timeAgo(u.date)}</span></p>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">{u.content}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity yet</p>
            ) : (
              <ul className="space-y-2">
                {data.recentActivity.map((a) => (
                  <li key={a.id} className="flex items-start gap-2">
                    <Avatar className="h-6 w-6 shrink-0 mt-0.5">
                      <AvatarImage src={a.user?.avatarUrl} />
                      <AvatarFallback className="text-[9px]">{a.user?.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-xs">
                        <span className="font-medium">{a.user?.name}</span>{' '}
                        <span className="text-muted-foreground">{a.action.replace(/_/g, ' ')}</span>
                      </p>
                      <p className="text-[10px] text-muted-foreground">{timeAgo(a.createdAt)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    </div>
  );
}
