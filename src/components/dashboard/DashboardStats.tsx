import type { DashboardData } from '@/types';
import { Users, Calendar, CheckSquare } from 'lucide-react';

export function DashboardStats({ data }: { data: DashboardData }) {
  const stats = [
    { label: 'Members', value: data.memberCount, icon: Users },
    { label: 'Upcoming Meetings', value: data.upcomingMeetings.length, icon: Calendar },
    { label: 'Open Tasks', value: data.myTasks.length, icon: CheckSquare },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map(({ label, value, icon: Icon }) => (
        <div key={label} className="bg-white rounded-xl border p-5 flex items-center gap-4">
          <div className="p-2 bg-primary-50 rounded-lg">
            <Icon size={20} className="text-primary-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
