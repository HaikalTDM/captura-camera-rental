// Notification system types for CAPTURA admin panel

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, any>;
  is_read: boolean;
  is_dismissed: boolean;
  priority: NotificationPriority;
  action_url?: string;
  created_at: string;
  read_at?: string;
  dismissed_at?: string;
}

export type NotificationType = 
  | 'new_booking'
  | 'booking_update'
  | 'payment_received'
  | 'booking_cancelled'
  | 'booking_confirmed'
  | 'overdue_payment'
  | 'maintenance_due'
  | 'system_alert';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface NotificationPreference {
  id: string;
  user_id: string;
  notification_type: NotificationType;
  is_enabled: boolean;
  sound_enabled: boolean;
  email_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  high_priority: number;
  by_type: Record<NotificationType, number>;
  recent_count: number; // Last 24 hours
}

export interface CreateNotificationData {
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  priority?: NotificationPriority;
  action_url?: string;
}

export interface NotificationFilter {
  type?: NotificationType;
  priority?: NotificationPriority;
  is_read?: boolean;
  is_dismissed?: boolean;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}

// Notification sound types
export type NotificationSound = 'default' | 'success' | 'warning' | 'error' | 'none';

// Toast notification interface
export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number; // in milliseconds, 0 for persistent
  action?: {
    label: string;
    onClick: () => void;
  };
  sound?: NotificationSound;
}

// Real-time subscription status
export interface SubscriptionStatus {
  connected: boolean;
  last_connected?: string;
  error?: string;
  retry_count: number;
}

// Notification context interface
export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  stats: NotificationStats;
  subscriptionStatus: SubscriptionStatus;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchNotifications: (filter?: NotificationFilter) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<boolean>;
  markAllAsRead: () => Promise<number>;
  dismissNotification: (notificationId: string) => Promise<boolean>;
  createNotification: (data: CreateNotificationData) => Promise<Notification | null>;
  
  // Real-time subscription management
  startSubscription: () => void;
  stopSubscription: () => void;
  
  // Toast notifications
  showToast: (toast: Omit<ToastNotification, 'id'>) => void;
  hideToast: (toastId: string) => void;
  clearAllToasts: () => void;
}

// Notification icon mapping
export const NotificationIcons: Record<NotificationType, string> = {
  new_booking: '📋',
  booking_update: '🔄',
  payment_received: '💰',
  booking_cancelled: '❌',
  booking_confirmed: '✅',
  overdue_payment: '⚠️',
  maintenance_due: '🔧',
  system_alert: '🚨'
};

// Notification color mapping for priority
export const NotificationColors: Record<NotificationPriority, {
  bg: string;
  text: string;
  border: string;
  icon: string;
}> = {
  low: {
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    border: 'border-gray-200',
    icon: 'text-gray-500'
  },
  normal: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    icon: 'text-blue-500'
  },
  high: {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    icon: 'text-orange-500'
  },
  urgent: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    icon: 'text-red-500'
  }
};

// Default notification preferences
export const DefaultNotificationPreferences: Record<NotificationType, {
  is_enabled: boolean;
  sound_enabled: boolean;
  email_enabled: boolean;
}> = {
  new_booking: { is_enabled: true, sound_enabled: true, email_enabled: false },
  booking_update: { is_enabled: true, sound_enabled: false, email_enabled: false },
  payment_received: { is_enabled: true, sound_enabled: true, email_enabled: false },
  booking_cancelled: { is_enabled: true, sound_enabled: false, email_enabled: false },
  booking_confirmed: { is_enabled: true, sound_enabled: false, email_enabled: false },
  overdue_payment: { is_enabled: true, sound_enabled: true, email_enabled: false },
  maintenance_due: { is_enabled: true, sound_enabled: false, email_enabled: false },
  system_alert: { is_enabled: true, sound_enabled: true, email_enabled: false }
};

// Utility functions
export const formatNotificationTime = (timestamp: string): string => {
  const now = new Date();
  const notificationTime = new Date(timestamp);
  const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return notificationTime.toLocaleDateString();
};

export const getNotificationPriorityLabel = (priority: NotificationPriority): string => {
  const labels: Record<NotificationPriority, string> = {
    low: 'Low Priority',
    normal: 'Normal',
    high: 'High Priority',
    urgent: 'Urgent'
  };
  return labels[priority];
};

export const getNotificationTypeLabel = (type: NotificationType): string => {
  const labels: Record<NotificationType, string> = {
    new_booking: 'New Booking',
    booking_update: 'Booking Update',
    payment_received: 'Payment Received',
    booking_cancelled: 'Booking Cancelled',
    booking_confirmed: 'Booking Confirmed',
    overdue_payment: 'Overdue Payment',
    maintenance_due: 'Maintenance Due',
    system_alert: 'System Alert'
  };
  return labels[type];
};
