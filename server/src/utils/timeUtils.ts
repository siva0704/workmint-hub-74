import { format, formatDistanceToNow } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';

// Indian timezone
export const INDIAN_TIMEZONE = 'Asia/Kolkata';

/**
 * Convert UTC date to Indian time
 */
export const toIndianTime = (date: Date | string): Date => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return utcToZonedTime(dateObj, INDIAN_TIMEZONE);
};

/**
 * Format date in Indian timezone
 */
export const formatIndianTime = (date: Date | string, formatStr: string = 'dd/MM/yyyy HH:mm'): string => {
  const indianDate = toIndianTime(date);
  return format(indianDate, formatStr);
};

/**
 * Format relative time (e.g., "2 hours ago") in Indian timezone
 */
export const formatRelativeTime = (date: Date | string): string => {
  const indianDate = toIndianTime(date);
  return formatDistanceToNow(indianDate, { addSuffix: true });
};

/**
 * Get current Indian time
 */
export const getCurrentIndianTime = (): Date => {
  return utcToZonedTime(new Date(), INDIAN_TIMEZONE);
};

/**
 * Format timestamp for audit logs
 */
export const formatAuditTimestamp = (date: Date | string): string => {
  return formatIndianTime(date, 'dd/MM/yyyy HH:mm:ss');
};

/**
 * Check if a date is overdue
 */
export const isOverdue = (date: Date | string): boolean => {
  const indianDate = toIndianTime(date);
  const now = getCurrentIndianTime();
  return indianDate < now;
};
