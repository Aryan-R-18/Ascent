import type { Task } from '@/types';
import { useDeleteTask, useUpdateTask } from '@/hooks/use-queries';
import { cn } from '@/lib/utils';
import { Trash2 } from 'lucide-react';

const statusColors: Record<string, string> = {
  TODO: 'bg-gray-100 text-gray-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  DONE: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export function TaskList({ tasks, clubId }: { tasks: Task[]; clubId: string }) {
  const deleteTask = useDeleteTask(clubId);
  const updateTask = useUpdateTask(clubId);

  if (tasks.length === 0) return <p className="text-gray-400 text-sm">No tasks yet.</p>;

  return (
    <ul className="space-y-3">
      {tasks.map((t) => (
        <li key={t.id} className="bg-white rounded-xl border p-4 flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-medium text-sm">{t.title}</p>
              <span className={cn('text-xs px-2 py-0.5 rounded-full', statusColors[t.status])}>
                {t.status.replace('_', ' ')}
              </span>
            </div>
            {t.assignee && <p className="text-xs text-gray-400">Assigned to {t.assignee.name}</p>}
          </div>
          <div className="flex items-center gap-2">
            <select
              value={t.status}
              onChange={(e) => updateTask.mutate({ taskId: t.id, data: { status: e.target.value as Task['status'] } })}
              className="text-xs border rounded px-1 py-0.5"
            >
              <option value="TODO">Todo</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <button
              onClick={() => deleteTask.mutate(t.id)}
              className="text-gray-400 hover:text-red-500 p-1"
              aria-label="Delete task"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
