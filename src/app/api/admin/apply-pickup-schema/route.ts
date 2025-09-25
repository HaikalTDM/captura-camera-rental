import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Applying pickup scheduling schema...');

    // Step 1: Test if pickup_date column already exists
    console.log('📝 Step 1: Checking if pickup_date column exists...');
    const { data: testData, error: testError } = await supabase
      .from('bookings')
      .select('pickup_date')
      .limit(1);

    let columnExists = !testError;
    console.log(`Column exists: ${columnExists}`);

    if (testError) {
      console.log('pickup_date column does not exist, needs to be added manually');
      return NextResponse.json({
        success: false,
        error: 'pickup_date column does not exist',
        message: 'Please add the pickup_date column manually in Supabase dashboard',
        sql: 'ALTER TABLE bookings ADD COLUMN pickup_date DATE;',
        details: testError.message
      }, { status: 400 });
    }

    // Step 2: Update existing bookings with calculated pickup_date
    console.log('📝 Step 2: Updating existing bookings with pickup_date...');

    // Get all bookings without pickup_date
    const { data: bookingsToUpdate, error: fetchError } = await supabase
      .from('bookings')
      .select('id, start_date, pickup_date')
      .is('pickup_date', null);

    if (fetchError) {
      console.error('Error fetching bookings:', fetchError);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch bookings for update',
        details: fetchError.message
      }, { status: 500 });
    }

    console.log(`Found ${bookingsToUpdate?.length || 0} bookings to update`);

    // Update each booking individually
    let updatedCount = 0;
    if (bookingsToUpdate && bookingsToUpdate.length > 0) {
      for (const booking of bookingsToUpdate) {
        const startDate = new Date(booking.start_date);
        const pickupDate = new Date(startDate);
        pickupDate.setDate(pickupDate.getDate() - 1);

        const { error: updateError } = await supabase
          .from('bookings')
          .update({ pickup_date: pickupDate.toISOString().split('T')[0] })
          .eq('id', booking.id);

        if (!updateError) {
          updatedCount++;
        }
      }
    }

    console.log(`✅ Updated ${updatedCount} bookings with pickup dates`);

    // Step 3: Test the implementation
    console.log('🧪 Testing pickup scheduling system...');

    // Get sample data to verify pickup dates
    const { data: sampleData, error: sampleError } = await supabase
      .from('bookings')
      .select('id, start_date, pickup_date')
      .not('pickup_date', 'is', null)
      .limit(3);

    if (sampleError) {
      console.error('Error fetching sample data:', sampleError);
    } else {
      console.log('✅ Sample pickup dates:', sampleData);
    }

    // Step 4: Get today's pickups count
    const today = new Date().toISOString().split('T')[0];
    const { data: todaysPickups, error: pickupsError } = await supabase
      .from('bookings')
      .select(`
        id,
        pickup_date,
        start_date,
        equipment_picked_up,
        booking_status,
        customer:customers(full_name, phone, email),
        camera:cameras(name, model)
      `)
      .eq('pickup_date', today)
      .eq('equipment_picked_up', false)
      .in('booking_status', ['confirmed', 'approved']);

    if (pickupsError) {
      console.error('Error fetching today\'s pickups:', pickupsError);
    } else {
      console.log(`✅ Found ${todaysPickups?.length || 0} pickups scheduled for today`);
    }

    return NextResponse.json({
      success: true,
      message: 'Pickup scheduling schema applied successfully',
      results: {
        columnExists: columnExists,
        bookingsUpdated: updatedCount,
        todaysPickupsCount: todaysPickups?.length || 0,
        sampleData: sampleData?.slice(0, 2),
        todaysPickups: todaysPickups?.slice(0, 3) // Show first 3 today's pickups
      }
    });

  } catch (error) {
    console.error('Error applying pickup schema:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
