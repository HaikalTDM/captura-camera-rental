import { NextRequest, NextResponse } from 'next/server';
import { getAllBookings, getBookingStats } from '@/lib/api/bookings';

export async function GET(request: NextRequest) {
  try {
    console.log('=== TEST BOOKINGS API ===');
    
    // Test getAllBookings
    console.log('Testing getAllBookings...');
    const bookings = await getAllBookings();
    console.log('Bookings result:', bookings.length, 'bookings found');
    
    // Test getBookingStats
    console.log('Testing getBookingStats...');
    const stats = await getBookingStats();
    console.log('Stats result:', stats);
    
    return NextResponse.json({
      success: true,
      bookings: bookings,
      stats: stats,
      message: `Found ${bookings.length} bookings`
    });
    
  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
