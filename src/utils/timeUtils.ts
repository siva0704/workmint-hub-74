import { format, formatDistanceToNow, parseISO } from 'date-fns';
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
 * Format date for recent activity display
 */
export const formatActivityTime = (date: Date | string): string => {
  const indianDate = toIndianTime(date);
  const now = new Date();
  const diffInHours = (now.getTime() - indianDate.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 1) {
    const diffInMinutes = Math.floor((now.getTime() - indianDate.getTime()) / (1000 * 60));
    return `${diffInMinutes} minutes ago`;
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)} hours ago`;
  } else if (diffInHours < 168) { // 7 days
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  } else {
    return formatIndianTime(indianDate, 'dd/MM/yyyy');
  }
};

/**
 * Get current Indian time
 */
export const getCurrentIndianTime = (): Date => {
  return utcToZonedTime(new Date(), INDIAN_TIMEZONE);
};

/**
 * Format deadline for task display
 */
export const formatDeadline = (date: Date | string): string => {
  const indianDate = toIndianTime(date);
  const now = getCurrentIndianTime();
  const diffInDays = Math.floor((indianDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays < 0) {
    return `Overdue (${Math.abs(diffInDays)} days)`;
  } else if (diffInDays === 0) {
    return 'Due today';
  } else if (diffInDays === 1) {
    return 'Due tomorrow';
  } else if (diffInDays < 7) {
    return `Due in ${diffInDays} days`;
  } else {
    return formatIndianTime(indianDate, 'dd/MM/yyyy');
  }
};

/**
 * Check if a date is overdue
 */
export const isOverdue = (date: Date | string): boolean => {
  const indianDate = toIndianTime(date);
  const now = getCurrentIndianTime();
  return indianDate < now;
};

/**
 * Format timestamp for audit logs
 */
export const formatAuditTimestamp = (date: Date | string): string => {
  return formatIndianTime(date, 'dd/MM/yyyy HH:mm:ss');
};
