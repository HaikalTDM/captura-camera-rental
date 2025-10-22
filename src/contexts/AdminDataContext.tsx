'use client';

import { createContext, useContext, useMemo } from 'react';
import useSWR from 'swr';
import { getAllBookings, getBookingStats, getAllCameras } from '@/lib/api/bookings';
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

  const { data: stats, error: statsError, mutate: mutateStats, isLoading: isLoadingStats } = useSWR(
    'admin-stats',
    getBookingStats,
    {
      ...swrConfig,
      refreshInterval: 0, // Disable auto-refresh to prevent unmount issues
      onError: (err) => {
        console.error('Error fetching stats:', err);
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

  const isLoading = isLoadingBookings || isLoadingCameras || isLoadingStats;
  const error = bookingsError || camerasError || statsError;

  // Mutate all data
  const mutate = () => {
    mutateBookings();
    mutateCameras();
    mutateStats();
  };

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

