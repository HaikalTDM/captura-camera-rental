import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('cameras').upsert({
    id: 'f39185a0-2f3b-4176-a4f6-821fba8274de',
    name: 'Fujifilm X-T30 II',
    brand: 'Fujifilm',
    model: 'X-T30 II',
    type: 'mirrorless',
    daily_rate: 100,
    weekly_rate: 630,
    monthly_rate: 2700,
    deposit_amount: 100,
    discount_threshold: 3,
    description: 'The Fujifilm X-T30 II is a compact, lightweight mirrorless camera offering superior image quality and iconic Fujifilm color science.',
    specifications: { "Sensor": "26.1MP APS-C X-Trans BSI CMOS 4" },
    image_url: '/images/fuji-xt30ii-1.png',
    is_available: true,
    total_quantity: 1,
    available_quantity: 1,
    display_order: 1,
    condition: 'excellent',
    purchase_date: '2023-01-01',
    purchase_price: 3000,
    location: 'Main Storage'
  }, { onConflict: 'id' });

  if (error) {
    console.error(JSON.stringify(error, null, 2));
  } else {
    console.log("Success adding Fuji!");
  }
}

run();
