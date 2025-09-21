import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('Adding pickup status columns to bookings table...');

    // First, let's check if the columns already exist by trying to select them
    const { data: testData, error: testError } = await supabase
      .from('bookings')
      .select('equipment_picked_up, equipment_pickup_date, equipment_pickup_notes, equipment_returned, equipment_return_date, equipment_return_notes, equipment_condition_pickup, equipment_condition_return')
      .limit(1);

    if (!testError) {
      console.log('Pickup columns already exist!');
      return NextResponse.json({
        success: true,
        message: 'Pickup columns already exist',
        columns: Object.keys(testData[0] || {})
      });
    }

    console.log('Columns do not exist, need to add them. Error:', testError);

    // Since we can't directly execute ALTER TABLE statements through Supabase client,
    // we'll need to use a different approach. Let's try to update the booking
    // with the new fields and see what happens
    
    // Get a sample booking first
    const { data: sampleBooking, error: sampleError } = await supabase
      .from('bookings')
      .select('id')
      .limit(1)
      .single();

    if (sampleError) {
      console.error('Error getting sample booking:', sampleError);
      return NextResponse.json({
        success: false,
        error: 'Could not access bookings table'
      }, { status: 500 });
    }

    // Try to update with new fields to test if they exist
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        equipment_picked_up: false,
        equipment_pickup_date: null,
        equipment_pickup_notes: null,
        equipment_returned: false,
        equipment_return_date: null,
        equipment_return_notes: null,
        equipment_condition_pickup: null,
        equipment_condition_return: null
      })
      .eq('id', sampleBooking.id);

    if (updateError) {
      console.error('Update error (columns likely do not exist):', updateError);
      return NextResponse.json({
        success: false,
        error: 'Pickup columns do not exist in database. Please run the database migration manually.',
        details: updateError.message,
        sqlNeeded: `
          ALTER TABLE bookings ADD COLUMN IF NOT EXISTS equipment_picked_up BOOLEAN DEFAULT FALSE;
          ALTER TABLE bookings ADD COLUMN IF NOT EXISTS equipment_pickup_date TIMESTAMP WITH TIME ZONE;
          ALTER TABLE bookings ADD COLUMN IF NOT EXISTS equipment_pickup_notes TEXT;
          ALTER TABLE bookings ADD COLUMN IF NOT EXISTS equipment_returned BOOLEAN DEFAULT FALSE;
          ALTER TABLE bookings ADD COLUMN IF NOT EXISTS equipment_return_date TIMESTAMP WITH TIME ZONE;
          ALTER TABLE bookings ADD COLUMN IF NOT EXISTS equipment_return_notes TEXT;
          ALTER TABLE bookings ADD COLUMN IF NOT EXISTS equipment_condition_pickup TEXT;
          ALTER TABLE bookings ADD COLUMN IF NOT EXISTS equipment_condition_return TEXT;
        `
      }, { status: 400 });
    }

    console.log('Columns exist and update successful!');
    return NextResponse.json({
      success: true,
      message: 'Pickup columns are available and working'
    });

  } catch (error) {
    console.error('Error in add-pickup-columns:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
