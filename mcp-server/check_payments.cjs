
const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, "..", ".env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function main() {
  // Get all payment records in June 2026
  const { data: payments, error } = await supabase
    .from("payment_records")
    .select("booking_id, payment_type, amount, payment_date")
    .gte("payment_date", "2026-06-01")
    .lte("payment_date", "2026-06-30")
    .order("payment_date", { ascending: false });

  if (error) { console.error(error); return; }

  console.log("PAYMENT RECORDS (June 2026):");
  console.log(JSON.stringify(payments, null, 2));
  
  // Sum by type
  let total = 0;
  const byBooking = {};
  for (const p of payments) {
    total += p.amount;
    if (!byBooking[p.booking_id]) byBooking[p.booking_id] = { deposit: 0, final: 0, refund: 0 };
    byBooking[p.booking_id][p.payment_type] += p.amount;
  }
  
  console.log("\nBY BOOKING:");
  for (const [bid, amounts] of Object.entries(byBooking)) {
    const sum = amounts.deposit + amounts.final + amounts.refund;
    console.log(`  ${bid.slice(0,8)}: dep=${amounts.deposit} fin=${amounts.final} ref=${amounts.refund} = ${sum}`);
  }
  console.log(`TOTAL: ${total}`);
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
