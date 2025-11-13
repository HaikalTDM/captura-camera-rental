/**
 * Add discount tracking fields to bookings table
 * This allows tracking social media discounts and promotional offers
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addDiscountFields() {
  console.log('📊 Adding discount tracking fields to bookings table...\n');

  try {
    // Add discount_amount column
    console.log('1️⃣ Adding discount_amount column...');
    const { error: error1 } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10, 2) DEFAULT 0;`
    });

    if (error1 && !error1.message.includes('already exists')) {
      console.log('   ℹ️  Using direct query method...');
      // Try direct query if RPC doesn't work
      const { error: directError1 } = await supabase
        .from('bookings')
        .select('discount_amount')
        .limit(1);
      
      if (directError1 && directError1.message.includes('column') && directError1.message.includes('does not exist')) {
        console.log('   ⚠️  Column does not exist. Please run the SQL manually.');
        console.log('\n📋 SQL to run manually in Supabase SQL Editor:');
        console.log('---');
        console.log('ALTER TABLE bookings ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10, 2) DEFAULT 0;');
        console.log('ALTER TABLE bookings ADD COLUMN IF NOT EXISTS discount_reason TEXT;');
        console.log('---\n');
      } else {
        console.log('   ✅ discount_amount column already exists or added successfully');
      }
    } else {
      console.log('   ✅ discount_amount column added successfully');
    }

    // Add discount_reason column
    console.log('2️⃣ Adding discount_reason column...');
    const { error: error2 } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS discount_reason TEXT;`
    });

    if (error2 && !error2.message.includes('already exists')) {
      console.log('   ℹ️  Using direct query method...');
      const { error: directError2 } = await supabase
        .from('bookings')
        .select('discount_reason')
        .limit(1);
      
      if (directError2 && directError2.message.includes('column') && directError2.message.includes('does not exist')) {
        console.log('   ⚠️  Column does not exist. Please run the SQL manually.');
      } else {
        console.log('   ✅ discount_reason column already exists or added successfully');
      }
    } else {
      console.log('   ✅ discount_reason column added successfully');
    }

    // Verify columns exist
    console.log('\n3️⃣ Verifying columns...');
    const { data: testData, error: testError } = await supabase
      .from('bookings')
      .select('id, discount_amount, discount_reason')
      .limit(1);

    if (testError) {
      console.log('   ⚠️  Could not verify columns:', testError.message);
      console.log('\n📋 Please run this SQL manually in Supabase SQL Editor:');
      console.log('---');
      console.log('ALTER TABLE bookings ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10, 2) DEFAULT 0;');
      console.log('ALTER TABLE bookings ADD COLUMN IF NOT EXISTS discount_reason TEXT;');
      console.log('\nCOMMENT ON COLUMN bookings.discount_amount IS \'Total discount amount in RM\';');
      console.log('COMMENT ON COLUMN bookings.discount_reason IS \'Reason for discount (e.g., Social Media Discount)\';');
      console.log('---\n');
    } else {
      console.log('   ✅ Columns verified successfully!');
      console.log('\n✅ Migration complete!\n');
      console.log('📊 Discount tracking fields added:');
      console.log('   • discount_amount (NUMERIC) - Total discount in RM');
      console.log('   • discount_reason (TEXT) - Reason for discount');
      console.log('\n💡 Usage Examples:');
      console.log('   • Social Media Discount: RM5/day × 3 days = RM15 total');
      console.log('   • Repeat Customer: RM10 flat discount');
      console.log('   • Promotional Offer: RM20 off');
      console.log('\n🎯 Next Steps:');
      console.log('   1. Update TypeScript interfaces');
      console.log('   2. Add discount field to booking form');
      console.log('   3. Update WhatsApp message template');
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err);
    console.log('\n📋 Please run this SQL manually in Supabase SQL Editor:');
    console.log('---');
    console.log('ALTER TABLE bookings ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10, 2) DEFAULT 0;');
    console.log('ALTER TABLE bookings ADD COLUMN IF NOT EXISTS discount_reason TEXT;');
    console.log('\nCOMMENT ON COLUMN bookings.discount_amount IS \'Total discount amount in RM\';');
    console.log('COMMENT ON COLUMN bookings.discount_reason IS \'Reason for discount (e.g., Social Media Discount)\';');
    console.log('---\n');
  }
}

addDiscountFields();

