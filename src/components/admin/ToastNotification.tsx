'use client';

import React, { useEffect, useState } from 'react';
import type { ToastNotification } from '@/lib/types/notifications';

interface ToastProps {
  toast: ToastNotification;
  onClose: (id: string) => void;
}

export default function Toast({ toast, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Auto-hide if duration is set
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast.duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(toast.id);
    }, 300); // Match animation duration
  };

  const getToastStyles = () => {
    const baseStyles = "relative overflow-hidden rounded-xl shadow-lg border backdrop-blur-sm";
    
    switch (toast.type) {
      case 'success':
        return `${baseStyles} bg-green-50/90 border-green-200 text-green-800`;
      case 'error':
        return `${baseStyles} bg-red-50/90 border-red-200 text-red-800`;
      case 'warning':
        return `${baseStyles} bg-orange-50/90 border-orange-200 text-orange-800`;
      case 'info':
      default:
        return `${baseStyles} bg-blue-50/90 border-blue-200 text-blue-800`;
    }
  };

  const getIconStyles = () => {
    const baseStyles = "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0";
    
    switch (toast.type) {
      case 'success':
        return `${baseStyles} bg-green-100 text-green-600`;
      case 'error':
        return `${baseStyles} bg-red-100 text-red-600`;
      case 'warning':
        return `${baseStyles} bg-orange-100 text-orange-600`;
      case 'info':
      default:
        return `${baseStyles} bg-blue-100 text-blue-600`;
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'info':
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getProgressBarColor = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-400';
      case 'error':
        return 'bg-red-400';
      case 'warning':
        return 'bg-orange-400';
      case 'info':
      default:
        return 'bg-blue-400';
    }
  };

  return (
    <div
      className={`
        transform transition-all duration-300 ease-out max-w-sm w-full
        ${isVisible && !isExiting 
          ? 'translate-x-0 opacity-100 scale-100' 
          : 'translate-x-full opacity-0 scale-95'
        }
      `}
    >
      <div className={getToastStyles()}>
        {/* Progress bar for timed toasts */}
        {toast.duration && toast.duration > 0 && (
          <div className="absolute top-0 left-0 h-1 bg-gray-200 w-full">
            <div 
              className={`h-full ${getProgressBarColor()} transition-all ease-linear`}
              style={{
                animation: `shrink ${toast.duration}ms linear forwards`
              }}
            />
          </div>
        )}

        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className={getIconStyles()}>
              {getIcon()}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold mb-1">
                {toast.title}
              </h4>
              <p className="text-sm opacity-90 leading-relaxed">
                {toast.message}
              </p>

              {/* Action button */}
              {toast.action && (
                <button
                  onClick={toast.action.onClick}
                  className="mt-3 text-sm font-medium underline hover:no-underline transition-all"
                >
                  {toast.action.label}
                </button>
              )}
            </div>

            {/* Close button */}
            <button
              onClick={handleClose}
              className="flex-shrink-0 p-1 rounded-lg hover:bg-black/10 transition-colors"
              title="Close"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Glass morphism effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
      </div>
    </div>
  );
}

// Toast Container Component
interface ToastContainerProps {
  toasts: ToastNotification[];
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <>
      {/* Add keyframes for progress bar animation */}
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
      
      <div className="fixed top-4 right-4 z-50 space-y-3 pointer-events-none">
        <div className="space-y-3 pointer-events-auto">
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              toast={toast}
              onClose={onClose}
            />
          ))}
        </div>
      </div>
    </>
  );
}

// Hook for using toast notifications
export function useToast() {
  const showToast = (toast: Omit<ToastNotification, 'id'>) => {
    // This will be implemented when we integrate with the notification context
    console.log('Toast:', toast);
  };

  return { showToast };
}
