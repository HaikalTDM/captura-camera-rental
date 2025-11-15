'use client';

import { Toaster } from 'react-hot-toast';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';

/**
 * Custom Toast Configuration with Framer Motion animations
 * Monochrome design with shadcn/ui styling
 */
export function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{
        top: 20,
      }}
      toastOptions={{
        // Default options
        duration: 4000,
        style: {
          background: '#ffffff',
          color: '#0f172a',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '500',
          padding: '16px 20px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.06)',
          maxWidth: '500px',
        },
        // Success toast
        success: {
          duration: 3500,
          iconTheme: {
            primary: '#10b981',
            secondary: '#ffffff',
          },
          style: {
            background: '#ffffff',
            color: '#0f172a',
            border: '2px solid #10b981',
            boxShadow: '0 10px 40px rgba(16, 185, 129, 0.15), 0 2px 8px rgba(16, 185, 129, 0.1)',
          },
        },
        // Error toast
        error: {
          duration: 4500,
          iconTheme: {
            primary: '#ef4444',
            secondary: '#ffffff',
          },
          style: {
            background: '#ffffff',
            color: '#0f172a',
            border: '2px solid #ef4444',
            boxShadow: '0 10px 40px rgba(239, 68, 68, 0.15), 0 2px 8px rgba(239, 68, 68, 0.1)',
          },
        },
        // Loading toast
        loading: {
          iconTheme: {
            primary: '#64748b',
            secondary: '#ffffff',
          },
          style: {
            background: '#ffffff',
            color: '#0f172a',
            border: '2px solid #64748b',
            boxShadow: '0 10px 40px rgba(100, 116, 139, 0.15), 0 2px 8px rgba(100, 116, 139, 0.1)',
          },
        },
      }}
    />
  );
}

/**
 * Custom toast variants with icons
 */
export const customToast = {
  success: (message: string) => {
    return {
      icon: <CheckCircle2 className="w-5 h-5 text-green-600" />,
      style: {
        background: '#ffffff',
        color: '#0f172a',
        border: '2px solid #10b981',
        boxShadow: '0 10px 40px rgba(16, 185, 129, 0.15), 0 2px 8px rgba(16, 185, 129, 0.1)',
      },
    };
  },
  error: (message: string) => {
    return {
      icon: <XCircle className="w-5 h-5 text-red-600" />,
      style: {
        background: '#ffffff',
        color: '#0f172a',
        border: '2px solid #ef4444',
        boxShadow: '0 10px 40px rgba(239, 68, 68, 0.15), 0 2px 8px rgba(239, 68, 68, 0.1)',
      },
    };
  },
  warning: (message: string) => {
    return {
      icon: <AlertCircle className="w-5 h-5 text-amber-600" />,
      style: {
        background: '#ffffff',
        color: '#0f172a',
        border: '2px solid #f59e0b',
        boxShadow: '0 10px 40px rgba(245, 158, 11, 0.15), 0 2px 8px rgba(245, 158, 11, 0.1)',
      },
    };
  },
  info: (message: string) => {
    return {
      icon: <Info className="w-5 h-5 text-blue-600" />,
      style: {
        background: '#ffffff',
        color: '#0f172a',
        border: '2px solid #3b82f6',
        boxShadow: '0 10px 40px rgba(59, 130, 246, 0.15), 0 2px 8px rgba(59, 130, 246, 0.1)',
      },
    };
  },
};

/**
 * Dark mode toast configuration
 */
export function DarkToastProvider() {
  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{
        top: 20,
      }}
      toastOptions={{
        // Default options
        duration: 4000,
        style: {
          background: '#1e293b',
          color: '#f1f5f9',
          border: '1px solid #334155',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '500',
          padding: '16px 20px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)',
          maxWidth: '500px',
        },
        // Success toast
        success: {
          duration: 3500,
          iconTheme: {
            primary: '#10b981',
            secondary: '#1e293b',
          },
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '2px solid #10b981',
            boxShadow: '0 10px 40px rgba(16, 185, 129, 0.2), 0 2px 8px rgba(16, 185, 129, 0.15)',
          },
        },
        // Error toast
        error: {
          duration: 4500,
          iconTheme: {
            primary: '#ef4444',
            secondary: '#1e293b',
          },
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '2px solid #ef4444',
            boxShadow: '0 10px 40px rgba(239, 68, 68, 0.2), 0 2px 8px rgba(239, 68, 68, 0.15)',
          },
        },
        // Loading toast
        loading: {
          iconTheme: {
            primary: '#64748b',
            secondary: '#1e293b',
          },
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '2px solid #64748b',
            boxShadow: '0 10px 40px rgba(100, 116, 139, 0.2), 0 2px 8px rgba(100, 116, 139, 0.15)',
          },
        },
      }}
    />
  );
}

