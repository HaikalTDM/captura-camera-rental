// Simple script to execute database reset via direct SQL commands
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rnqjqjqjqjqjqjqj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJucWpxanFqcWpxanFqcWoiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNzI2NzM5NzE5LCJleHAiOjIwNDIzMTU3MTl9.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function resetDatabase() {
  console.log('🔄 Starting database reset...');
  
  try {
    // Step 1: Drop existing tables
    console.log('🗑️ Dropping existing tables...');
    
    const dropCommands = [
      'DROP VIEW IF EXISTS admin_booking_dashboard CASCADE;',
      'DROP TABLE IF EXISTS booking_status_history CASCADE;',
      'DROP TABLE IF EXISTS calendar_blocks CASCADE;',
      'DROP TABLE IF EXISTS bookings CASCADE;'
    ];
    
    for (const cmd of dropCommands) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql_query: cmd });
        if (error) {
          console.log(`⚠️ Drop warning: ${error.message}`);
        } else {
          console.log(`✅ Executed: ${cmd}`);
        }
      } catch (err) {
        console.log(`⚠️ Drop skipped: ${cmd}`);
      }
    }
    
    // Step 2: Create bookings table
    console.log('🏗️ Creating bookings table...');
    
    const createBookingsSQL = `
      CREATE TABLE bookings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        camera_id VARCHAR(255) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        total_days INTEGER NOT NULL,
        daily_rate DECIMAL(10,2) NOT NULL DEFAULT 50.00,
        total_amount DECIMAL(10,2) NOT NULL,
        deposit_amount DECIMAL(10,2) NOT NULL,
        deposit_paid BOOLEAN DEFAULT FALSE,
        deposit_paid_date TIMESTAMP WITH TIME ZONE,
        final_payment_amount DECIMAL(10,2) NOT NULL,
        final_payment_paid BOOLEAN DEFAULT FALSE,
        final_payment_paid_date TIMESTAMP WITH TIME ZONE,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'active', 'completed', 'cancelled')),
        booking_status VARCHAR(50) DEFAULT 'pending_approval' CHECK (booking_status IN ('pending_approval', 'confirmed', 'rejected', 'cancelled', 'completed')),
        pickup_method VARCHAR(20) DEFAULT 'pickup' CHECK (pickup_method IN ('pickup', 'delivery')),
        pickup_address TEXT,
        delivery_fee DECIMAL(10,2) DEFAULT 0.00,
        booking_source VARCHAR(20) DEFAULT 'website' CHECK (booking_source IN ('website', 'phone', 'whatsapp', 'walk-in', 'historical', 'manual')),
        notes TEXT,
        approved_by UUID REFERENCES auth.users(id),
        approved_at TIMESTAMP WITH TIME ZONE,
        rejection_reason TEXT,
        admin_notes TEXT,
        whatsapp_message_sent BOOLEAN DEFAULT FALSE,
        whatsapp_sent_at TIMESTAMP WITH TIME ZONE,
        whatsapp_admin_notified BOOLEAN DEFAULT FALSE,
        whatsapp_admin_notification_sent_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    const { error: bookingsError } = await supabase.rpc('exec_sql', { sql_query: createBookingsSQL });
    if (bookingsError) {
      console.error('❌ Error creating bookings table:', bookingsError);
    } else {
      console.log('✅ Bookings table created successfully');
    }
    
    // Step 3: Create supporting tables
    console.log('🏗️ Creating supporting tables...');
    
    const createHistorySQL = `
      CREATE TABLE booking_status_history (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
        old_status VARCHAR(50),
        new_status VARCHAR(50) NOT NULL,
        changed_by UUID REFERENCES auth.users(id),
        changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        reason TEXT,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    const { error: historyError } = await supabase.rpc('exec_sql', { sql_query: createHistorySQL });
    if (historyError) {
      console.error('❌ Error creating history table:', historyError);
    } else {
      console.log('✅ History table created successfully');
    }
    
    const createBlocksSQL = `
      CREATE TABLE calendar_blocks (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        camera_id VARCHAR(255) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        block_type VARCHAR(50) DEFAULT 'booking' CHECK (block_type IN ('booking', 'maintenance', 'unavailable', 'admin_block')),
        booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
        reason TEXT,
        created_by UUID REFERENCES auth.users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    const { error: blocksError } = await supabase.rpc('exec_sql', { sql_query: createBlocksSQL });
    if (blocksError) {
      console.error('❌ Error creating blocks table:', blocksError);
    } else {
      console.log('✅ Calendar blocks table created successfully');
    }
    
    // Step 4: Create indexes
    console.log('📊 Creating indexes...');
    
    const indexes = [
      'CREATE INDEX idx_bookings_customer_id ON bookings(customer_id);',
      'CREATE INDEX idx_bookings_camera_id ON bookings(camera_id);',
      'CREATE INDEX idx_bookings_dates ON bookings(start_date, end_date);',
      'CREATE INDEX idx_bookings_status ON bookings(booking_status);',
      'CREATE INDEX idx_bookings_created_at ON bookings(created_at);'
    ];
    
    for (const indexSQL of indexes) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql_query: indexSQL });
        if (error) {
          console.log(`⚠️ Index warning: ${error.message}`);
        } else {
          console.log(`✅ Created index`);
        }
      } catch (err) {
        console.log(`⚠️ Index creation skipped`);
      }
    }
    
    // Step 5: Enable RLS
    console.log('🔒 Enabling Row Level Security...');
    
    const rlsCommands = [
      'ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;',
      'ALTER TABLE booking_status_history ENABLE ROW LEVEL SECURITY;',
      'ALTER TABLE calendar_blocks ENABLE ROW LEVEL SECURITY;'
    ];
    
    for (const rlsSQL of rlsCommands) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql_query: rlsSQL });
        if (error) {
          console.log(`⚠️ RLS warning: ${error.message}`);
        } else {
          console.log(`✅ Enabled RLS`);
        }
      } catch (err) {
        console.log(`⚠️ RLS setup skipped`);
      }
    }
    
    // Step 6: Test the setup
    console.log('🧪 Testing the setup...');
    
    const { data: testData, error: testError } = await supabase
      .from('bookings')
      .select('*')
      .limit(1);
    
    if (testError) {
      console.error('❌ Error testing bookings table:', testError);
    } else {
      console.log('✅ Bookings table is accessible and working');
    }
    
    console.log('🎉 Database reset completed successfully!');
    
  } catch (error) {
    console.error('❌ Fatal error during database reset:', error);
  }
}

resetDatabase();
