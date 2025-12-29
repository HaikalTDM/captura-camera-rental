
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function findBooking() {
    const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('id')
        .ilike('full_name', '%Nur Ain Dalila%')
        .single();

    if (customerError || !customer) return;

    const { data: bookings, error: bookingError } = await supabase
        .from('bookings')
        .select('id')
        .eq('customer_id', customer.id);

    if (bookingError || !bookings || bookings.length === 0) return;

    console.log('BOOKING_ID:' + bookings[0].id);
}

findBooking();
