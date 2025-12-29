'use client';

import { Toaster, toast } from 'react-hot-toast';
import { CheckCircle2, XCircle, AlertCircle, Info, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Premium Toast Configuration matching CAPTURA theme
 * Dark gradient styling with glass morphism effects
 */
export function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      gutter={12}
      containerClassName=""
      containerStyle={{
        top: 16,
        zIndex: 9999,
      }}
      toastOptions={{
        // Default options
        duration: 4000,
        style: {
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          color: '#f8fafc',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          borderRadius: '16px',
          fontSize: '14px',
          fontWeight: '500',
          padding: '14px 18px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4), 0 0 40px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(12px)',
          maxWidth: '420px',
        },
        // Success toast
        success: {
          duration: 3500,
          iconTheme: {
            primary: '#10b981',
            secondary: '#ffffff',
          },
          style: {
            background: 'linear-gradient(135deg, #065f46 0%, #064e3b 100%)',
            color: '#f8fafc',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            boxShadow: '0 20px 60px rgba(16, 185, 129, 0.25), 0 0 40px rgba(16, 185, 129, 0.1)',
          },
        },
        // Error toast
        error: {
          duration: 5000,
          iconTheme: {
            primary: '#ef4444',
            secondary: '#ffffff',
          },
          style: {
            background: 'linear-gradient(135deg, #991b1b 0%, #7f1d1d 100%)',
            color: '#f8fafc',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            boxShadow: '0 20px 60px rgba(239, 68, 68, 0.25), 0 0 40px rgba(239, 68, 68, 0.1)',
          },
        },
        // Loading toast
        loading: {
          iconTheme: {
            primary: '#94a3b8',
            secondary: '#1e293b',
          },
          style: {
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            color: '#f8fafc',
            border: '1px solid rgba(148, 163, 184, 0.3)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4), 0 0 40px rgba(0, 0, 0, 0.1)',
          },
        },
      }}
    />
  );
}

/**
 * Custom toast functions with premium styling
 */
export const customToast = {
  success: (message: string, description?: string) => {
    toast.dismiss();
    return toast.custom((t) => (
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full pointer-events-auto`}
      >
        <div className="bg-gradient-to-br from-emerald-800 via-emerald-900 to-green-950 rounded-2xl shadow-2xl border border-emerald-600/30 overflow-hidden">
          <div className="p-4 flex items-start gap-3">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <p className="text-sm font-semibold text-white">{message}</p>
              {description && (
                <p className="text-xs text-emerald-200/70 mt-0.5">{description}</p>
              )}
            </div>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4 text-emerald-300/60" />
            </button>
          </div>
          <div className="h-1 bg-emerald-400/20">
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 3.5, ease: 'linear' }}
              className="h-full bg-emerald-400"
            />
          </div>
        </div>
      </motion.div>
    ), { duration: 3500 });
  },

  error: (message: string, description?: string) => {
    toast.dismiss();
    return toast.custom((t) => (
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full pointer-events-auto`}
      >
        <div className="bg-gradient-to-br from-red-800 via-red-900 to-red-950 rounded-2xl shadow-2xl border border-red-600/30 overflow-hidden">
          <div className="p-4 flex items-start gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <p className="text-sm font-semibold text-white">{message}</p>
              {description && (
                <p className="text-xs text-red-200/70 mt-0.5">{description}</p>
              )}
            </div>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4 text-red-300/60" />
            </button>
          </div>
          <div className="h-1 bg-red-400/20">
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 5, ease: 'linear' }}
              className="h-full bg-red-400"
            />
          </div>
        </div>
      </motion.div>
    ), { duration: 5000 });
  },

  warning: (message: string, description?: string) => {
    toast.dismiss();
    return toast.custom((t) => (
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full pointer-events-auto`}
      >
        <div className="bg-gradient-to-br from-amber-700 via-amber-800 to-orange-900 rounded-2xl shadow-2xl border border-amber-500/30 overflow-hidden">
          <div className="p-4 flex items-start gap-3">
            <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <p className="text-sm font-semibold text-white">{message}</p>
              {description && (
                <p className="text-xs text-amber-200/70 mt-0.5">{description}</p>
              )}
            </div>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4 text-amber-300/60" />
            </button>
          </div>
          <div className="h-1 bg-amber-400/20">
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 4, ease: 'linear' }}
              className="h-full bg-amber-400"
            />
          </div>
        </div>
      </motion.div>
    ), { duration: 4000 });
  },

  info: (message: string, description?: string) => {
    toast.dismiss();
    return toast.custom((t) => (
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full pointer-events-auto`}
      >
        <div className="bg-gradient-to-br from-blue-800 via-blue-900 to-indigo-950 rounded-2xl shadow-2xl border border-blue-500/30 overflow-hidden">
          <div className="p-4 flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Info className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <p className="text-sm font-semibold text-white">{message}</p>
              {description && (
                <p className="text-xs text-blue-200/70 mt-0.5">{description}</p>
              )}
            </div>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4 text-blue-300/60" />
            </button>
          </div>
          <div className="h-1 bg-blue-400/20">
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 4, ease: 'linear' }}
              className="h-full bg-blue-400"
            />
          </div>
        </div>
      </motion.div>
    ), { duration: 4000 });
  },

  loading: (message: string) => {
    toast.dismiss();
    return toast.custom((t) => (
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full pointer-events-auto`}
      >
        <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 rounded-2xl shadow-2xl border border-slate-600/30 overflow-hidden">
          <div className="p-4 flex items-start gap-3">
            <div className="w-10 h-10 bg-slate-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <p className="text-sm font-semibold text-white">{message}</p>
              <p className="text-xs text-slate-400 mt-0.5">Please wait...</p>
            </div>
          </div>
          <div className="h-1 bg-slate-400/20">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="h-full bg-slate-400"
            />
          </div>
        </div>
      </motion.div>
    ), { duration: Infinity });
  },

  dismiss: (toastId?: string) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  },

  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((err: Error) => string);
    }
  ) => {
    return toast.promise(promise, messages, {
      loading: {
        style: {
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          color: '#f8fafc',
          border: '1px solid rgba(148, 163, 184, 0.3)',
        },
      },
      success: {
        style: {
          background: 'linear-gradient(135deg, #065f46 0%, #064e3b 100%)',
          color: '#f8fafc',
          border: '1px solid rgba(16, 185, 129, 0.4)',
        },
      },
      error: {
        style: {
          background: 'linear-gradient(135deg, #991b1b 0%, #7f1d1d 100%)',
          color: '#f8fafc',
          border: '1px solid rgba(239, 68, 68, 0.4)',
        },
      },
    });
  },
};

/**
 * Dark mode toast configuration (same as default since our theme is dark)
 */
export function DarkToastProvider() {
  return <ToastProvider />;
}
