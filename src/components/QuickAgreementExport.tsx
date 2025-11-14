'use client';

import { useState, useRef } from 'react';
import type { Booking, Customer, Camera } from '@/lib/supabase';
import RentalAgreementTemplate from './RentalAgreementTemplate';
import { exportToPDF, generatePDFFilename, printAgreement } from '@/utils/pdfExport';

interface QuickAgreementExportProps {
  booking: Booking;
  customer: Customer;
  camera: Camera;
  confirmationNumber?: string;
  className?: string;
}

export default function QuickAgreementExport({
  booking,
  customer,
  camera,
  confirmationNumber,
  className = ''
}: QuickAgreementExportProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [exporting, setExporting] = useState(false);
  const agreementRef = useRef<HTMLDivElement>(null);

  const handleExportPDF = async () => {
    if (!agreementRef.current) return;

    try {
      setExporting(true);
      const filename = generatePDFFilename(
        customer.full_name,
        confirmationNumber || booking.id.substring(0, 8).toUpperCase(),
        booking.id
      );

      await exportToPDF(agreementRef.current, { filename });
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = () => {
    printAgreement();
  };

  return (
    <>
      {/* Quick Action Buttons */}
      <div className={`flex gap-2 ${className}`}>
        <button
          onClick={() => setShowPreview(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          View Agreement
        </button>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-xl font-bold text-gray-900">Rental Agreement</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print
                </button>
                <button
                  onClick={handleExportPDF}
                  disabled={exporting}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {exporting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Exporting...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Export PDF
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-100">
              <div ref={agreementRef}>
                <RentalAgreementTemplate
                  booking={booking}
                  customer={customer}
                  camera={camera}
                  confirmationNumber={confirmationNumber || booking.id.substring(0, 8).toUpperCase()}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

