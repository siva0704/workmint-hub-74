import { format, formatDistanceToNow } from 'date-fns';

// Indian timezone
export const INDIAN_TIMEZONE = 'Asia/Kolkata';

/**
 * Convert UTC date to Indian time
 */
export const toIndianTime = (date: Date | string): Date => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  // Convert to Indian time by adding 5:30 hours (IST offset)
  const indianTime = new Date(dateObj.getTime() + (5.5 * 60 * 60 * 1000));
  return indianTime;
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
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInMs = now.getTime() - dateObj.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInMinutes < 1) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minutes ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hours ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else {
    return format(dateObj, 'dd/MM/yyyy');
  }
};

/**
 * Get current Indian time
 */
export const getCurrentIndianTime = (): Date => {
  return toIndianTime(new Date());
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
