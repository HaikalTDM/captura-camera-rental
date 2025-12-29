
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateBooking() {
    const bookingId = '4d44a6fa-82b0-4e1a-b34e-43b57c48a738';

    // First verify the current dates
    const { data: booking, error: fetchError } = await supabase
        .from('bookings')
        .select('start_date, end_date')
        .eq('id', bookingId)
        .single();

    if (fetchError) {
        console.error('Error fetching booking:', fetchError);
        return;
    }

    console.log('Current dates:', booking);

    // Update to 2026
    const newStartDate = booking.start_date.replace('2025', '2026');
    const newEndDate = booking.end_date.replace('2025', '2026');

    console.log('Updating to:', { newStartDate, newEndDate });

    const { error: updateError } = await supabase
        .from('bookings')
        .update({
            start_date: newStartDate,
            end_date: newEndDate,
            pickup_date: new Date(new Date(newStartDate).getTime() - 24 * 60 * 60 * 1000).toISOString() // update pickup date too if needed
        })
        .eq('id', bookingId);

    if (updateError) {
        console.error('Error updating booking:', updateError);
    } else {
        console.log('Successfully updated booking year to 2026');
    }
}

updateBooking();
