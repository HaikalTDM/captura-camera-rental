import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fetchCameras() {
  const { data, error } = await supabase.from('cameras').select('name, is_available, total_quantity, available_quantity');
  if (error) {
    console.error("Error fetching cameras:", error);
    return;
  }
  
  console.log("=== CAMERA VAULT ===");
  data.forEach((cam, i) => {
    console.log(`${i+1}. ${cam.name} (Total: ${cam.total_quantity}, Available: ${cam.available_quantity}, Status: ${cam.is_available ? 'Active' : 'Unavailable'})`);
  });
  console.log("====================");
}

fetchCameras();
