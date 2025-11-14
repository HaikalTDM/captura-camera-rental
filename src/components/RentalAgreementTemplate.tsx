'use client';

import React, { useRef } from 'react';
import { format } from 'date-fns';

interface Customer {
  full_name: string;
  email: string;
  phone: string;
  whatsapp?: string;
  address?: string;
  id_number?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
}

interface Camera {
  name: string;
  brand?: string;
  model?: string;
  serial_number?: string;
}

interface Booking {
  id: string;
  start_date: string;
  end_date: string;
  total_days: number;
  daily_rate: number;
  total_amount: number;
  deposit_amount: number;
  final_payment_amount: number;
  pickup_method: 'pickup' | 'delivery';
  pickup_address?: string;
  delivery_fee?: number;
  notes?: string;
  created_at: string;
}

interface RentalAgreementTemplateProps {
  booking: Booking;
  customer: Customer;
  camera: Camera;
  confirmationNumber?: string;
}

export default function RentalAgreementTemplate({
  booking,
  customer,
  camera,
  confirmationNumber
}: RentalAgreementTemplateProps) {
  const agreementRef = useRef<HTMLDivElement>(null);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMMM yyyy');
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMMM yyyy, hh:mm a');
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number) => {
    return `RM${amount.toFixed(2)}`;
  };

  // Calculate pickup date (day before rental start)
  const getPickupDate = () => {
    try {
      const startDate = new Date(booking.start_date);
      const pickupDate = new Date(startDate);
      pickupDate.setDate(pickupDate.getDate() - 1);
      return formatDate(pickupDate.toISOString());
    } catch {
      return formatDate(booking.start_date);
    }
  };

  const maxReplacementCost = 3600; // As per terms

  return (
    <div ref={agreementRef} className="bg-white p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8 border-b-4 border-blue-600 pb-6">
        <h1 className="text-3xl font-bold text-black mb-2">CAPTURA</h1>
        <h2 className="text-xl font-semibold text-black">Camera Rental Agreement</h2>
        {confirmationNumber && (
          <p className="text-sm text-black mt-2">
            Confirmation No: <span className="font-mono font-bold text-black">{confirmationNumber}</span>
          </p>
        )}
        <p className="text-xs text-gray-700 mt-1">
          Agreement Date: {formatDateTime(booking.created_at)}
        </p>
      </div>

      {/* Agreement Parties */}
      <div className="mb-8 grid grid-cols-2 gap-6">
        {/* Rental Company */}
        <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
          <h3 className="font-bold text-black mb-3 text-sm uppercase tracking-wide">Rental Company (Lessor)</h3>
          <div className="space-y-1 text-sm">
            <p className="font-semibold text-black">CAPTURA</p>
            <p className="text-black">Camera Rental Services</p>
            <p className="text-black">Malaysia</p>
            <p className="text-black">Contact: +60 17-746 4121</p>
          </div>
        </div>

        {/* Customer */}
        <div className="border border-gray-300 rounded-lg p-4 bg-blue-50">
          <h3 className="font-bold text-black mb-3 text-sm uppercase tracking-wide">Customer (Renter)</h3>
          <div className="space-y-1 text-sm">
            <p className="font-semibold text-black">{customer.full_name}</p>
            {customer.id_number && (
              <p className="text-black">IC/Passport: {customer.id_number}</p>
            )}
            <p className="text-black">Email: {customer.email}</p>
            <p className="text-black">Phone: {customer.phone}</p>
            {customer.address && (
              <p className="text-black">Address: {customer.address}</p>
            )}
          </div>
        </div>
      </div>

      {/* Rental Details */}
      <div className="mb-8">
        <h3 className="font-bold text-black mb-4 text-lg border-b-2 border-gray-300 pb-2">
          Rental Details
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="text-black font-medium">Equipment:</span>
              <span className="font-semibold text-black">{camera.name}</span>
            </div>
            {camera.serial_number && (
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-black font-medium">Serial Number:</span>
                <span className="font-mono text-sm text-black">{camera.serial_number}</span>
              </div>
            )}
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="text-black font-medium">Rental Start:</span>
              <span className="font-semibold text-black">{formatDate(booking.start_date)}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="text-black font-medium">Rental End:</span>
              <span className="font-semibold text-black">{formatDate(booking.end_date)}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="text-black font-medium">Total Days:</span>
              <span className="font-semibold text-black">{booking.total_days} day{booking.total_days > 1 ? 's' : ''}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="text-black font-medium">Daily Rate:</span>
              <span className="font-semibold text-black">{formatCurrency(booking.daily_rate)}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="text-black font-medium">Pickup Method:</span>
              <span className="font-semibold text-black capitalize">{booking.pickup_method}</span>
            </div>
            {booking.pickup_method === 'delivery' && booking.delivery_fee && (
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-black font-medium">Delivery Fee:</span>
                <span className="font-semibold text-black">{formatCurrency(booking.delivery_fee)}</span>
              </div>
            )}
          </div>
        </div>

        {booking.pickup_method === 'delivery' && booking.pickup_address && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm font-medium text-black">Delivery Address:</p>
            <p className="text-sm text-black">{booking.pickup_address}</p>
          </div>
        )}
      </div>

      {/* Payment Summary */}
      <div className="mb-8 bg-gray-50 border-2 border-gray-300 rounded-lg p-6">
        <h3 className="font-bold text-black mb-4 text-lg">Payment Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-black">Rental Amount ({booking.total_days} days × {formatCurrency(booking.daily_rate)}):</span>
            <span className="font-semibold text-black">{formatCurrency(booking.total_amount)}</span>
          </div>
          {booking.delivery_fee && booking.delivery_fee > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-black">Delivery Fee:</span>
              <span className="font-semibold text-black">{formatCurrency(booking.delivery_fee)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm border-t border-gray-300 pt-3">
            <span className="text-black font-medium">Security Deposit (Refundable):</span>
            <span className="font-semibold text-blue-600">{formatCurrency(booking.deposit_amount)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t-2 border-gray-400 pt-3">
            <span className="text-black">Total Amount Due:</span>
            <span className="text-blue-600">{formatCurrency(booking.final_payment_amount + (booking.delivery_fee || 0))}</span>
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      {customer.emergency_contact_name && customer.emergency_contact_phone && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="font-bold text-black mb-2 text-sm">Emergency Contact</h3>
          <div className="text-sm space-y-1 text-black">
            <p><span className="font-medium">Name:</span> {customer.emergency_contact_name}</p>
            <p><span className="font-medium">Phone:</span> {customer.emergency_contact_phone}</p>
          </div>
        </div>
      )}

      {/* Terms & Conditions */}
      <div className="mb-8 page-break-before">
        <h3 className="font-bold text-black mb-4 text-lg border-b-2 border-gray-300 pb-2">
          Terms & Conditions
        </h3>

        <div className="space-y-4 text-sm">
          {/* Section 1 */}
          <div>
            <h4 className="font-bold text-black mb-2">1. General Terms</h4>
            <ul className="list-disc list-inside space-y-1 text-black ml-2">
              <li>The Renter must be at least 18 years old with valid IC/Passport.</li>
              <li>By signing this agreement, the Renter agrees to all terms herein.</li>
              <li>Captura reserves the right to refuse rental service at its discretion.</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div>
            <h4 className="font-bold text-black mb-2">2. Rental Period & Late Returns</h4>
            <ul className="list-disc list-inside space-y-1 text-black ml-2">
              <li>Rental period: <strong>{formatDate(booking.start_date)}</strong> to <strong>{formatDate(booking.end_date)}</strong></li>
              <li>Late returns incur penalty: <strong>RM10 per hour</strong> or <strong>RM50 per day</strong></li>
              <li>Extensions must be requested in advance and are subject to availability.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div>
            <h4 className="font-bold text-black mb-2">3. Security Deposit</h4>
            <ul className="list-disc list-inside space-y-1 text-black ml-2">
              <li>Security deposit: <strong>{formatCurrency(booking.deposit_amount)}</strong> (refundable)</li>
              <li>Refunded upon return if equipment is undamaged with all accessories.</li>
              <li>May be forfeited partially/fully to cover repair or replacement costs.</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div>
            <h4 className="font-bold text-black mb-2">4. Equipment Liability & Responsibility</h4>
            <ul className="list-disc list-inside space-y-1 text-black ml-2">
              <li>Renter is fully responsible for equipment from pickup to return.</li>
              <li>Must not be used for unlawful activities or hazardous conditions.</li>
              <li>Must take reasonable care to prevent damage, loss, or theft.</li>
              <li>Report technical issues immediately to Captura.</li>
            </ul>
          </div>

          {/* Section 5 */}
          <div className="bg-yellow-50 border border-yellow-300 rounded p-3">
            <h4 className="font-bold text-black mb-2">5. Damage, Loss & Replacement</h4>
            <ul className="list-disc list-inside space-y-1 text-black ml-2">
              <li>Renter pays repair costs for damaged equipment.</li>
              <li>Full replacement cost if damaged beyond repair or lost: <strong>up to {formatCurrency(maxReplacementCost)}</strong></li>
              <li>Do not attempt to repair or tamper with equipment.</li>
            </ul>
          </div>

          {/* Section 6 */}
          <div>
            <h4 className="font-bold text-black mb-2">6. Cancellations & Refunds</h4>
            <ul className="list-disc list-inside space-y-1 text-black ml-2">
              <li>Cancellations 24+ hours before rental: Full refund eligible</li>
              <li>Cancellations within 24 hours: 50% charge of rental fee</li>
              <li>Booking deposit is non-refundable if cancelled anytime</li>
              <li>No refunds for early returns</li>
            </ul>
          </div>

          {/* Section 7 */}
          <div>
            <h4 className="font-bold text-black mb-2">7. Privacy & Data Protection</h4>
            <ul className="list-disc list-inside space-y-1 text-black ml-2">
              <li>Personal information used solely for verification and rental processing.</li>
              <li>Information will not be shared without consent.</li>
            </ul>
          </div>

          {/* Section 8 */}
          <div>
            <h4 className="font-bold text-black mb-2">8. Legal Compliance</h4>
            <ul className="list-disc list-inside space-y-1 text-black ml-2">
              <li>This agreement is governed by the laws of Malaysia.</li>
              <li>Failure to comply may result in legal action.</li>
              <li>Captura reserves the right to amend these terms without prior notice.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Additional Notes */}
      {booking.notes && (
        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-bold text-black mb-2 text-sm">Special Notes/Requests</h3>
          <p className="text-sm text-black">{booking.notes}</p>
        </div>
      )}

      {/* Signature Section */}
      <div className="mb-8 border-t-2 border-gray-400 pt-6">
        <h3 className="font-bold text-black mb-6 text-lg">Agreement Acknowledgment</h3>

        <div className="grid grid-cols-2 gap-8">
          {/* Renter Signature */}
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-black mb-3">Renter's Signature:</p>
              <div className="border-b-2 border-gray-400 h-16"></div>
            </div>
            <div>
              <p className="text-sm text-black">Name: <span className="font-semibold">{customer.full_name}</span></p>
              <p className="text-sm text-black mt-1">IC/Passport: {customer.id_number || '___________________'}</p>
            </div>
            <div>
              <p className="text-sm text-black">Date: <span className="font-semibold">{getPickupDate()}</span></p>
            </div>
          </div>

          {/* Lessor Signature */}
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-black mb-3">Lessor's Signature (Captura):</p>
              <div className="h-32 flex items-center">
                <img
                  src="/images/HaikalSign.png"
                  alt="Muhammad Haikal Signature"
                  className="max-h-32 w-auto object-contain"
                  style={{ maxWidth: '300px' }}
                />
              </div>
            </div>
            <div>
              <p className="text-sm text-black">Name: <span className="font-semibold">Muhammad Haikal</span></p>
              <p className="text-sm text-black mt-1">Position: Owner / CEO</p>
            </div>
            <div>
              <p className="text-sm text-black">Date: <span className="font-semibold">{getPickupDate()}</span></p>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-100 border border-gray-300 rounded">
          <p className="text-xs text-black italic">
            By signing this agreement, both parties acknowledge that they have read, understood, and agree to be bound by all terms and conditions stated herein. The Renter confirms receipt of the equipment in good working condition and agrees to return it in the same condition, subject to normal wear and tear.
          </p>
        </div>
      </div>



      {/* Footer */}
      <div className="text-center text-xs text-gray-700 border-t border-gray-300 pt-4">
        <p>CAPTURA Camera Rental Services | Malaysia</p>
        <p className="mt-1">Contact: +60 17-746 4121 | This is a legally binding agreement</p>
        <p className="mt-1">Agreement ID: {booking.id}</p>
        {confirmationNumber && (
          <p className="mt-1 font-mono">Confirmation: {confirmationNumber}</p>
        )}
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .page-break-before {
            page-break-before: always;
          }

          @page {
            margin: 1.5cm;
          }
        }
      `}</style>
    </div>
  );
}


