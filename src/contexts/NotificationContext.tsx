'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import {
  getNotifications,
  getRecentNotifications,
  getNotificationStats,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  dismissNotification,
  createNotification,
  subscribeToNotifications,
  unsubscribeFromNotifications
} from '@/lib/api/notifications';
import { ToastContainer } from '@/components/admin/ToastNotification';
import type {
  Notification,
  NotificationFilter,
  NotificationStats,
  CreateNotificationData,
  NotificationContextType,
  ToastNotification,
  SubscriptionStatus
} from '@/lib/types/notifications';

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    unread: 0,
    high_priority: 0,
    by_type: {} as any,
    recent_count: 0
  });
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({
    connected: false,
    retry_count: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const subscriptionRef = useRef<any>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch notifications with optional filtering
  const fetchNotifications = useCallback(async (filter: NotificationFilter = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await getNotifications(filter);
      setNotifications(data);
      
      // Update unread count
      const count = await getUnreadNotificationCount();
      setUnreadCount(count);
      
      // Update stats
      const statsData = await getNotificationStats();
      setStats(statsData);
      
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to fetch notifications');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string): Promise<boolean> => {
    try {
      const success = await markNotificationAsRead(notificationId);
      if (success) {
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId 
              ? { ...n, is_read: true, read_at: new Date().toISOString() }
              : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        
        // Update stats
        setStats(prev => ({
          ...prev,
          unread: Math.max(0, prev.unread - 1)
        }));
      }
      return success;
    } catch (err) {
      console.error('Error marking notification as read:', err);
      return false;
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async (): Promise<number> => {
    try {
      const updatedCount = await markAllNotificationsAsRead();
      if (updatedCount > 0) {
        setNotifications(prev => 
          prev.map(n => ({ 
            ...n, 
            is_read: true, 
            read_at: new Date().toISOString() 
          }))
        );
        setUnreadCount(0);
        setStats(prev => ({ ...prev, unread: 0 }));
      }
      return updatedCount;
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      return 0;
    }
  }, []);

  // Dismiss notification
  const dismissNotificationHandler = useCallback(async (notificationId: string): Promise<boolean> => {
    try {
      const success = await dismissNotification(notificationId);
      if (success) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        
        // Update unread count if the dismissed notification was unread
        const notification = notifications.find(n => n.id === notificationId);
        if (notification && !notification.is_read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
          setStats(prev => ({ ...prev, unread: Math.max(0, prev.unread - 1) }));
        }
      }
      return success;
    } catch (err) {
      console.error('Error dismissing notification:', err);
      return false;
    }
  }, [notifications]);

  // Create new notification
  const createNotificationHandler = useCallback(async (data: CreateNotificationData): Promise<Notification | null> => {
    try {
      const notification = await createNotification(data);
      if (notification) {
        setNotifications(prev => [notification, ...prev]);
        if (!notification.is_read) {
          setUnreadCount(prev => prev + 1);
          setStats(prev => ({ 
            ...prev, 
            total: prev.total + 1,
            unread: prev.unread + 1 
          }));
        }
      }
      return notification;
    } catch (err) {
      console.error('Error creating notification:', err);
      return null;
    }
  }, []);

  // Handle new real-time notification
  const handleNewNotification = useCallback((notification: Notification) => {
    console.log('Received new notification:', notification);
    
    // Add to notifications list
    setNotifications(prev => [notification, ...prev]);
    
    // Update counts
    if (!notification.is_read) {
      setUnreadCount(prev => prev + 1);
    }
    
    // Update stats
    setStats(prev => ({
      ...prev,
      total: prev.total + 1,
      unread: notification.is_read ? prev.unread : prev.unread + 1,
      high_priority: (notification.priority === 'high' || notification.priority === 'urgent') 
        ? prev.high_priority + 1 
        : prev.high_priority,
      recent_count: prev.recent_count + 1
    }));

    // Show toast notification
    showToast({
      type: notification.priority === 'urgent' ? 'error' : 
            notification.priority === 'high' ? 'warning' : 'info',
      title: notification.title,
      message: notification.message,
      duration: notification.priority === 'urgent' ? 0 : 5000, // Urgent notifications persist
      action: notification.action_url ? {
        label: 'View',
        onClick: () => {
          if (typeof window !== 'undefined') {
            window.location.href = notification.action_url!;
          }
        }
      } : undefined,
      sound: notification.priority === 'urgent' || notification.priority === 'high' ? 'warning' : 'default'
    });

    // Play notification sound if enabled
    if (typeof window !== 'undefined' && notification.priority !== 'low') {
      try {
        const audio = new Audio('/sounds/notification.mp3');
        audio.volume = 0.5;
        audio.play().catch(console.warn);
      } catch (err) {
        console.warn('Could not play notification sound:', err);
      }
    }
  }, []);

  // Start real-time subscription
  const startSubscription = useCallback(() => {
    if (subscriptionRef.current) {
      console.log('Subscription already active');
      return;
    }

    console.log('Starting notification subscription...');
    
    try {
      subscriptionRef.current = subscribeToNotifications(
        handleNewNotification,
        (error) => {
          console.error('Notification subscription error:', error);
          setSubscriptionStatus(prev => ({
            connected: false,
            error: error.message,
            retry_count: prev.retry_count + 1
          }));
          
          // Retry connection after delay
          if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
          }
          
          retryTimeoutRef.current = setTimeout(() => {
            console.log('Retrying notification subscription...');
            stopSubscription();
            startSubscription();
          }, 5000);
        }
      );

      setSubscriptionStatus({
        connected: true,
        last_connected: new Date().toISOString(),
        retry_count: 0
      });
    } catch (error) {
      console.error('Failed to start subscription:', error);
      setSubscriptionStatus(prev => ({
        connected: false,
        error: 'Failed to start subscription',
        retry_count: prev.retry_count + 1
      }));
    }
  }, [handleNewNotification]);

  // Stop real-time subscription
  const stopSubscription = useCallback(() => {
    if (subscriptionRef.current) {
      console.log('Stopping notification subscription...');
      unsubscribeFromNotifications(subscriptionRef.current);
      subscriptionRef.current = null;
    }
    
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    
    setSubscriptionStatus(prev => ({
      ...prev,
      connected: false
    }));
  }, []);

  // Toast management
  const showToast = useCallback((toast: Omit<ToastNotification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastNotification = { ...toast, id };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto-hide toast after duration (if specified)
    if (toast.duration && toast.duration > 0) {
      setTimeout(() => {
        hideToast(id);
      }, toast.duration);
    }
  }, []);

  const hideToast = useCallback((toastId: string) => {
    setToasts(prev => prev.filter(t => t.id !== toastId));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Initialize notifications and subscription
  useEffect(() => {
    fetchNotifications();
    startSubscription();

    return () => {
      stopSubscription();
    };
  }, [fetchNotifications, startSubscription, stopSubscription]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    stats,
    subscriptionStatus,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    dismissNotification: dismissNotificationHandler,
    createNotification: createNotificationHandler,
    startSubscription,
    stopSubscription,
    showToast,
    hideToast,
    clearAllToasts
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {/* Toast Container */}
      <ToastContainer toasts={toasts} onClose={hideToast} />
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
