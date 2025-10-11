'use client';

import { useState, useCallback } from 'react';

export interface ToastData {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = useCallback((
    message: string, 
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    duration: number = 4000
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastData = { id, message, type, duration };
    
    setToasts(prev => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return {
    toasts,
    showToast,
    removeToast,
    success: (message: string, duration?: number) => showToast(message, 'success', duration),
    error: (message: string, duration?: number) => showToast(message, 'error', duration),
    warning: (message: string, duration?: number) => showToast(message, 'warning', duration),
    info: (message: string, duration?: number) => showToast(message, 'info', duration),
  };
}

