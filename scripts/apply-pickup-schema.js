const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyPickupSchema() {
  try {
    console.log('🚀 Applying pickup status schema to database...');
    
    // Read the SQL file
    const sqlContent = fs.readFileSync('database-pickup-status-schema.sql', 'utf8');
    
    // Split into individual statements (basic splitting by semicolon)
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
        console.log(`   ${statement.substring(0, 100)}${statement.length > 100 ? '...' : ''}`);
        
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          console.error(`❌ Error executing statement ${i + 1}:`, error);
          // Continue with other statements
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      }
    }
    
    console.log('🎉 Pickup status schema application completed!');
    
    // Test if columns were added
    console.log('🔍 Verifying new columns...');
    const { data: columns, error: columnError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'bookings')
      .like('column_name', 'equipment_%');
    
    if (columnError) {
      console.error('❌ Error checking columns:', columnError);
    } else {
      console.log('✅ Equipment columns found:', columns.map(c => c.column_name));
    }
    
  } catch (error) {
    console.error('❌ Error applying schema:', error);
    process.exit(1);
  }
}

// Alternative approach using direct SQL execution
async function applyPickupSchemaDirectly() {
  try {
    console.log('🚀 Applying pickup status schema directly...');
    
    // Add columns one by one
    const alterStatements = [
      "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS equipment_picked_up BOOLEAN DEFAULT FALSE",
      "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS equipment_pickup_date TIMESTAMP WITH TIME ZONE",
      "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS equipment_pickup_notes TEXT",
      "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS equipment_returned BOOLEAN DEFAULT FALSE",
      "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS equipment_return_date TIMESTAMP WITH TIME ZONE",
      "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS equipment_return_notes TEXT",
      "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS equipment_condition_pickup TEXT",
      "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS equipment_condition_return TEXT"
    ];
    
    for (const statement of alterStatements) {
      console.log(`⚡ Executing: ${statement}`);
      const { error } = await supabase.rpc('exec_sql', { sql: statement });
      
      if (error) {
        console.error(`❌ Error:`, error);
      } else {
        console.log(`✅ Success`);
      }
    }
    
    // Update existing records
    console.log('📝 Updating existing records...');
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ 
        equipment_picked_up: false,
        equipment_returned: false 
      })
      .is('equipment_picked_up', null);
    
    if (updateError) {
      console.error('❌ Error updating records:', updateError);
    } else {
      console.log('✅ Records updated successfully');
    }
    
    console.log('🎉 Schema application completed!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the schema application
applyPickupSchemaDirectly()
  .then(() => {
    console.log('✨ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Failed:', error);
    process.exit(1);
  });
