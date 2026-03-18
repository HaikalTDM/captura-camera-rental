import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

function unwrapRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return value ?? null;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Adding pickup_date column and updating bookings...');

    // Step 1: Test if pickup_date column exists by trying to select it
    const { data: testData, error: testError } = await supabase
      .from('bookings')
      .select('pickup_date')
      .limit(1);

    if (testError) {
      console.log('pickup_date column does not exist');
      return NextResponse.json({
        success: false,
        error: 'pickup_date column does not exist',
        message: 'Column needs to be added manually in Supabase dashboard',
        instructions: [
          '1. Go to Supabase Dashboard > Table Editor > bookings table',
          '2. Click "Add Column"',
          '3. Name: pickup_date, Type: date, Allow nullable: true',
          '4. Save the column',
          '5. Run this API again to populate the data'
        ]
      }, { status: 400 });
    }

    console.log('✅ pickup_date column exists');

    // Step 2: Get all bookings and calculate pickup dates
    const { data: allBookings, error: fetchError } = await supabase
      .from('bookings')
      .select('id, start_date, pickup_date');

    if (fetchError) {
      console.error('Error fetching bookings:', fetchError);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch bookings',
        details: fetchError.message
      }, { status: 500 });
    }

    console.log(`Found ${allBookings?.length || 0} total bookings`);

    // Step 3: Update bookings that don't have pickup_date set
    let updatedCount = 0;
    const bookingsToUpdate = allBookings?.filter(b => !b.pickup_date) || [];
    
    console.log(`Updating ${bookingsToUpdate.length} bookings without pickup_date`);

    for (const booking of bookingsToUpdate) {
      try {
        const startDate = new Date(booking.start_date);
        const pickupDate = new Date(startDate);
        pickupDate.setDate(pickupDate.getDate() - 1); // One day before start date
        
        const pickupDateString = pickupDate.toISOString().split('T')[0];
        
        const { error: updateError } = await supabase
          .from('bookings')
          .update({ pickup_date: pickupDateString })
          .eq('id', booking.id);

        if (updateError) {
          console.error(`Error updating booking ${booking.id}:`, updateError);
        } else {
          updatedCount++;
        }
      } catch (err) {
        console.error(`Error processing booking ${booking.id}:`, err);
      }
    }

    console.log(`✅ Updated ${updatedCount} bookings with pickup dates`);

    // Step 4: Get today's pickups for verification
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
      .eq('equipment_picked_up', false);

    if (pickupsError) {
      console.error('Error fetching today\'s pickups:', pickupsError);
    }

    // Step 5: Get sample data for verification
    const { data: sampleData, error: sampleError } = await supabase
      .from('bookings')
      .select('id, start_date, pickup_date')
      .not('pickup_date', 'is', null)
      .limit(5);

    return NextResponse.json({
      success: true,
      message: 'Pickup date column setup completed successfully',
      results: {
        totalBookings: allBookings?.length || 0,
        bookingsUpdated: updatedCount,
        todaysPickupsCount: todaysPickups?.length || 0,
        sampleData: sampleData || [],
        todaysPickups: todaysPickups?.map(p => {
          const customer = unwrapRelation(p.customer);
          const camera = unwrapRelation(p.camera);

          return {
            id: p.id,
            customer: customer?.full_name,
            camera: camera?.name,
            pickupDate: p.pickup_date,
            startDate: p.start_date
          };
        }) || []
      }
    });

  } catch (error) {
    console.error('Error in add-pickup-date-column:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
