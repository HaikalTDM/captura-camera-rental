'use client';

import { useAdminData } from '@/contexts/AdminDataContext';
import { useState } from 'react';

export function RefreshButton() {
  const { mutate } = useAdminData();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await mutate();
      // Show brief success feedback
      setTimeout(() => setIsRefreshing(false), 1000);
    } catch (error) {
      console.error('Error refreshing data:', error);
      setIsRefreshing(false);
    }
  };

  return (
    <button
      onClick={handleRefresh}
      disabled={isRefreshing}
      className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      title="Refresh data"
    >
      <svg
        className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
      <span className="text-sm font-medium text-gray-700">
        {isRefreshing ? 'Refreshing...' : 'Refresh'}
      </span>
    </button>
  );
}

