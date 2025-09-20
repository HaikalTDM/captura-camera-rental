'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useNotifications } from '@/contexts/NotificationContext';
import { formatNotificationTime, NotificationIcons, NotificationColors } from '@/lib/types/notifications';
import type { Notification } from '@/lib/types/notifications';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { 
    notifications, 
    unreadCount, 
    subscriptionStatus,
    markAsRead, 
    markAllAsRead,
    dismissNotification,
    isLoading 
  } = useNotifications();

  // Get recent notifications (last 10)
  const recentNotifications = notifications.slice(0, 10);
  const hasUnread = unreadCount > 0;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    
    if (notification.action_url) {
      setIsOpen(false);
      // Navigation will be handled by the Link component
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleDismiss = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    await dismissNotification(notificationId);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          relative p-2 rounded-lg transition-all duration-200 
          ${isOpen 
            ? 'bg-blue-50 text-blue-600' 
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }
          ${hasUnread ? 'animate-pulse' : ''}
        `}
        title={`${unreadCount} unread notifications`}
      >
        {/* Bell Icon */}
        <svg 
          className="w-6 h-6" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
          />
        </svg>

        {/* Badge */}
        {hasUnread && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-bounce">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}

        {/* Connection Status Indicator */}
        <div className={`
          absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white
          ${subscriptionStatus.connected ? 'bg-green-400' : 'bg-red-400'}
        `} title={subscriptionStatus.connected ? 'Connected' : 'Disconnected'} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <div className="flex items-center gap-2">
                {hasUnread && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Mark all read
                  </button>
                )}
                <Link
                  href="/admin/notifications"
                  className="text-sm text-gray-600 hover:text-gray-800"
                  onClick={() => setIsOpen(false)}
                >
                  View all
                </Link>
              </div>
            </div>
            
            {/* Stats */}
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              <span>{unreadCount} unread</span>
              <span>•</span>
              <span>{recentNotifications.length} recent</span>
              {!subscriptionStatus.connected && (
                <>
                  <span>•</span>
                  <span className="text-red-600 flex items-center gap-1">
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    Offline
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Loading notifications...</p>
              </div>
            ) : recentNotifications.length === 0 ? (
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🔔</span>
                </div>
                <p className="text-gray-500 text-sm">No notifications yet</p>
                <p className="text-gray-400 text-xs mt-1">You'll see new booking alerts here</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onClick={() => handleNotificationClick(notification)}
                    onDismiss={(e) => handleDismiss(e, notification.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {recentNotifications.length > 0 && (
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
              <Link
                href="/admin/notifications"
                className="block text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                onClick={() => setIsOpen(false)}
              >
                View all notifications →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Individual notification item component
interface NotificationItemProps {
  notification: Notification;
  onClick: () => void;
  onDismiss: (e: React.MouseEvent) => void;
}

function NotificationItem({ notification, onClick, onDismiss }: NotificationItemProps) {
  const colors = NotificationColors[notification.priority];
  const icon = NotificationIcons[notification.type];
  
  const content = (
    <div 
      className={`
        p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-150
        ${!notification.is_read ? 'bg-blue-50/50' : ''}
      `}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`
          w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
          ${colors.bg} ${colors.border} border
        `}>
          <span className="text-sm">{icon}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className={`
                text-sm font-medium truncate
                ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}
              `}>
                {notification.title}
              </p>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {notification.message}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {formatNotificationTime(notification.created_at)}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 ml-2">
              {!notification.is_read && (
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
              <button
                onClick={onDismiss}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
                title="Dismiss"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Wrap with Link if action_url exists
  if (notification.action_url) {
    return (
      <Link href={notification.action_url} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
