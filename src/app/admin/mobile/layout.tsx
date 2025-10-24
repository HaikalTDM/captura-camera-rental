'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Toaster } from 'react-hot-toast';
import { getAllBookings } from '@/lib/api/bookings';
import type { Booking } from '@/lib/supabase';

type Notification = {
  id: string;
  type: 'pickup' | 'payment' | 'overdue' | 'approval' | 'return' | 'status';
  title: string;
  message: string;
  time: string;
  timestamp: Date;
  bookingId: string;
  isRead: boolean;
  icon: string;
};

export default function MobileAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  
  // Check auth immediately (before first render)
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('adminAuth') === 'true';
    }
    return false;
  });
  const [isLoading, setIsLoading] = useState(false);
  // Initialize dark mode to false to match server render (prevents hydration mismatch)
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotificationsClosing, setIsNotificationsClosing] = useState(false);
  const [dismissedNotifications, setDismissedNotifications] = useState<string[]>([]);
  // Swipe-to-dismiss state per notification
  const [touchStartXById, setTouchStartXById] = useState<Record<string, number>>({});
  const [dragDeltaXById, setDragDeltaXById] = useState<Record<string, number>>({});
  const [isDismissingById, setIsDismissingById] = useState<Record<string, boolean>>({});

  // Initialize dark mode after mount (prevents hydration mismatch)
  useEffect(() => {
    setMounted(true);
    const darkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(darkMode);

    // Set meta theme-color to BLACK immediately
    let themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (!themeColorMeta) {
      themeColorMeta = document.createElement('meta');
      themeColorMeta.setAttribute('name', 'theme-color');
      document.head.appendChild(themeColorMeta);
    }
    themeColorMeta.setAttribute('content', '#000000');

    // Set Apple status bar style to BLACK
    let appleStatusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (!appleStatusBar) {
      appleStatusBar = document.createElement('meta');
      appleStatusBar.setAttribute('name', 'apple-mobile-web-app-status-bar-style');
      document.head.appendChild(appleStatusBar);
    }
    appleStatusBar.setAttribute('content', 'black-translucent');
  }, []);

  useEffect(() => {
    // Load dismissed notifications from localStorage
    try {
      const dismissed = localStorage.getItem('dismissedNotifications');
      if (dismissed) {
        setDismissedNotifications(JSON.parse(dismissed));
      }
    } catch (error) {
      console.error('Error loading dismissed notifications:', error);
    }

    // Listen for storage changes (dark mode toggle from settings)
    const handleStorageChange = () => {
      const updatedDarkMode = localStorage.getItem('darkMode') === 'true';
      setIsDarkMode(updatedDarkMode);
      const updatedAuth = localStorage.getItem('adminAuth') === 'true';
      setIsAuthenticated(updatedAuth);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Load notifications from bookings
  const loadNotifications = async () => {
    try {
      const controller = new AbortController();
      const signal = controller.signal;
      // expose controller to cleanup
      (loadNotifications as any).__controller = controller;

      const bookings = await getAllBookings();
      const generatedNotifications: Notification[] = [];
      const now = new Date();
      
      bookings.forEach((booking) => {
        const startDate = new Date(booking.start_date);
        const endDate = new Date(booking.end_date);
        const daysUntilStart = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const daysAfterEnd = Math.ceil((now.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24));
        
        // Pickup today notifications
        if (daysUntilStart === 0 && !booking.equipment_picked_up) {
          generatedNotifications.push({
            id: `pickup-${booking.id}`,
            type: 'pickup',
            title: 'Pickup Today',
            message: `${booking.customer?.full_name} - ${booking.camera?.name}`,
            time: getTimeAgo(booking.created_at),
            timestamp: new Date(booking.created_at),
            bookingId: booking.id,
            isRead: false,
            icon: '📅'
          });
        }
        
        // Payment received notifications
        if (booking.deposit_paid && booking.final_payment_paid) {
          const paymentDate = new Date(booking.updated_at || booking.created_at);
          const daysSincePayment = Math.ceil((now.getTime() - paymentDate.getTime()) / (1000 * 60 * 60 * 24));
          if (daysSincePayment <= 7) {
            generatedNotifications.push({
              id: `payment-${booking.id}`,
              type: 'payment',
              title: 'Payment Received',
              message: `RM${booking.total_amount} - ${booking.customer?.full_name}`,
              time: getTimeAgo(booking.updated_at || booking.created_at),
              timestamp: paymentDate,
              bookingId: booking.id,
              isRead: false,
              icon: '💰'
            });
          }
        }
        
        // Overdue return notifications
        if (daysAfterEnd > 0 && !booking.equipment_returned) {
          generatedNotifications.push({
            id: `overdue-${booking.id}`,
            type: 'overdue',
            title: 'Overdue Return',
            message: `${booking.customer?.full_name} (${daysAfterEnd} ${daysAfterEnd === 1 ? 'day' : 'days'} late)`,
            time: getTimeAgo(booking.end_date),
            timestamp: endDate,
            bookingId: booking.id,
            isRead: false,
            icon: '⚠️'
          });
        }
        
        // Pending approval notifications
        if (booking.booking_status === 'pending_approval') {
          generatedNotifications.push({
            id: `approval-${booking.id}`,
            type: 'approval',
            title: 'Pending Approval',
            message: `${booking.customer?.full_name} - ${booking.camera?.name}`,
            time: getTimeAgo(booking.created_at),
            timestamp: new Date(booking.created_at),
            bookingId: booking.id,
            isRead: false,
            icon: '✅'
          });
        }
        
        // Equipment returned notifications
        if (booking.equipment_returned) {
          const returnDate = new Date(booking.updated_at || booking.created_at);
          const daysSinceReturn = Math.ceil((now.getTime() - returnDate.getTime()) / (1000 * 60 * 60 * 24));
          if (daysSinceReturn <= 3) {
            generatedNotifications.push({
              id: `return-${booking.id}`,
              type: 'return',
              title: 'Equipment Returned',
              message: `${booking.customer?.full_name} - ${booking.camera?.name}`,
              time: getTimeAgo(booking.updated_at || booking.created_at),
              timestamp: returnDate,
              bookingId: booking.id,
              isRead: false,
              icon: '📸'
            });
          }
        }
      });
      
      // Filter out dismissed notifications
      const filteredNotifications = generatedNotifications.filter(
        notif => !dismissedNotifications.includes(notif.id)
      );
      
      // Sort by timestamp (newest first) and limit to 20
      const sortedNotifications = filteredNotifications
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 20);
      
      setNotifications(sortedNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  // Redirect to login if not authenticated (only on admin routes)
  useEffect(() => {
    const isAdminRoute = pathname?.startsWith('/admin/mobile');
    if (!isAuthenticated && isAdminRoute && pathname !== '/admin/mobile/login') {
      router.replace('/admin/mobile/login');
    }
  }, [isAuthenticated, pathname, router]);

  // Load notifications when dismissed list changes or on mount
  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
    }
  }, [dismissedNotifications, isAuthenticated]);

  // Abort pending notifications fetch on unmount
  useEffect(() => {
    return () => {
      try {
        const c = (loadNotifications as any).__controller;
        if (c && typeof c.abort === 'function') c.abort();
      } catch {}
    };
  }, []);

  // Helper function to calculate time ago
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return `${Math.floor(seconds / 604800)} weeks ago`;
  };

  // Open notifications modal
  const openNotifications = () => {
    setShowNotifications(true);
    setIsNotificationsClosing(false);
    try {
      document.body.style.overflow = 'hidden';
    } catch (e) {
      // Ignore DOM errors
    }
  };

  // Close notifications modal
  const closeNotifications = () => {
    setIsNotificationsClosing(true);
    setTimeout(() => {
      setShowNotifications(false);
      setIsNotificationsClosing(false);
      try {
        document.body.style.overflow = 'auto';
      } catch (e) {
        // Ignore DOM errors
      }
    }, 300);
  };

  // Cleanup notifications scroll lock on unmount or navigation
  useEffect(() => {
    return () => {
      try {
        document.body.style.overflow = 'auto';
      } catch (e) {
        // Ignore DOM errors during cleanup
      }
    };
  }, []);

  // Mark notification as read
  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      )
    );
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
  };

  // Navigate to booking detail
  const handleNotificationClick = (bookingId: string, notificationId: string) => {
    markAsRead(notificationId);
    closeNotifications();
    router.push(`/admin/mobile/bookings/${bookingId}`);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;


  // Swipe gesture handlers
  const handleNotifTouchStart = (id: string) => (e: React.TouchEvent) => {
    const x = e.touches[0]?.clientX ?? 0;
    setTouchStartXById(prev => ({ ...prev, [id]: x }));
    // Prevent vertical scroll from interfering during horizontal swipe start
    (e.currentTarget as HTMLElement).style.transition = 'none';
  };

  const handleNotifTouchMove = (id: string) => (e: React.TouchEvent) => {
    if (!(id in touchStartXById)) return;
    const currentX = e.touches[0]?.clientX ?? 0;
    const delta = currentX - touchStartXById[id];
    setDragDeltaXById(prev => ({ ...prev, [id]: delta }));
  };

  const handleNotifTouchEnd = (id: string) => () => {
    const delta = dragDeltaXById[id] ?? 0;
    const threshold = 80; // px to dismiss
    if (Math.abs(delta) > threshold) {
      dismissNotification(id);
    }
    // reset
    setDragDeltaXById(prev => ({ ...prev, [id]: 0 }));
    setTouchStartXById(prev => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
  };

  // Dismiss a single notification
  const dismissNotification = (id: string) => {
    setIsDismissingById(prev => ({ ...prev, [id]: true }));
    // Animate out then remove and persist
    setTimeout(() => {
      const updatedDismissed = [...dismissedNotifications, id];
      setDismissedNotifications(updatedDismissed);
      localStorage.setItem('dismissedNotifications', JSON.stringify(updatedDismissed));
      setNotifications(prev => prev.filter(n => n.id !== id));
      setIsDismissingById(prev => ({ ...prev, [id]: false }));
    }, 200);
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    const allIds = notifications.map(n => n.id);
    const updatedDismissed = [...dismissedNotifications, ...allIds];
    setDismissedNotifications(updatedDismissed);
    localStorage.setItem('dismissedNotifications', JSON.stringify(updatedDismissed));
    setNotifications([]);
  };

  const handleNotifClick = (n: Notification) => {
    // If user was swiping, ignore click
    const delta = dragDeltaXById[n.id] ?? 0;
    if (Math.abs(delta) > 10) return;
    handleNotificationClick(n.bookingId, n.id);
  };

  const renderNotification = (notification: Notification, index: number) => {
    const deltaX = dragDeltaXById[notification.id] ?? 0;
    const dismissing = isDismissingById[notification.id] ?? false;
    const translate = `translateX(${dismissing ? (deltaX >= 0 ? 200 : -200) : deltaX}px)`;
    const opacity = 1 - Math.min(Math.abs(deltaX) / 220, 0.4);

    return (
      <div key={notification.id} className="relative overflow-hidden">
        {/* Delete background */}
        <div className="absolute inset-0 bg-red-500/10 flex items-center justify-end pr-8 pointer-events-none">
          <span className="text-red-600 font-semibold text-sm">Remove</span>
        </div>
        <button
          onClick={() => handleNotifClick(notification)}
          onTouchStart={handleNotifTouchStart(notification.id)}
          onTouchMove={handleNotifTouchMove(notification.id)}
          onTouchEnd={handleNotifTouchEnd(notification.id)}
          className={`relative w-full text-left px-6 py-4 transition-all duration-200 active:scale-[0.98] ${
            !notification.isRead
              ? isDarkMode ? 'bg-slate-800/30 hover:bg-slate-800' : 'bg-blue-50 hover:bg-blue-100'
              : isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'
          }`}
          style={{
            animationDelay: `${index * 50}ms`,
            transform: translate as any,
            opacity,
            transition: 'transform 0.2s ease, opacity 0.2s ease'
          }}
        >
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              notification.type === 'pickup' ? 'bg-blue-100 dark:bg-blue-900/30' :
              notification.type === 'payment' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
              notification.type === 'overdue' ? 'bg-red-100 dark:bg-red-900/30' :
              notification.type === 'approval' ? 'bg-amber-100 dark:bg-amber-900/30' :
              notification.type === 'return' ? 'bg-purple-100 dark:bg-purple-900/30' :
              'bg-slate-100 dark:bg-slate-800'
            }`}>
              <span className="text-lg">{notification.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {notification.title}
                </p>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!notification.isRead && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      dismissNotification(notification.id);
                    }}
                    className={`p-1 rounded-full ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-200'} transition-colors`}
                    aria-label="Dismiss notification"
                  >
                    <svg className={`w-4 h-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                {notification.message}
              </p>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                {notification.time}
              </p>
            </div>
          </div>
        </button>
      </div>
    );
  };

  if (pathname === '/admin/mobile/login') {
    return children;
  }

  if (!isAuthenticated) {
    return null;
  }

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/admin/mobile', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
        </svg>
      )
    },
    { 
      name: 'Analytics', 
      href: '/admin/mobile/analytics', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    { 
      name: 'Bookings', 
      href: '/admin/mobile/bookings', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    { 
      name: 'Cameras', 
      href: '/admin/mobile/cameras', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    { 
      name: 'Settings', 
      href: '/admin/mobile/settings', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
  ];

  return (
    <>
      <Toaster position="top-center" />
      <div className={`min-h-screen ${isDarkMode ? 'bg-black' : 'bg-white'} pb-20`} suppressHydrationWarning>
        {/* Top Bar */}
        <div className={`sticky top-0 z-40 ${isDarkMode ? 'bg-black' : 'bg-white'}`} suppressHydrationWarning>
          <div className="flex items-center justify-between px-4 h-14">
            <div>
              <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>
                {navigation.find(item => item.href === pathname)?.name || 'Dashboard'}
              </h1>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Notification Icon */}
              <button 
                onClick={openNotifications}
                className={`w-10 h-10 rounded-full flex items-center justify-center relative transition-all duration-200 active:scale-95 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-black hover:bg-gray-900'}`}
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {/* Notification Badge with Count */}
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-lg">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="pb-4">
          {children}
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-black safe-bottom z-50">
          <div className="flex items-center justify-around h-16 px-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex flex-col items-center justify-center gap-1 min-w-[60px] h-full transition-all relative ${
                    isActive ? 'text-white' : 'text-gray-500'
                  } active:scale-95`}
                  prefetch={true}
                >
                  <div className={`transition-transform ${isActive ? 'scale-110' : 'scale-100'}`}>
                    {item.icon}
                  </div>
                  <span className={`text-xs font-medium ${isActive ? 'font-semibold' : ''}`}>
                    {item.name}
                  </span>
                  {isActive && (
                    <div className="absolute bottom-0 w-12 h-1 bg-white rounded-full"></div>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Notifications Bottom Sheet Modal */}
        {showNotifications && (
          <div 
            className={`fixed inset-0 z-[100] flex items-end ${
              isNotificationsClosing ? 'animate-backdropFadeOut' : 'animate-backdropFadeIn'
            }`}
            onClick={closeNotifications}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" style={{ touchAction: 'none' }}></div>
            
            {/* Modal */}
            <div 
              className={`relative w-full ${isDarkMode ? 'bg-slate-900' : 'bg-white'} rounded-t-3xl shadow-2xl max-h-[85vh] overflow-hidden ${
                isNotificationsClosing ? 'animate-modalSlideDown' : 'animate-modalSlideUp'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Handle Bar */}
              <div className="flex justify-center pt-3 pb-2">
                <div className={`w-10 h-1 rounded-full ${isDarkMode ? 'bg-slate-700' : 'bg-slate-300'}`}></div>
              </div>

              {/* Header */}
              <div className={`px-6 py-4 flex items-center justify-between border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'} flex items-center justify-center`}>
                    <svg className={`w-5 h-5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <div>
                    <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      Notifications
                    </h3>
                    <p className={`text-xs font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                      {unreadCount} unread
                    </p>
                  </div>
                </div>
                {notifications.length > 0 && (
                  <div className="flex items-center gap-3">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-sm font-bold text-blue-500 hover:text-blue-600 transition-colors"
                      >
                        Mark Read
                      </button>
                    )}
                    <button
                      onClick={clearAllNotifications}
                      className="text-sm font-bold text-red-500 hover:text-red-600 transition-colors"
                    >
                      Clear All
                    </button>
                  </div>
                )}
              </div>

              {/* Notifications List */}
              <div className="overflow-y-auto max-h-[calc(85vh-120px)]">
                {notifications.length > 0 ? (
                  <div className="divide-y divide-slate-200 dark:divide-slate-800">
                    {/* Group by time */}
                    {(() => {
                      const today = notifications.filter(n => {
                        const notifDate = new Date(n.timestamp);
                        const now = new Date();
                        return notifDate.toDateString() === now.toDateString();
                      });
                      const thisWeek = notifications.filter(n => {
                        const notifDate = new Date(n.timestamp);
                        const now = new Date();
                        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        return notifDate > weekAgo && notifDate.toDateString() !== now.toDateString();
                      });
                      const earlier = notifications.filter(n => {
                        const notifDate = new Date(n.timestamp);
                        const now = new Date();
                        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        return notifDate <= weekAgo;
                      });

                      return (
                        <>
                          {today.length > 0 && (
                            <div>
                              <div className={`px-6 py-2 ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                                <p className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                                  Today
                                </p>
                              </div>
                              {today.map((notification, index) => (
                                renderNotification(notification, index)
                              ))}
                            </div>
                          )}

                          {thisWeek.length > 0 && (
                            <div>
                              <div className={`px-6 py-2 ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                                <p className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                                  This Week
                                </p>
                              </div>
                              {thisWeek.map((notification, index) => (
                                renderNotification(notification, index)
                              ))}
                            </div>
                          )}

                          {earlier.length > 0 && (
                            <div>
                              <div className={`px-6 py-2 ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                                <p className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                                  Earlier
                                </p>
                              </div>
                              {earlier.map((notification, index) => (
                                renderNotification(notification, index)
                              ))}
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 px-6">
                    <div className={`w-20 h-20 rounded-full ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'} flex items-center justify-center mb-4`}>
                      <svg className={`w-10 h-10 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </div>
                    <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      No Notifications
                    </h3>
                    <p className={`text-sm text-center ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                      You're all caught up!<br />New notifications will appear here.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        </div>
    </>
  );
}

