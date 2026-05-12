import Link from 'next/link';
import type { Club } from '@/types';
import { Users } from 'lucide-react';

export function ClubCard({ club }: { club: Club }) {
  return (
    <Link
      href={`/dashboard/${club.id}`}
      className="block bg-white rounded-xl border p-5 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <h2 className="font-semibold text-gray-900">{club.name}</h2>
        {club.role && (
          <span className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full">
            {club.role}
          </span>
        )}
      </div>
      {club.description && <p className="text-sm text-gray-500 mb-3 line-clamp-2">{club.description}</p>}
      {club._count && (
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Users size={12} />
          {club._count.members} members
        </div>
      )}
    </Link>
  );
}
