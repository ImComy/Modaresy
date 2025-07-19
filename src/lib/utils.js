import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
	return twMerge(clsx(inputs));
}

export function formatRelativeTime (isoDate, t) {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return t('time.minutesAgo', { count: mins });
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return t('time.hoursAgo', { count: hrs });
  const days = Math.floor(hrs / 24);
  return t('time.daysAgo', { count: days });
};
