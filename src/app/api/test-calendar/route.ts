import { NextRequest, NextResponse } from 'next/server';
import { getAllBookings } from '@/lib/api/bookings';

export async function GET() {
  try {
    console.log('Testing calendar data fetch...');
    const bookings = await getAllBookings();
    console.log('Calendar test: Loaded bookings:', bookings.length);
    
    // Filter only confirmed bookings for calendar display
    const confirmedBookings = bookings.filter(booking => 
      booking.booking_status === 'confirmed'
    );
    console.log('Calendar test: Confirmed bookings:', confirmedBookings.length);
    
    // Convert bookings to calendar events
    const calendarEvents = confirmedBookings.map(booking => {
      const cameraName = booking.camera?.name || booking.camera_name || 'Camera';
      const customerName = booking.customer?.full_name || booking.customer?.name || 'Customer';
      
      return {
        id: booking.id,
        title: cameraName,
        camera: cameraName,
        customer: customerName,
        startDate: booking.start_date,
        endDate: booking.end_date,
        status: booking.booking_status || booking.status,
        booking_status: booking.booking_status,
        status_field: booking.status
      };
    });
    
    console.log('Calendar test: Created events:', calendarEvents.length);
    console.log('Calendar test: Sample event:', calendarEvents[0]);
    
    return NextResponse.json({
      success: true,
      totalBookings: bookings.length,
      confirmedBookings: confirmedBookings.length,
      calendarEvents: calendarEvents.length,
      events: calendarEvents,
      sampleBooking: bookings[0]
    });
  } catch (error) {
    console.error('Calendar test error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
