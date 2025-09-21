'use client';

import React, { useState } from 'react';

export default function TestBookingWorkflow() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testBookingSubmission = async () => {
    setLoading(true);
    setResult(null);

    // Use dates that are definitely in the future
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 3);

    const testBookingData = {
      camera_id: 'osmo-pocket-3',
      camera_name: 'DJI Osmo Pocket 3',
      start_date: tomorrow.toISOString().split('T')[0], // YYYY-MM-DD format
      end_date: dayAfter.toISOString().split('T')[0],
      total_days: 2,
      daily_rate: 50,
      total_amount: 100,
      deposit_amount: 30,
      final_payment_amount: 70,
      customer_name: 'Test Customer',
      customer_email: 'test@example.com',
      customer_phone: '+60123456789',
      pickup_method: 'pickup',
      booking_source: 'website'
    };

    try {
      console.log('Testing booking submission with data:', testBookingData);
      
      const response = await fetch('/api/bookings/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testBookingData),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      setResult({
        status: response.status,
        success: response.ok,
        data: data
      });

    } catch (error) {
      console.error('Error testing booking:', error);
      setResult({
        status: 'ERROR',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  const testAdminBookingsList = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/bookings');
      const data = await response.json();
      
      setResult({
        status: response.status,
        success: response.ok,
        data: data,
        type: 'admin_list'
      });
    } catch (error) {
      setResult({
        status: 'ERROR',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            🧪 Booking Workflow Test Suite
          </h1>
          
          <div className="space-y-6">
            {/* Test Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={testBookingSubmission}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Testing...' : '🎯 Test Booking Submission'}
              </button>
              
              <button
                onClick={testAdminBookingsList}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Testing...' : '📋 Test Admin Bookings List'}
              </button>
            </div>

            {/* Quick Links */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">🔗 Quick Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <a
                  href="/"
                  target="_blank"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  📱 Main Website
                </a>
                <a
                  href="/admin/bookings"
                  target="_blank"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  🏢 Admin Bookings
                </a>
                <a
                  href="/admin"
                  target="_blank"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  ⚙️ Admin Dashboard
                </a>
              </div>
            </div>

            {/* Results Display */}
            {result && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">📊 Test Results</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Status:</span>
                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                      result.success 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {result.status} {result.success ? '✅' : '❌'}
                    </span>
                  </div>

                  {result.data && (
                    <div>
                      <span className="font-medium">Response Data:</span>
                      <pre className="mt-2 bg-white p-4 rounded border text-sm overflow-auto max-h-96">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </div>
                  )}

                  {result.error && (
                    <div>
                      <span className="font-medium text-red-600">Error:</span>
                      <p className="mt-1 text-red-600">{result.error}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-3">📋 Testing Instructions</h3>
              <ol className="list-decimal list-inside space-y-2 text-blue-800">
                <li>Click "Test Booking Submission" to verify the booking API works</li>
                <li>Check if booking appears in "Test Admin Bookings List"</li>
                <li>Open Admin Bookings page to verify real-time sync</li>
                <li>Test approval/rejection workflow in admin panel</li>
                <li>Verify complete end-to-end workflow</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
