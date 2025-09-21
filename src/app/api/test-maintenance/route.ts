import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('=== TEST MAINTENANCE API ===');
    
    // Test maintenance records
    console.log('Fetching maintenance records...');
    const { data: maintenanceRecords, error: maintenanceError } = await supabase
      .from('maintenance_records')
      .select('*')
      .order('maintenance_date', { ascending: false });
    
    if (maintenanceError) {
      console.error('Maintenance records error:', maintenanceError);
    } else {
      console.log('Maintenance records found:', maintenanceRecords?.length || 0);
    }
    
    // Test cameras with maintenance data
    console.log('Fetching cameras with maintenance info...');
    const { data: cameras, error: camerasError } = await supabase
      .from('cameras')
      .select('id, name, last_maintenance, condition');
    
    if (camerasError) {
      console.error('Cameras error:', camerasError);
    } else {
      console.log('Cameras found:', cameras?.length || 0);
    }
    
    // Test bookings for revenue calculation
    console.log('Fetching bookings for revenue...');
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        id, 
        total_amount, 
        deposit_amount, 
        final_payment_amount,
        deposit_paid,
        final_payment_paid,
        status,
        created_at,
        camera_id
      `)
      .order('created_at', { ascending: false });
    
    if (bookingsError) {
      console.error('Bookings error:', bookingsError);
    } else {
      console.log('Bookings found:', bookings?.length || 0);
      
      // Calculate revenue
      const fullyPaidBookings = bookings?.filter(b => b.deposit_paid && b.final_payment_paid) || [];
      const totalRevenue = fullyPaidBookings.reduce((sum, b) => {
        const isNewPaymentSystem = b.deposit_amount === 100;
        return sum + (isNewPaymentSystem ? (b.deposit_amount + b.final_payment_amount) : b.total_amount);
      }, 0);
      
      console.log('Fully paid bookings:', fullyPaidBookings.length);
      console.log('Total revenue:', totalRevenue);
    }
    
    return NextResponse.json({
      success: true,
      maintenanceRecords: maintenanceRecords || [],
      cameras: cameras || [],
      bookings: bookings || [],
      summary: {
        maintenanceRecordsCount: maintenanceRecords?.length || 0,
        camerasCount: cameras?.length || 0,
        bookingsCount: bookings?.length || 0,
        fullyPaidBookingsCount: bookings?.filter(b => b.deposit_paid && b.final_payment_paid).length || 0
      }
    });
    
  } catch (error) {
    console.error('Test maintenance API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
