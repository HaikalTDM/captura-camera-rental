const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Service Key exists:', !!supabaseServiceKey);

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    const { data, error } = await supabase
      .from('bookings')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Connection error:', error);
      return;
    }
    
    console.log('✅ Database connection successful');
    console.log('Sample booking ID:', data[0]?.id);
    
    // Check current columns
    console.log('Checking current booking columns...');
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .limit(1)
      .single();
    
    if (bookingError) {
      console.error('Error fetching booking:', bookingError);
      return;
    }
    
    console.log('Current booking columns:', Object.keys(booking));
    
    // Check if pickup columns exist
    const hasPickupColumns = booking.hasOwnProperty('equipment_picked_up');
    console.log('Has pickup columns:', hasPickupColumns);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testConnection();
