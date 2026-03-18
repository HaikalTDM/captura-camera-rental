/**
 * Update Canon R50 - Mother camera to be available with display name "R50 (ii)"
 * Keeps database name as "Canon R50 - Mother" for compatibility
 *
 * Run: node scripts/update-mother-r50.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateMotherR50() {
  console.log('🚀 Updating Canon R50 - Mother camera...\n');

  try {
    // Find the camera by name
    const { data: existingCamera, error: checkError } = await supabase
      .from('cameras')
      .select('id, name, is_available')
      .eq('name', 'Canon R50 - Mother')
      .single();

    if (checkError || !existingCamera) {
      console.error('❌ Camera "Canon R50 - Mother" not found!');
      console.error('   Please run add-mother-r50.js first to create it.');
      process.exit(1);
    }

    console.log('📍 Found camera:');
    console.log(`   ID: ${existingCamera.id}`);
    console.log(`   Current name: ${existingCamera.name}`);
    console.log(`   Currently available: ${existingCamera.is_available}`);

    // Update camera to be available with new display name
    const { data, error } = await supabase
      .from('cameras')
      .update({
        name: 'R50 (ii)', // Display name change
        is_available: true, // Enable it
        display_order: 5, // Move it up in the list
        notes: 'MOTHER CAMERA - Revenue tracked separately. Now available for bookings. AI booking keyword: "R50 mother" or "R50 ii"'
      })
      .eq('id', existingCamera.id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating camera:', error.message);
      console.error('   Details:', error);
      process.exit(1);
    }

    console.log('\n✅ Canon R50 - Mother camera updated successfully!\n');
    console.log('📋 Updated Details:');
    console.log(`   ID: ${data.id}`);
    console.log(`   Display Name: ${data.name}`);
    console.log(`   Database Name: Canon R50 - Mother (unchanged)`);
    console.log(`   Now Available: ${data.is_available} ✓`);
    console.log(`   Display Order: ${data.display_order}`);
    console.log(`   Daily Rate: RM${data.daily_rate}`);

    console.log('\n🎯 Camera is now:');
    console.log('   ✅ Available for admin bookings');
    console.log('   ✅ Shows as "R50 (ii)" in dropdown');
    console.log('   ✅ Still tracked as Mother camera for revenue');
    console.log('   ✅ AI parser detects "R50 mother" or "R50 ii"');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

updateMotherR50();