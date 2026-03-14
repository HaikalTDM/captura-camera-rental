const { createClient } = require('@supabase/supabase-js');
const s = createClient(
  'https://mqpzbzkdtfebzcfoqgta.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHpiemtkdGZlYnpjZm9xZ3RhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODMxMjg0NCwiZXhwIjoyMDczODg4ODQ0fQ.9roplYWs3emoy3VsSHDtiTEN6ZrhRAWC4TfjAfkLp4E'
);

async function scan() {
  const results = {};
  const tables = ['bookings', 'customers', 'cameras', 'calendar_blocks', 'articles', 'accessories', 'booking_status_history'];
  for (const t of tables) {
    const { data, error } = await s.from(t).select('*').limit(1);
    if (error) {
      results[t] = 'MISSING: ' + error.message;
    } else if (data && data[0]) {
      results[t] = Object.keys(data[0]);
    } else {
      results[t] = 'EXISTS (empty)';
    }
  }
  console.log(JSON.stringify(results, null, 2));
}
scan().catch(console.error);
