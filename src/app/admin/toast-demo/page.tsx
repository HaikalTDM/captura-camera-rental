'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAnimatedToast, AnimatedToastContainer } from '@/components/ui/animated-toast';
import { CheckCircle2, XCircle, AlertCircle, Info, Loader2, Sparkles } from 'lucide-react';

export default function ToastDemoPage() {
  const [useCustomToast, setUseCustomToast] = useState(false);
  const animatedToast = useAnimatedToast();

  const showSuccess = () => {
    if (useCustomToast) {
      animatedToast.success(
        'Deposit marked as paid successfully',
        'The payment has been processed and recorded.'
      );
    } else {
      toast.success('Deposit marked as paid successfully');
    }
  };

  const showError = () => {
    if (useCustomToast) {
      animatedToast.error(
        'Failed to generate PDF',
        'Please try again or contact support if the issue persists.'
      );
    } else {
      toast.error('Failed to generate PDF. Please try again.');
    }
  };

  const showWarning = () => {
    if (useCustomToast) {
      animatedToast.warning(
        'This action cannot be undone',
        'Please confirm before proceeding.'
      );
    } else {
      toast('This action cannot be undone', {
        icon: '⚠️',
        style: {
          border: '2px solid #f59e0b',
        },
      });
    }
  };

  const showInfo = () => {
    if (useCustomToast) {
      animatedToast.info(
        'New feature available!',
        'Check out the updated rental agreement system.'
      );
    } else {
      toast('New feature available!', {
        icon: 'ℹ️',
        style: {
          border: '2px solid #3b82f6',
        },
      });
    }
  };

  const showLoading = () => {
    if (useCustomToast) {
      const id = animatedToast.loading('Processing payment...', 'Please wait while we verify the transaction.');
      setTimeout(() => {
        animatedToast.removeToast(id);
        animatedToast.success('Payment completed!');
      }, 3000);
    } else {
      const loadingToast = toast.loading('Processing payment...');
      setTimeout(() => {
        toast.dismiss(loadingToast);
        toast.success('Payment completed!');
      }, 3000);
    }
  };

  const showMultiple = () => {
    if (useCustomToast) {
      animatedToast.success('First notification');
      setTimeout(() => animatedToast.info('Second notification'), 500);
      setTimeout(() => animatedToast.warning('Third notification'), 1000);
    } else {
      toast.success('First notification');
      setTimeout(() => toast('Second notification', { icon: 'ℹ️' }), 500);
      setTimeout(() => toast('Third notification', { icon: '⚠️' }), 1000);
    }
  };

  const showCustom = () => {
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? 'animate-toastBounceIn' : 'animate-toastSlideOut'
          } max-w-md w-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg rounded-xl pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-semibold text-white">
                  Custom Toast!
                </p>
                <p className="mt-1 text-xs text-white/90">
                  You can create fully custom toasts with any design.
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-white/20">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-xl p-4 flex items-center justify-center text-sm font-medium text-white hover:bg-white/10 focus:outline-none"
            >
              Close
            </button>
          </div>
        </div>
      ),
      { duration: 5000 }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            🎨 Toast Notification Demo
          </h1>
          <p className="text-slate-600 text-lg">
            Beautiful, animated toasts with Framer Motion
          </p>
        </div>

        {/* Toggle */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Toast Type</h3>
              <p className="text-sm text-slate-600 mt-1">
                {useCustomToast ? 'Using custom animated toasts' : 'Using react-hot-toast'}
              </p>
            </div>
            <button
              onClick={() => setUseCustomToast(!useCustomToast)}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                useCustomToast ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  useCustomToast ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Toast Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Success */}
          <button
            onClick={showSuccess}
            className="group bg-white hover:bg-green-50 border-2 border-green-500 rounded-xl p-6 transition-all hover:shadow-lg hover:scale-105"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-slate-900">Success Toast</h3>
                <p className="text-sm text-slate-600">Show success message</p>
              </div>
            </div>
          </button>

          {/* Error */}
          <button
            onClick={showError}
            className="group bg-white hover:bg-red-50 border-2 border-red-500 rounded-xl p-6 transition-all hover:shadow-lg hover:scale-105"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-slate-900">Error Toast</h3>
                <p className="text-sm text-slate-600">Show error message</p>
              </div>
            </div>
          </button>

          {/* Warning */}
          <button
            onClick={showWarning}
            className="group bg-white hover:bg-amber-50 border-2 border-amber-500 rounded-xl p-6 transition-all hover:shadow-lg hover:scale-105"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 rounded-lg group-hover:bg-amber-200 transition-colors">
                <AlertCircle className="w-6 h-6 text-amber-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-slate-900">Warning Toast</h3>
                <p className="text-sm text-slate-600">Show warning message</p>
              </div>
            </div>
          </button>

          {/* Info */}
          <button
            onClick={showInfo}
            className="group bg-white hover:bg-blue-50 border-2 border-blue-500 rounded-xl p-6 transition-all hover:shadow-lg hover:scale-105"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <Info className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-slate-900">Info Toast</h3>
                <p className="text-sm text-slate-600">Show info message</p>
              </div>
            </div>
          </button>

          {/* Loading */}
          <button
            onClick={showLoading}
            className="group bg-white hover:bg-slate-50 border-2 border-slate-500 rounded-xl p-6 transition-all hover:shadow-lg hover:scale-105"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-100 rounded-lg group-hover:bg-slate-200 transition-colors">
                <Loader2 className="w-6 h-6 text-slate-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-slate-900">Loading Toast</h3>
                <p className="text-sm text-slate-600">Show loading state</p>
              </div>
            </div>
          </button>

          {/* Custom */}
          <button
            onClick={showCustom}
            className="group bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 border-2 border-transparent rounded-xl p-6 transition-all hover:shadow-lg hover:scale-105"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-white">Custom Toast</h3>
                <p className="text-sm text-white/90">Fully customizable</p>
              </div>
            </div>
          </button>
        </div>

        {/* Multiple Toasts */}
        <button
          onClick={showMultiple}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl p-6 transition-all hover:shadow-lg"
        >
          <h3 className="font-semibold text-lg">Show Multiple Toasts</h3>
          <p className="text-sm text-slate-300 mt-1">See how toasts stack</p>
        </button>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Features</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>✅ Spring-based animations with Framer Motion</li>
            <li>✅ Hover to pause auto-dismiss</li>
            <li>✅ Progress bar countdown</li>
            <li>✅ Monochrome design with shadcn/ui styling</li>
            <li>✅ 60fps performance optimized</li>
            <li>✅ Mobile responsive</li>
          </ul>
        </div>
      </div>

      {/* Custom Toast Container (only if using custom toasts) */}
      {useCustomToast && (
        <AnimatedToastContainer
          toasts={animatedToast.toasts}
          onClose={animatedToast.removeToast}
        />
      )}
    </div>
  );
}

