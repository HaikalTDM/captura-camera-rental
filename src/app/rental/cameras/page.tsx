'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import CameraCatalog from '@/components/CameraCatalog';
import RentalSummary from '@/components/RentalSummary';
import ClientAvailabilityCalendar from '@/components/ClientAvailabilityCalendar';
import { Camera, BookingDetails, CustomerDetails } from '@/types';

export default function CamerasPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [completedBooking, setCompletedBooking] = useState<BookingDetails | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [shouldOpenRentalKit, setShouldOpenRentalKit] = useState(searchParams.get('kit') === '1');

  useEffect(() => {
    const shouldOpenFromQuery = searchParams.get('kit') === '1';
    if (!shouldOpenFromQuery) return;

    setShouldOpenRentalKit(true);
    router.replace('/rental/cameras', { scroll: false });
  }, [router, searchParams]);

  const handleCameraBookingComplete = (
    camera: Camera,
    startDate?: Date,
    endDate?: Date,
    totalCost?: number,
    customerDetails?: CustomerDetails,
    totalDays?: number,
    dailyRate?: number
  ) => {
    if (startDate && endDate && totalCost && customerDetails && totalDays && dailyRate) {
      const bookingDetails: BookingDetails = {
        camera,
        startDate,
        endDate,
        totalDays,
        totalCost,
        dailyRate,
        customerDetails,
      };
      handleBookingComplete(bookingDetails);
    }
  };

  const handleBookingComplete = (booking: BookingDetails) => {
    setCompletedBooking(booking);
    setShowSummary(true);
  };

  const handleCloseSummary = () => {
    setShowSummary(false);
    setCompletedBooking(null);
  };

  const handleNewBooking = () => {
    setShowSummary(false);
    setCompletedBooking(null);
  };

  return (
    <div className="min-h-screen bg-zinc-950 pt-16 text-white pb-20">
      {/* Availability Calendar */}
      <section className="py-6 px-6">
        <div className="max-w-4xl mx-auto">
          <ClientAvailabilityCalendar />
        </div>
      </section>

      {/* Camera Catalog */}
      <section id="camera-catalog" className="py-8">
        <CameraCatalog
          onBookCamera={handleCameraBookingComplete}
          variant="dark"
          initialOpenRentalKit={shouldOpenRentalKit}
        />
      </section>

      {/* Rental Summary Modal */}
      {showSummary && completedBooking && (
        <RentalSummary
          booking={completedBooking}
          onClose={handleCloseSummary}
          onNewBooking={handleNewBooking}
        />
      )}
    </div>
  );
}

