/**
 * Add Second DJI Osmo Pocket 3 Camera
 * 
 * This script adds "DJI Osmo Pocket 3 (ii)" to your camera inventory
 * Run with: node scripts/add-second-osmo-pocket-3.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addSecondOsmoPocket3() {
  console.log('🎥 Adding DJI Osmo Pocket 3 (ii) to camera inventory...\n');

  const cameraData = {
    name: 'DJI Osmo Pocket 3 (ii)',
    brand: 'DJI',
    model: 'Osmo Pocket 3',
    type: 'action',
    daily_rate: 50,
    weekly_rate: 315,
    monthly_rate: 1350,
    deposit_amount: 100,
    description: 'Professional compact camera with gimbal stabilization. Perfect for vlogging, content creation, and professional video production.',
    specifications: {
      "Sensor": "1/1.3-inch CMOS, 9.4MP",
      "Video Resolution": "4K/120fps, 1080p/240fps",
      "Stabilization": "3-axis mechanical gimbal",
      "Screen": "2-inch rotatable touchscreen",
      "Battery Life": "Up to 166 minutes (4K/24fps)",
      "Storage": "Supports microSD up to 512GB",
      "Weight": "179g",
      "Special Features": "ActiveTrack 6.0, Face Tracking, Time-lapse, Slow Motion"
    },
    image_url: '/images/osmo-pocket-31.jpg',
    is_available: true,
    total_quantity: 1,
    available_quantity: 1,
    condition: 'excellent',
    location: 'Selayang',
    purchase_date: new Date().toISOString().split('T')[0],
    purchase_price: 0,
    serial_number: null,
    warranty_expiry: null,
    last_maintenance: null,
    next_maintenance: null,
    notes: 'Second Osmo Pocket 3 unit'
  };

  try {
    // Check if camera already exists
    const { data: existingCamera, error: checkError } = await supabase
      .from('cameras')
      .select('id, name')
      .eq('name', 'DJI Osmo Pocket 3 (ii)')
      .single();

    if (existingCamera) {
      console.log('⚠️  Camera "DJI Osmo Pocket 3 (ii)" already exists!');
      console.log(`   ID: ${existingCamera.id}`);
      console.log('\n   To update this camera instead, use the admin panel or modify this script.');
      return;
    }

    // Insert new camera
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

    console.log('✅ Camera added successfully!\n');
    console.log('📋 Camera Details:');
    console.log('   ID:', data.id);
    console.log('   Name:', data.name);
    console.log('   Brand:', data.brand);
    console.log('   Model:', data.model);
    console.log('   Daily Rate: RM' + data.daily_rate);
    console.log('   Available:', data.is_available ? 'Yes' : 'No');
    console.log('   Quantity:', data.available_quantity);

    // Verify by fetching all Osmo Pocket 3 cameras
    const { data: allOsmoCameras, error: fetchError } = await supabase
      .from('cameras')
      .select('id, name, is_available, available_quantity')
      .ilike('name', '%Osmo Pocket 3%')
      .order('name');

    if (!fetchError && allOsmoCameras) {
      console.log('\n📷 All Osmo Pocket 3 Cameras:');
      allOsmoCameras.forEach((cam, index) => {
        console.log(`   ${index + 1}. ${cam.name}`);
        console.log(`      - ID: ${cam.id}`);
        console.log(`      - Available: ${cam.is_available ? 'Yes' : 'No'}`);
        console.log(`      - Quantity: ${cam.available_quantity}`);
      });
    }

    console.log('\n🎉 Done! The new camera will now appear on:');
    console.log('   - Client site: http://localhost:3000/rental');
    console.log('   - Admin panel: http://localhost:3000/admin/cameras');
    console.log('\n💡 Tip: Each camera has its own booking calendar and availability tracking.');

  } catch (err) {
    console.error('❌ Unexpected error:', err);
    process.exit(1);
  }
}

// Run the script
addSecondOsmoPocket3();

