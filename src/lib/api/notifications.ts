import { supabase } from '../supabase';
import type { 
  Notification, 
  NotificationFilter, 
  NotificationStats, 
  CreateNotificationData,
  NotificationPreference,
  NotificationType 
} from '../types/notifications';

// Get all notifications with optional filtering
export async function getNotifications(filter: NotificationFilter = {}): Promise<Notification[]> {
  try {
    let query = supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (filter.type) {
      query = query.eq('type', filter.type);
    }
    
    if (filter.priority) {
      query = query.eq('priority', filter.priority);
    }
    
    if (filter.is_read !== undefined) {
      query = query.eq('is_read', filter.is_read);
    }
    
    if (filter.is_dismissed !== undefined) {
      query = query.eq('is_dismissed', filter.is_dismissed);
    }
    
    if (filter.date_from) {
      query = query.gte('created_at', filter.date_from);
    }
    
    if (filter.date_to) {
      query = query.lte('created_at', filter.date_to);
    }
    
    if (filter.limit) {
      query = query.limit(filter.limit);
    }
    
    if (filter.offset) {
      query = query.range(filter.offset, filter.offset + (filter.limit || 50) - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getNotifications:', error);
    return [];
  }
}

// Get recent notifications (last 50, unread first)
export async function getRecentNotifications(): Promise<Notification[]> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('is_dismissed', false)
      .order('is_read', { ascending: true })
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching recent notifications:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getRecentNotifications:', error);
    return [];
  }
}

// Get notification statistics
export async function getNotificationStats(): Promise<NotificationStats> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('type, priority, is_read, created_at');

    if (error) {
      console.error('Error fetching notification stats:', error);
      return {
        total: 0,
        unread: 0,
        high_priority: 0,
        by_type: {} as Record<NotificationType, number>,
        recent_count: 0
      };
    }

    const notifications = data || [];
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const stats: NotificationStats = {
      total: notifications.length,
      unread: notifications.filter(n => !n.is_read).length,
      high_priority: notifications.filter(n => n.priority === 'high' || n.priority === 'urgent').length,
      by_type: {} as Record<NotificationType, number>,
      recent_count: notifications.filter(n => new Date(n.created_at) > yesterday).length
    };

    // Count by type
    notifications.forEach(notification => {
      const type = notification.type as NotificationType;
      stats.by_type[type] = (stats.by_type[type] || 0) + 1;
    });

    return stats;
  } catch (error) {
    console.error('Error in getNotificationStats:', error);
    return {
      total: 0,
      unread: 0,
      high_priority: 0,
      by_type: {} as Record<NotificationType, number>,
      recent_count: 0
    };
  }
}

// Get unread notification count
export async function getUnreadNotificationCount(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false)
      .eq('is_dismissed', false);

    if (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Error in getUnreadNotificationCount:', error);
    return 0;
  }
}

// Mark notification as read
export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ 
        is_read: true, 
        read_at: new Date().toISOString() 
      })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in markNotificationAsRead:', error);
    return false;
  }
}

// Mark all notifications as read
export async function markAllNotificationsAsRead(): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ 
        is_read: true, 
        read_at: new Date().toISOString() 
      })
      .eq('is_read', false)
      .select('id');

    if (error) {
      console.error('Error marking all notifications as read:', error);
      return 0;
    }

    return data?.length || 0;
  } catch (error) {
    console.error('Error in markAllNotificationsAsRead:', error);
    return 0;
  }
}

// Dismiss notification
export async function dismissNotification(notificationId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ 
        is_dismissed: true, 
        dismissed_at: new Date().toISOString() 
      })
      .eq('id', notificationId);

    if (error) {
      console.error('Error dismissing notification:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in dismissNotification:', error);
    return false;
  }
}

// Create new notification
export async function createNotification(data: CreateNotificationData): Promise<Notification | null> {
  try {
    const notificationData = {
      type: data.type,
      title: data.title,
      message: data.message,
      data: data.data || {},
      priority: data.priority || 'normal',
      action_url: data.action_url || null,
      is_read: false,
      is_dismissed: false
    };

    const { data: notification, error } = await supabase
      .from('notifications')
      .insert([notificationData])
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      return null;
    }

    return notification;
  } catch (error) {
    console.error('Error in createNotification:', error);
    return null;
  }
}

// Delete old notifications (cleanup function)
export async function deleteOldNotifications(daysOld: number = 30): Promise<number> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const { data, error } = await supabase
      .from('notifications')
      .delete()
      .lt('created_at', cutoffDate.toISOString())
      .select('id');

    if (error) {
      console.error('Error deleting old notifications:', error);
      return 0;
    }

    return data?.length || 0;
  } catch (error) {
    console.error('Error in deleteOldNotifications:', error);
    return 0;
  }
}

// Get notification preferences
export async function getNotificationPreferences(): Promise<NotificationPreference[]> {
  try {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', 'admin')
      .order('notification_type');

    if (error) {
      console.error('Error fetching notification preferences:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getNotificationPreferences:', error);
    return [];
  }
}

// Update notification preference
export async function updateNotificationPreference(
  notificationType: NotificationType,
  updates: Partial<Pick<NotificationPreference, 'is_enabled' | 'sound_enabled' | 'email_enabled'>>
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notification_preferences')
      .update(updates)
      .eq('user_id', 'admin')
      .eq('notification_type', notificationType);

    if (error) {
      console.error('Error updating notification preference:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateNotificationPreference:', error);
    return false;
  }
}

// Subscribe to real-time notifications
export function subscribeToNotifications(
  onNotification: (notification: Notification) => void,
  onError?: (error: any) => void
) {
  const subscription = supabase
    .channel('notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications'
      },
      (payload) => {
        console.log('New notification received:', payload);
        onNotification(payload.new as Notification);
      }
    )
    .subscribe((status) => {
      console.log('Notification subscription status:', status);
      if (status === 'SUBSCRIBED') {
        console.log('Successfully subscribed to notifications');
      } else if (status === 'CHANNEL_ERROR' && onError) {
        onError(new Error('Failed to subscribe to notifications'));
      }
    });

  return subscription;
}

// Unsubscribe from notifications
export function unsubscribeFromNotifications(subscription: any) {
  if (subscription) {
    supabase.removeChannel(subscription);
  }
}
