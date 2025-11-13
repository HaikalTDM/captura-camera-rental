/**
 * Add Canon R50 Camera to Database
 * 
 * Pricing Structure:
 * - Regular: RM60/day (1-3 days), RM55/day (4+ days)
 * - With Social Media Discount: RM55/day (1-3 days), RM50/day (4+ days)
 * 
 * Includes: Tripod, UV Filter Lens, Carrying Bag, 64GB SD Card
 * Capacity: 1000 snaps/day
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addCanonR50() {
  console.log('📷 Adding Canon R50 to camera inventory...\n');

  try {
    // Camera data
    const cameraData = {
      name: 'Canon R50',
      brand: 'Canon',
      model: 'R50',
      type: 'mirrorless',
      daily_rate: 60, // Regular price for 1-3 days
      weekly_rate: 385, // 55 x 7 = 385 (discounted rate for 4+ days)
      monthly_rate: 1650, // 55 x 30 = 1650
      deposit_amount: 100,
      discount_threshold: 4, // Discount applies from 4 days onward
      description: `Professional mirrorless camera perfect for photography enthusiasts and content creators. Capture stunning photos with up to 1000 snaps per day.

**Rental Includes:**
• Canon R50 Camera Body
• Tripod for stable shots
• UV Filter Lens for protection
• Premium Carrying Bag
• 64GB SD Card (ready to use)

**Special Pricing:**
• 1-3 days: RM60/day
• 4+ days: RM55/day

**Social Media Discount:**
Share your experience, repost our content, or follow our account to get RM5 off per day!
• 1-3 days: RM55/day (with discount)
• 4+ days: RM50/day (with discount)

Perfect for weddings, events, travel photography, and content creation!`,
      specifications: {
        "Sensor": "24.2MP APS-C CMOS",
        "Processor": "DIGIC X",
        "Video Resolution": "4K/30fps, 1080p/120fps",
        "Photo Resolution": "24.2MP (6000 x 4000)",
        "ISO Range": "100-32000 (expandable to 51200)",
        "Autofocus": "Dual Pixel CMOS AF II with Eye Detection",
        "Continuous Shooting": "Up to 12 fps (mechanical), 15 fps (electronic)",
        "Screen": "3-inch vari-angle touchscreen LCD",
        "Viewfinder": "2.36M-dot OLED EVF",
        "Battery Life": "Approx. 370 shots per charge",
        "Weight": "328g (body only)",
        "Storage": "Single SD/SDHC/SDXC card slot",
        "Connectivity": "Wi-Fi, Bluetooth, USB-C",
        "Special Features": "Face/Eye Detection, Movie Digital IS, HDR PQ, Creative Assist",
        "Daily Capacity": "1000 snaps/day"
      },
      image_url: '/images/R50.png',
      is_available: true,
      total_quantity: 1,
      available_quantity: 1,
      display_order: 3, // Shows after Osmo Pocket 3 and Action 5 Pro
      condition: 'excellent',
      location: 'Kuala Lumpur',
      purchase_date: new Date().toISOString().split('T')[0],
      purchase_price: 0,
      serial_number: null,
      warranty_expiry: null,
      last_maintenance: null,
      next_maintenance: null,
      notes: `Includes complete bundle:
- Tripod
- UV Filter Lens
- Carrying Bag
- 64GB SD Card

Social Media Discount Available:
- Share/Repost/Follow = RM5 off per day
- Regular: RM60/day (1-3 days), RM55/day (4+ days)
- With discount: RM55/day (1-3 days), RM50/day (4+ days)

Capacity: 1000 snaps/day`
    };

    console.log('📋 Camera Details:');
    console.log('   Name:', cameraData.name);
    console.log('   Brand:', cameraData.brand);
    console.log('   Model:', cameraData.model);
    console.log('   Type:', cameraData.type);
    console.log('   Regular Rate: RM' + cameraData.daily_rate + '/day (1-3 days)');
    console.log('   Discounted Rate: RM55/day (4+ days)');
    console.log('   Discount Threshold:', cameraData.discount_threshold, 'days');
    console.log('   Deposit: RM' + cameraData.deposit_amount);
    console.log('   Display Order:', cameraData.display_order);
    console.log('   Includes: Tripod, UV Filter, Carrying Bag, 64GB SD Card');
    console.log('   Capacity: 1000 snaps/day\n');

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

    console.log('✅ Camera added successfully!\n');
    console.log('📋 Database Record:');
    console.log('   ID:', data.id);
    console.log('   Name:', data.name);
    console.log('   Brand:', data.brand);
    console.log('   Model:', data.model);
    console.log('   Daily Rate: RM' + data.daily_rate);
    console.log('   Weekly Rate: RM' + data.weekly_rate);
    console.log('   Available:', data.is_available ? 'Yes' : 'No');
    console.log('   Quantity:', data.available_quantity);

    // Verify by fetching all cameras
    const { data: allCameras, error: fetchError } = await supabase
      .from('cameras')
      .select('id, name, brand, model, daily_rate, discount_threshold, is_available, display_order')
      .eq('is_available', true)
      .order('display_order');

    if (!fetchError && allCameras) {
      console.log('\n📷 All Available Cameras (sorted by display order):');
      allCameras.forEach((cam, index) => {
        const threshold = cam.discount_threshold || 3;
        console.log(`   ${index + 1}. ${cam.name} (${cam.brand} ${cam.model})`);
        console.log(`      - ID: ${cam.id}`);
        console.log(`      - Daily Rate: RM${cam.daily_rate}`);
        console.log(`      - Discount from: ${threshold}+ days`);
        console.log(`      - Display Order: ${cam.display_order}`);
      });
    }

    console.log('\n🎉 Done! The Canon R50 will now appear on:');
    console.log('   - Client site: /rental/cameras');
    console.log('   - Admin panel: /admin/cameras');
    console.log('   - Booking page: /admin/bookings/add');
    console.log('\n💡 Pricing Info:');
    console.log('   Regular: RM60/day (1-3 days), RM55/day (4+ days)');
    console.log('   With Social Media Discount: RM55/day (1-3 days), RM50/day (4+ days)');
    console.log('\n📦 Rental Includes:');
    console.log('   ✓ Canon R50 Camera Body');
    console.log('   ✓ Tripod');
    console.log('   ✓ UV Filter Lens');
    console.log('   ✓ Carrying Bag');
    console.log('   ✓ 64GB SD Card');
    console.log('\n📸 Capacity: 1000 snaps/day');

  } catch (err) {
    console.error('❌ Unexpected error:', err);
    process.exit(1);
  }
}

// Run the script
addCanonR50();

