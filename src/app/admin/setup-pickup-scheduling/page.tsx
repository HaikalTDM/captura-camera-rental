'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SetupPickupScheduling() {
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [setupResults, setSetupResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSetupPickupScheduling = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/add-pickup-date-column', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSetupResults(data.results);
        setIsSetupComplete(true);
      } else {
        setError(data.error || 'Setup failed');
        if (data.instructions) {
          setError(data.message + '\n\nInstructions:\n' + data.instructions.join('\n'));
        }
      }
    } catch (err) {
      setError('Network error occurred. Please try again.');
      console.error('Setup error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Pickup Scheduling System Setup</h1>
            <p className="text-blue-100 text-lg">Configure the pickup scheduling system for CAPTURA</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
            <p className="text-blue-100 text-sm">Business Rule</p>
            <p className="text-lg font-bold">Pickup = Start Date - 1 Day</p>
          </div>
        </div>
      </div>

      {/* Setup Instructions */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          📋 Setup Instructions
        </h2>
        
        <div className="space-y-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Business Rule</h3>
            <p className="text-blue-800 text-sm">
              Customers must pick up their rented cameras <strong>one day before</strong> their rental start date.
            </p>
            <p className="text-blue-700 text-sm mt-2">
              Example: If rental starts on September 25, 2025, pickup is scheduled for September 24, 2025.
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-medium text-green-900 mb-2">What This Setup Does</h3>
            <ul className="text-green-800 text-sm space-y-1">
              <li>• Adds <code className="bg-green-100 px-1 rounded">pickup_date</code> column to bookings table</li>
              <li>• Calculates pickup dates for existing bookings</li>
              <li>• Enables "Today's Pickups" functionality in admin dashboard</li>
              <li>• Provides pickup scheduling and tracking capabilities</li>
            </ul>
          </div>
        </div>

        {!isSetupComplete && !error && (
          <div className="text-center">
            <button
              onClick={handleSetupPickupScheduling}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Setting up...
                </>
              ) : (
                <>
                  🚀 Setup Pickup Scheduling System
                </>
              )}
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-medium text-red-900 mb-2">⚠️ Setup Required</h3>
            <div className="text-red-800 text-sm whitespace-pre-line">{error}</div>
            
            {error.includes('manually in Supabase dashboard') && (
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded p-3">
                <h4 className="font-medium text-yellow-900 mb-2">Manual Setup Steps:</h4>
                <ol className="text-yellow-800 text-sm space-y-1 list-decimal list-inside">
                  <li>Go to <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Supabase Dashboard</a></li>
                  <li>Navigate to Table Editor → bookings table</li>
                  <li>Click "Add Column" button</li>
                  <li>Set Name: <code className="bg-yellow-100 px-1 rounded">pickup_date</code></li>
                  <li>Set Type: <code className="bg-yellow-100 px-1 rounded">date</code></li>
                  <li>Allow nullable: ✅ (checked)</li>
                  <li>Click "Save" to create the column</li>
                  <li>Return to this page and click "Setup" again</li>
                </ol>
              </div>
            )}
            
            <button
              onClick={handleSetupPickupScheduling}
              disabled={isLoading}
              className="mt-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded text-sm"
            >
              {isLoading ? 'Retrying...' : 'Retry Setup'}
            </button>
          </div>
        )}

        {isSetupComplete && setupResults && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-medium text-green-900 mb-4 flex items-center gap-2">
              ✅ Setup Completed Successfully!
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-white rounded p-3 border border-green-200">
                <p className="text-sm text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-green-600">{setupResults.totalBookings}</p>
              </div>
              <div className="bg-white rounded p-3 border border-green-200">
                <p className="text-sm text-gray-600">Bookings Updated</p>
                <p className="text-2xl font-bold text-blue-600">{setupResults.bookingsUpdated}</p>
              </div>
              <div className="bg-white rounded p-3 border border-green-200">
                <p className="text-sm text-gray-600">Today's Pickups</p>
                <p className="text-2xl font-bold text-purple-600">{setupResults.todaysPickupsCount}</p>
              </div>
            </div>

            {setupResults.todaysPickups && setupResults.todaysPickups.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-green-900 mb-2">Today's Pickups Preview:</h4>
                <div className="space-y-2">
                  {setupResults.todaysPickups.slice(0, 3).map((pickup: any, index: number) => (
                    <div key={index} className="bg-white rounded p-2 border border-green-200 text-sm">
                      <span className="font-medium">{pickup.customer}</span> - {pickup.camera}
                      <span className="text-gray-500 ml-2">
                        (Pickup: {pickup.pickupDate}, Rental: {pickup.startDate})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Link
                href="/admin"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium"
              >
                Go to Dashboard
              </Link>
              <Link
                href="/admin/bookings"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium"
              >
                View All Bookings
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Sample Data Preview */}
      {setupResults && setupResults.sampleData && setupResults.sampleData.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            📊 Sample Pickup Dates
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2">Booking ID</th>
                  <th className="text-left py-2">Pickup Date</th>
                  <th className="text-left py-2">Rental Start</th>
                  <th className="text-left py-2">Calculation</th>
                </tr>
              </thead>
              <tbody>
                {setupResults.sampleData.map((booking: any) => (
                  <tr key={booking.id} className="border-b border-gray-100">
                    <td className="py-2 font-mono text-xs">{booking.id.substring(0, 8)}...</td>
                    <td className="py-2 text-green-600 font-medium">{booking.pickup_date}</td>
                    <td className="py-2 text-blue-600">{booking.start_date}</td>
                    <td className="py-2 text-gray-500 text-xs">Start Date - 1 Day</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
