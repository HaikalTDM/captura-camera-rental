/**
 * Add Canon R50 - Mother camera to database
 * This camera is hidden from client website and tracked separately
 * 
 * Run: node scripts/add-mother-r50.js
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

const cameraData = {
  name: 'Canon R50 - Mother',
  brand: 'Canon',
  model: 'EOS R50',
  type: 'mirrorless',
  daily_rate: 50,
  weekly_rate: 315,
  monthly_rate: 1350,
  deposit_amount: 100,
  description: 'Canon EOS R50 mirrorless camera. Managed separately for Mother\'s rental business. Not displayed on client website.',
  specifications: {
    'Sensor': '24.2MP APS-C CMOS',
    'Video Resolution': '4K/30fps, 1080p/120fps',
    'Autofocus': 'Dual Pixel CMOS AF II',
    'ISO Range': '100-32000 (expandable to 51200)',
    'Screen': '3-inch vari-angle touchscreen',
    'Viewfinder': '2.36M-dot OLED EVF',
    'Battery Life': 'Approx. 370 shots',
    'Weight': '375g (body only)',
    'Mount': 'Canon RF',
    'Connectivity': 'Wi-Fi, Bluetooth'
  },
  image_url: '/images/canon-r50.jpg',
  is_available: false, // Hidden from client website
  total_quantity: 1,
  available_quantity: 1,
  display_order: 999,
  condition: 'excellent',
  location: 'Mother\'s Location',
  notes: 'MOTHER CAMERA - Revenue tracked separately. Not shown on client website. AI booking keyword: "R50 mother"',
  discount_threshold: 3,
  purchase_date: new Date().toISOString().split('T')[0] // Today's date
};

async function addMotherR50() {
  console.log('🚀 Adding Canon R50 - Mother camera...\n');

  try {
    // Check if camera already exists
    const { data: existingCamera, error: checkError } = await supabase
      .from('cameras')
      .select('id, name, is_available')
      .eq('name', 'Canon R50 - Mother')
      .single();

    if (existingCamera) {
      console.log('⚠️  Camera "Canon R50 - Mother" already exists!');
      console.log(`   ID: ${existingCamera.id}`);
      console.log(`   Hidden from client: ${!existingCamera.is_available}`);
      console.log('\n   To update this camera, use the admin panel.');
      return;
    }

    // Insert camera
    const { data, error } = await supabase
      .from('cameras')
      .insert([cameraData])
      .select()
      .single();

    if (error) {
      console.error('❌ Error adding camera:', error.message);
      console.error('   Details:', error);
      process.exit(1);
    }

    console.log('✅ Canon R50 - Mother camera added successfully!\n');
    console.log('📋 Camera Details:');
    console.log(`   ID: ${data.id}`);
    console.log(`   Name: ${data.name}`);
    console.log(`   Brand: ${data.brand} ${data.model}`);
    console.log(`   Daily Rate: RM${data.daily_rate}`);
    console.log(`   Weekly Rate: RM${data.weekly_rate}`);
    console.log(`   Hidden from client: ${!data.is_available} ✓`);
    console.log(`   Display Order: ${data.display_order}`);
    console.log(`   Location: ${data.location}`);
    console.log('\n🎯 Next Steps:');
    console.log('   1. AI parser will detect "R50 mother" keyword');
    console.log('   2. Bookings will be auto-assigned to this camera');
    console.log('   3. Revenue tracked separately in Mother dashboard');
    console.log('   4. Not visible on client website');
    console.log('\n💡 Camera ID for reference: ' + data.id);
    console.log('   Save this ID for the Mother dashboard implementation.');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

addMotherR50();

