'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { bulkCreateBookings, createCustomer, getAllCustomers, getAllCameras } from '@/lib/api/bookings';

export default function ImportBookingsPage() {
  const router = useRouter();
  const [csvData, setCsvData] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [importResults, setImportResults] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);

  const sampleCsv = `customer_name,customer_email,customer_phone,camera_name,start_date,end_date,daily_rate,deposit_paid,final_payment_paid,status,booking_source,notes
Ahmad Rahman,ahmad@email.com,0123456789,DJI Osmo Pocket 3,2024-01-15,2024-01-17,80,true,true,completed,historical,Wedding photography
Siti Nurhaliza,siti@email.com,0198765432,DJI Action 5 Pro,2024-01-20,2024-01-22,70,true,false,active,phone,Travel vlog content
David Lim,david@email.com,0176543210,DJI Osmo Pocket 3,2024-02-01,2024-02-03,80,false,false,pending,whatsapp,Corporate event`;

  const handleImport = async () => {
    if (!csvData.trim()) {
      alert('Please paste CSV data');
      return;
    }

    setIsLoading(true);
    setImportResults(null);

    try {
      // Parse CSV data
      const lines = csvData.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      const rows = lines.slice(1);

      // Get existing customers and cameras
      const [customers, cameras] = await Promise.all([
        getAllCustomers(),
        getAllCameras()
      ]);

      const bookingsToCreate = [];
      const customersToCreate = new Map();

      for (const row of rows) {
        const values = row.split(',').map(v => v.trim());
        const rowData: any = {};
        
        headers.forEach((header, index) => {
          rowData[header] = values[index] || '';
        });

        // Find or prepare customer
        let customer = customers.find(c => 
          c.email.toLowerCase() === rowData.customer_email?.toLowerCase() ||
          c.phone === rowData.customer_phone
        );

        if (!customer) {
          // Check if we already plan to create this customer
          const customerKey = rowData.customer_email?.toLowerCase() || rowData.customer_phone;
          if (!customersToCreate.has(customerKey)) {
            customersToCreate.set(customerKey, {
              full_name: rowData.customer_name,
              email: rowData.customer_email,
              phone: rowData.customer_phone,
              whatsapp: rowData.customer_phone // Default to same as phone
            });
          }
        }

        // Find camera
        const camera = cameras.find(c => 
          c.name.toLowerCase().includes(rowData.camera_name?.toLowerCase()) ||
          rowData.camera_name?.toLowerCase().includes(c.name.toLowerCase())
        );

        if (!camera) {
          console.warn(`Camera not found: ${rowData.camera_name}`);
          continue;
        }

        // Calculate booking details
        const startDate = new Date(rowData.start_date);
        const endDate = new Date(rowData.end_date);
        const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const dailyRate = parseFloat(rowData.daily_rate) || camera.daily_rate;
        const totalAmount = dailyRate * totalDays;
        const depositAmount = 100; // Fixed RM100 deposit
        const finalPaymentAmount = totalAmount; // Full rental amount (separate from deposit)

        const bookingData = {
          customer_email: rowData.customer_email,
          customer_name: rowData.customer_name,
          customer_phone: rowData.customer_phone,
          camera_id: camera.id,
          start_date: rowData.start_date,
          end_date: rowData.end_date,
          total_days: totalDays,
          daily_rate: dailyRate,
          total_amount: totalAmount,
          deposit_amount: depositAmount,
          deposit_paid: rowData.deposit_paid === 'true',
          deposit_paid_date: rowData.deposit_paid === 'true' ? rowData.start_date : null,
          final_payment_amount: finalPaymentAmount,
          final_payment_paid: rowData.final_payment_paid === 'true',
          final_payment_paid_date: rowData.final_payment_paid === 'true' ? rowData.end_date : null,
          booking_status: rowData.status || 'completed', // Use booking_status instead of status
          pickup_method: 'pickup',
          delivery_fee: 0,
          booking_source: rowData.booking_source || 'historical',
          notes: rowData.notes || ''
        };

        bookingsToCreate.push(bookingData);
      }

      // Create new customers first
      const createdCustomers = new Map();
      for (const [key, customerData] of customersToCreate) {
        const newCustomer = await createCustomer(customerData);
        if (newCustomer) {
          createdCustomers.set(key, newCustomer);
        }
      }

      // Update bookings with customer IDs
      const finalBookings = [];
      for (const booking of bookingsToCreate) {
        let customer = customers.find(c => 
          c.email.toLowerCase() === booking.customer_email?.toLowerCase() ||
          c.phone === booking.customer_phone
        );

        if (!customer) {
          const customerKey = booking.customer_email?.toLowerCase() || booking.customer_phone;
          customer = createdCustomers.get(customerKey);
        }

        if (customer) {
          const { customer_email, customer_name, customer_phone, ...bookingWithoutCustomerFields } = booking;
          finalBookings.push({
            ...bookingWithoutCustomerFields,
            customer_id: customer.id
          });
        }
      }

      // Bulk create bookings
      const results = await bulkCreateBookings(finalBookings);
      setImportResults(results);

    } catch (error) {
      console.error('Import error:', error);
      alert('An error occurred during import');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Import Historical Bookings</h1>
          <p className="text-gray-600 mt-2">Bulk import your historical booking records via CSV</p>
        </div>
        <button
          onClick={() => router.push('/admin/bookings')}
          className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Back to Bookings
        </button>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* CSV Input */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">CSV Data</h2>
            <p className="text-gray-600 mb-4 text-gray-00">
              Paste your CSV data below. The first row should contain headers.
            </p>
            
            <textarea
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              className="w-full h-96 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder="Paste your CSV data here..."
            />

            <div className="mt-4 flex gap-4">
              <button
                onClick={handleImport}
                disabled={isLoading || !csvData.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Importing...
                  </>
                ) : (
                  'Import Bookings'
                )}
              </button>
              
              <button
                onClick={() => setCsvData(sampleCsv)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Load Sample Data
              </button>
            </div>
          </div>

          {/* Instructions & Sample */}
          <div className="space-y-6">
            {/* CSV Format Instructions */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">CSV Format Requirements</h2>
              <div className="space-y-3 text-sm text-gray-700">
                <div><strong>Required Headers:</strong></div>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><code>customer_name</code> - Full customer name</li>
                  <li><code>customer_email</code> - Customer email address</li>
                  <li><code>customer_phone</code> - Customer phone number</li>
                  <li><code>camera_name</code> - Camera name (must match existing cameras)</li>
                  <li><code>start_date</code> - Booking start date (YYYY-MM-DD)</li>
                  <li><code>end_date</code> - Booking end date (YYYY-MM-DD)</li>
                </ul>
                
                <div className="mt-4"><strong>Optional Headers:</strong></div>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><code>daily_rate</code> - Custom daily rate (defaults to camera rate)</li>
                  <li><code>deposit_paid</code> - true/false</li>
                  <li><code>final_payment_paid</code> - true/false</li>
                  <li><code>status</code> - pending/confirmed/active/completed/cancelled</li>
                  <li><code>booking_source</code> - historical/phone/whatsapp/walk-in</li>
                  <li><code>notes</code> - Additional notes</li>
                </ul>
              </div>
            </div>

            {/* Import Results */}
            {importResults && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Import Results</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-green-600 font-medium">Successfully imported:</span>
                    <span className="font-bold">{importResults.success}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-600 font-medium">Failed:</span>
                    <span className="font-bold">{importResults.failed}</span>
                  </div>
                  
                  {importResults.errors.length > 0 && (
                    <div className="mt-4">
                      <h3 className="font-medium text-gray-900 mb-2">Errors:</h3>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        {importResults.errors.map((error, index) => (
                          <div key={index} className="text-sm text-red-700">{error}</div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {importResults.success > 0 && (
                    <div className="mt-4">
                      <button
                        onClick={() => router.push('/admin/bookings')}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                      >
                        View Imported Bookings
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
