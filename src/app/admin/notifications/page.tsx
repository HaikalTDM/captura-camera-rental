'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useNotifications } from '@/contexts/NotificationContext';
import { 
  formatNotificationTime, 
  NotificationIcons, 
  NotificationColors,
  getNotificationTypeLabel,
  getNotificationPriorityLabel
} from '@/lib/types/notifications';
import type { Notification, NotificationFilter, NotificationType, NotificationPriority } from '@/lib/types/notifications';

export default function NotificationsPage() {
  const { 
    notifications, 
    stats, 
    subscriptionStatus,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    isLoading 
  } = useNotifications();

  const [filter, setFilter] = useState<NotificationFilter>({});
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Filter options
  const typeOptions: NotificationType[] = [
    'new_booking', 'booking_update', 'payment_received', 'booking_cancelled', 
    'booking_confirmed', 'overdue_payment', 'maintenance_due', 'system_alert'
  ];
  
  const priorityOptions: NotificationPriority[] = ['low', 'normal', 'high', 'urgent'];

  useEffect(() => {
    fetchNotifications(filter);
  }, [filter, fetchNotifications]);

  const handleFilterChange = (newFilter: Partial<NotificationFilter>) => {
    setFilter(prev => ({ ...prev, ...newFilter }));
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === notifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(notifications.map(n => n.id));
    }
  };

  const handleSelectNotification = (notificationId: string) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const handleBulkMarkAsRead = async () => {
    const unreadSelected = selectedNotifications.filter(id => {
      const notification = notifications.find(n => n.id === id);
      return notification && !notification.is_read;
    });

    for (const id of unreadSelected) {
      await markAsRead(id);
    }
    setSelectedNotifications([]);
  };

  const handleBulkDismiss = async () => {
    for (const id of selectedNotifications) {
      await dismissNotification(id);
    }
    setSelectedNotifications([]);
  };

  const clearFilters = () => {
    setFilter({});
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Notifications</h1>
            <p className="text-blue-100 text-lg">Manage all your admin notifications and alerts</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <p className="text-blue-100 text-sm">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <p className="text-blue-100 text-sm">Unread</p>
              <p className="text-2xl font-bold">{stats.unread}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <p className="text-blue-100 text-sm">High Priority</p>
              <p className="text-2xl font-bold">{stats.high_priority}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Connection Status */}
      {!subscriptionStatus.connected && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
            <div>
              <p className="text-orange-800 font-medium">Real-time notifications disconnected</p>
              <p className="text-orange-600 text-sm">
                You may not receive new notifications immediately. 
                {subscriptionStatus.error && ` Error: ${subscriptionStatus.error}`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
              </svg>
              Filters
            </button>

            {Object.keys(filter).length > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {selectedNotifications.length > 0 && (
              <>
                <span className="text-sm text-gray-600">
                  {selectedNotifications.length} selected
                </span>
                <button
                  onClick={handleBulkMarkAsRead}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  Mark as Read
                </button>
                <button
                  onClick={handleBulkDismiss}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  Dismiss
                </button>
              </>
            )}
            
            <button
              onClick={() => markAllAsRead()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Mark All Read
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={filter.type || ''}
                  onChange={(e) => handleFilterChange({ type: e.target.value as NotificationType || undefined })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">All types</option>
                  {typeOptions.map(type => (
                    <option key={type} value={type}>
                      {getNotificationTypeLabel(type)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  value={filter.priority || ''}
                  onChange={(e) => handleFilterChange({ priority: e.target.value as NotificationPriority || undefined })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">All priorities</option>
                  {priorityOptions.map(priority => (
                    <option key={priority} value={priority}>
                      {getNotificationPriorityLabel(priority)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filter.is_read === undefined ? '' : filter.is_read ? 'read' : 'unread'}
                  onChange={(e) => handleFilterChange({ 
                    is_read: e.target.value === '' ? undefined : e.target.value === 'read' 
                  })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">All</option>
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Limit</label>
                <select
                  value={filter.limit || 50}
                  onChange={(e) => handleFilterChange({ limit: parseInt(e.target.value) })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={200}>200</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🔔</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
            <p className="text-gray-500">
              {Object.keys(filter).length > 0 
                ? 'Try adjusting your filters to see more notifications.'
                : 'New notifications will appear here when they arrive.'
              }
            </p>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedNotifications.length === notifications.length}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-3 text-sm font-medium text-gray-700">
                  Select all ({notifications.length})
                </span>
              </div>
            </div>

            {/* Notifications */}
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <NotificationRow
                  key={notification.id}
                  notification={notification}
                  isSelected={selectedNotifications.includes(notification.id)}
                  onSelect={() => handleSelectNotification(notification.id)}
                  onMarkAsRead={() => markAsRead(notification.id)}
                  onDismiss={() => dismissNotification(notification.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Individual notification row component
interface NotificationRowProps {
  notification: Notification;
  isSelected: boolean;
  onSelect: () => void;
  onMarkAsRead: () => void;
  onDismiss: () => void;
}

function NotificationRow({
  notification,
  isSelected,
  onSelect,
  onMarkAsRead,
  onDismiss
}: NotificationRowProps) {
  const colors = NotificationColors[notification.priority];
  const icon = NotificationIcons[notification.type];

  const handleClick = () => {
    if (!notification.is_read) {
      onMarkAsRead();
    }

    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
  };

  return (
    <div className={`
      px-6 py-4 hover:bg-gray-50 transition-colors
      ${!notification.is_read ? 'bg-blue-50/30' : ''}
    `}>
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />

        {/* Icon */}
        <div className={`
          w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1
          ${colors.bg} ${colors.border} border
        `}>
          <span className="text-lg">{icon}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className={`
                  text-sm font-medium
                  ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}
                `}>
                  {notification.title}
                </h3>
                <span className={`
                  px-2 py-1 text-xs font-medium rounded-full
                  ${colors.bg} ${colors.text}
                `}>
                  {getNotificationPriorityLabel(notification.priority)}
                </span>
                {!notification.is_read && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </div>

              <p className="text-sm text-gray-600 mb-2 leading-relaxed">
                {notification.message}
              </p>

              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>{getNotificationTypeLabel(notification.type)}</span>
                <span>•</span>
                <span>{formatNotificationTime(notification.created_at)}</span>
                {notification.read_at && (
                  <>
                    <span>•</span>
                    <span>Read {formatNotificationTime(notification.read_at)}</span>
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 ml-4">
              {notification.action_url && (
                <Link
                  href={notification.action_url}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  onClick={() => !notification.is_read && onMarkAsRead()}
                >
                  View
                </Link>
              )}

              {!notification.is_read && (
                <button
                  onClick={onMarkAsRead}
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Mark Read
                </button>
              )}

              <button
                onClick={onDismiss}
                className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
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
}
