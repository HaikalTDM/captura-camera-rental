'use client';

import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { CheckCircle2, XCircle, AlertCircle, Info, X, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface AnimatedToastProps {
  id: string;
  type: ToastType;
  message: string;
  description?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const toastVariants = {
  initial: {
    opacity: 0,
    y: -50,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 500,
      damping: 30,
      mass: 1,
    },
  },
  exit: {
    opacity: 0,
    x: 100,
    scale: 0.95,
    transition: {
      duration: 0.2,
      ease: 'easeInOut' as const,
    },
  },
} satisfies Variants;

const iconVariants = {
  initial: { scale: 0, rotate: -180 },
  animate: {
    scale: 1,
    rotate: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 20,
      delay: 0.1,
    },
  },
} satisfies Variants;

export function AnimatedToast({
  id,
  type,
  message,
  description,
  duration = 4000,
  onClose,
}: AnimatedToastProps) {
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (type === 'loading' || isHovered) return;

    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose, type, isHovered]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-amber-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />;
      case 'loading':
        return <Loader2 className="w-5 h-5 text-slate-600 animate-spin" />;
      default:
        return <Info className="w-5 h-5 text-slate-600" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return 'border-green-500';
      case 'error':
        return 'border-red-500';
      case 'warning':
        return 'border-amber-500';
      case 'info':
        return 'border-blue-500';
      case 'loading':
        return 'border-slate-400';
      default:
        return 'border-slate-300';
    }
  };

  const getProgressColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-amber-500';
      case 'info':
        return 'bg-blue-500';
      case 'loading':
        return 'bg-slate-400';
      default:
        return 'bg-slate-300';
    }
  };

  return (
    <motion.div
      layout
      variants={toastVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative overflow-hidden
        bg-white border-2 ${getBorderColor()}
        rounded-xl shadow-lg
        max-w-md w-full
        pointer-events-auto
      `}
      style={{
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.06)',
      }}
    >
      {/* Progress bar */}
      {type !== 'loading' && (
        <motion.div
          className={`absolute bottom-0 left-0 h-1 ${getProgressColor()} origin-left`}
          initial={{ scaleX: 1 }}
          animate={isHovered ? { scaleX: 1 } : {
            scaleX: 0,
            transition: {
              duration: duration / 1000,
              ease: 'linear' as const,
            },
          }}
        />
      )}

      <div className="flex items-start gap-3 p-4">
        {/* Icon */}
        <motion.div
          variants={iconVariants}
          initial="initial"
          animate="animate"
          className="flex-shrink-0 mt-0.5"
        >
          {getIcon()}
        </motion.div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 leading-tight">
            {message}
          </p>
          {description && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ delay: 0.1 }}
              className="text-xs text-slate-600 mt-1 leading-relaxed"
            >
              {description}
            </motion.p>
          )}
        </div>

        {/* Close button */}
        {type !== 'loading' && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onClose(id)}
            className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors rounded-lg p-1 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

export interface ToastContainerProps {
  toasts: Array<{
    id: string;
    type: ToastType;
    message: string;
    description?: string;
    duration?: number;
  }>;
  onClose: (id: string) => void;
}

export function AnimatedToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-[9999] pointer-events-none">
      <AnimatePresence mode="popLayout">
        <div className="flex flex-col gap-2">
          {toasts.map((toast) => (
            <AnimatedToast
              key={toast.id}
              id={toast.id}
              type={toast.type}
              message={toast.message}
              description={toast.description}
              duration={toast.duration}
              onClose={onClose}
            />
          ))}
        </div>
      </AnimatePresence>
    </div>
  );
}

/**
 * Hook for managing animated toasts
 */
export function useAnimatedToast() {
  const [toasts, setToasts] = useState<
    Array<{
      id: string;
      type: ToastType;
      message: string;
      description?: string;
      duration?: number;
    }>
  >([]);

  const addToast = (
    type: ToastType,
    message: string,
    description?: string,
    duration?: number
  ) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message, description, duration }]);
    return id;
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const success = (message: string, description?: string, duration?: number) => {
    return addToast('success', message, description, duration);
  };

  const error = (message: string, description?: string, duration?: number) => {
    return addToast('error', message, description, duration);
  };

  const warning = (message: string, description?: string, duration?: number) => {
    return addToast('warning', message, description, duration);
  };

  const info = (message: string, description?: string, duration?: number) => {
    return addToast('info', message, description, duration);
  };

  const loading = (message: string, description?: string) => {
    return addToast('loading', message, description);
  };

  return {
    toasts,
    success,
    error,
    warning,
    info,
    loading,
    removeToast,
  };
}

