import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, isValid } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '—';
  const d = new Date(date);
  if (!isValid(d)) return '—';
  return format(d, 'MMM d, yyyy');
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '—';
  const d = new Date(date);
  if (!isValid(d)) return '—';
  return format(d, 'MMM d, yyyy h:mm a');
}

export function timeAgo(date: string | Date | null | undefined): string {
  if (!date) return '';
  const d = new Date(date);
  if (!isValid(d)) return '';
  return formatDistanceToNow(d, { addSuffix: true });
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
