'use client';

import React, { useEffect } from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

// Helper function to check if error is DOM-related and should be suppressed
function isDOMCleanupError(error: Error | any): boolean {
  if (!error) return false;
  
  const errorStr = error.toString().toLowerCase();
  const messageStr = (error.message || '').toLowerCase();
  const stackStr = (error.stack || '').toLowerCase();
  
  // Check for various DOM cleanup errors
  const domErrorPatterns = [
    'removechild',
    'remove child',
    'cannot read properties of null',
    'cannot read property \'removechild\'',
    'node.removechild',
    'parentnode.removechild',
    'commitdeletioneffects',
  ];
  
  return domErrorPatterns.some(pattern => 
    errorStr.includes(pattern) || 
    messageStr.includes(pattern) || 
    stackStr.includes(pattern)
  );
}

// Global error handler component
function GlobalErrorHandler() {
  useEffect(() => {
    // Catch unhandled errors
    const handleError = (event: ErrorEvent) => {
      if (isDOMCleanupError(event.error)) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    };

    // Catch unhandled promise rejections
    const handleRejection = (event: PromiseRejectionEvent) => {
      if (isDOMCleanupError(event.reason)) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    };

    window.addEventListener('error', handleError, true);
    window.addEventListener('unhandledrejection', handleRejection, true);

    return () => {
      window.removeEventListener('error', handleError, true);
      window.removeEventListener('unhandledrejection', handleRejection, true);
    };
  }, []);

  return null;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // Suppress DOM cleanup errors
    if (isDOMCleanupError(error)) {
      return { hasError: false, error: null };
    }
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Suppress DOM cleanup errors
    if (isDOMCleanupError(error)) {
      this.setState({ hasError: false, error: null });
      return;
    }
    if (process.env.NODE_ENV !== 'production') {
      console.error('[ErrorBoundary] Caught error:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-4">{this.state.error.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return (
      <>
        <GlobalErrorHandler />
        {this.props.children}
      </>
    );
  }
}

export default ErrorBoundary;
