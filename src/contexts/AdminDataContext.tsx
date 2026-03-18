'use client';

import { createContext, useContext, useMemo, useCallback } from 'react';
import useSWR from 'swr';
import { getAllBookings, getAllCameras } from '@/lib/api/bookings';
import type { Booking, Camera } from '@/lib/supabase';

interface BookingStats {
  total: number;
  pending: number;
  confirmed: number;
  active: number;
  completed: number;
  cancelled: number;
  bySource: Record<string, number>;
}

interface AdminDataContextType {
  bookings: Booking[];
  cameras: Camera[];
  stats: BookingStats;
  isLoading: boolean;
  error: any;
  mutate: () => void;
  mutateBookings: () => void;
  mutateCameras: () => void;
}

const AdminDataContext = createContext<AdminDataContextType | undefined>(undefined);

// SWR configuration for optimized caching
const swrConfig = {
  revalidateOnFocus: false, // Don't refetch on window focus
  revalidateOnReconnect: true, // Refetch on reconnect
  dedupingInterval: 5000, // Dedupe requests within 5 seconds
  focusThrottleInterval: 10000, // Throttle focus revalidation
  shouldRetryOnError: false, // Don't retry on error to prevent update loops
  revalidateIfStale: false, // Don't revalidate stale data automatically
  errorRetryCount: 0, // Don't retry on error
};

export function AdminDataProvider({ children }: { children: React.ReactNode }) {
  // Use SWR for data fetching with caching - with safe error handling
  const { data: bookings = [], error: bookingsError, mutate: mutateBookings, isLoading: isLoadingBookings } = useSWR(
    'admin-bookings',
    getAllBookings,
    {
      ...swrConfig,
      refreshInterval: 0, // Disable auto-refresh to prevent unmount issues
      onError: (err) => {
        // Silently handle errors to prevent cascading issues
        console.error('Error fetching bookings:', err);
      },
    }
  );

  const { data: cameras = [], error: camerasError, mutate: mutateCameras, isLoading: isLoadingCameras } = useSWR(
    'admin-cameras',
    getAllCameras,
    {
      ...swrConfig,
      refreshInterval: 0, // Disable auto-refresh to prevent unmount issues
      onError: (err) => {
        console.error('Error fetching cameras:', err);
      },
    }
  );

  // Default stats if not loaded
  const defaultStats: BookingStats = useMemo(() => ({
    total: 0,
    pending: 0,
    confirmed: 0,
    active: 0,
    completed: 0,
    cancelled: 0,
    bySource: {}
  }), []);

  const stats = useMemo<BookingStats>(() => {
    if (!bookings.length) {
      return defaultStats;
    }

    const bySource: Record<string, number> = {};
    bookings.forEach((booking) => {
      const source = booking.booking_source || 'unknown';
      bySource[source] = (bySource[source] || 0) + 1;
    });

    return {
      total: bookings.length,
      pending: bookings.filter((booking) => booking.booking_status === 'pending_approval').length,
      confirmed: bookings.filter((booking) => booking.booking_status === 'confirmed').length,
      active: bookings.filter((booking) => booking.status === 'active').length,
      completed: bookings.filter((booking) => booking.booking_status === 'completed').length,
      cancelled: bookings.filter((booking) => booking.booking_status === 'cancelled').length,
      bySource,
    };
  }, [bookings, defaultStats]);

  const isLoading = isLoadingBookings || isLoadingCameras;
  const error = bookingsError || camerasError;

  // Mutate all data
  const mutate = useCallback(() => {
    mutateBookings();
    mutateCameras();
  }, [mutateBookings, mutateCameras]);

  const value: AdminDataContextType = {
    bookings,
    cameras,
    stats: stats || defaultStats,
    isLoading,
    error,
    mutate,
    mutateBookings,
    mutateCameras,
  };

  return (
    <AdminDataContext.Provider value={value}>
      {children}
    </AdminDataContext.Provider>
  );
}

// Custom hook to use admin data
export function useAdminData() {
  const context = useContext(AdminDataContext);
  if (context === undefined) {
    throw new Error('useAdminData must be used within AdminDataProvider');
  }
  return context;
}

// Optimized hooks for specific data needs
export function useBookings() {
  const { bookings, isLoading, error, mutateBookings } = useAdminData();
  return { bookings, isLoading, error, mutate: mutateBookings };
}

export function useCameras() {
  const { cameras, isLoading, error, mutateCameras } = useAdminData();
  return { cameras, isLoading, error, mutate: mutateCameras };
}

export function useBookingStats() {
  const { stats, isLoading, error } = useAdminData();
  return { stats, isLoading, error };
}

