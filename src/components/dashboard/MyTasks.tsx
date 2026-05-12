import type { Task } from '@/types';
import { cn } from '@/lib/utils';

const priorityColors: Record<string, string> = {
  HIGH: 'text-red-600 bg-red-50',
  MEDIUM: 'text-yellow-600 bg-yellow-50',
  LOW: 'text-green-600 bg-green-50',
};

export function MyTasks({ tasks }: { tasks: Task[] }) {
  return (
    <div className="bg-white rounded-xl border p-5">
      <h2 className="font-semibold mb-4">My Tasks</h2>
      {tasks.length === 0 ? (
        <p className="text-sm text-gray-400">No open tasks</p>
      ) : (
        <ul className="space-y-2">
          {tasks.map((t) => (
            <li key={t.id} className="flex items-center justify-between">
              <p className="text-sm">{t.title}</p>
              <span className={cn('text-xs px-2 py-0.5 rounded-full', priorityColors[t.priority])}>
                {t.priority}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
