'use client';

import { useState } from 'react';

export default function TestBookingPage() {
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
      camera_name: 'Osmo Pocket 3',
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
      console.log('Sending test booking:', testBookingData);
      
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
        data: data
      });
    } catch (error) {
      console.error('Error:', error);
      setResult({
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Test Booking Submission</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Booking API</h2>
          <p className="text-gray-600 mb-4">
            This page tests the booking submission API to ensure bookings are saved to the database.
          </p>
          
          <button
            onClick={testBookingSubmission}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Booking Submission'}
          </button>
        </div>

        {result && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Result:</h3>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
            
            {result.data?.success && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
                <p className="text-green-800 font-medium">✅ Booking submitted successfully!</p>
                <p className="text-green-700">Confirmation: {result.data.confirmation_number}</p>
                <p className="text-green-700">Booking ID: {result.data.booking_id}</p>
              </div>
            )}
            
            {result.error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
                <p className="text-red-800 font-medium">❌ Error occurred:</p>
                <p className="text-red-700">{result.error}</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Next Steps:</h3>
          <ol className="list-decimal list-inside text-blue-800 space-y-1">
            <li>Click "Test Booking Submission" above</li>
            <li>Check if the booking is successful</li>
            <li>Go to <a href="/admin/bookings" className="underline">/admin/bookings</a> to see if the booking appears</li>
            <li>If successful, the main website booking flow should work the same way</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
