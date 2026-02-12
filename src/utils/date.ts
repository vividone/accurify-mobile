import {
  format,
  formatDistanceToNow,
  parseISO,
  isValid,
  differenceInDays,
} from 'date-fns';

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '-';
  return format(d, 'dd MMM yyyy');
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '-';
  return format(d, 'dd MMM yyyy, HH:mm');
}

export function formatRelative(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '-';
  return formatDistanceToNow(d, { addSuffix: true });
}

export function toISODateString(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function getDefaultDueDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 14);
  return toISODateString(date);
}

export function getTodayString(): string {
  return toISODateString(new Date());
}

export function getDaysUntil(date: string | Date): number {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return 0;
  return differenceInDays(d, new Date());
}

/**
 * Convert a Date object from Carbon DatePicker to ISO date string (yyyy-MM-dd).
 * This is timezone-safe - it uses the local date components rather than UTC.
 *
 * IMPORTANT: Use this instead of date.toISOString().split('T')[0] which can
 * shift dates by one day due to UTC conversion.
 */
export function datePickerToISO(date: Date | null | undefined): string {
  if (!date || !isValid(date)) return '';
  return format(date, 'yyyy-MM-dd');
}
