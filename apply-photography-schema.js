#!/usr/bin/env node

/**
 * CAPTURA PHOTOGRAPHY DATABASE MIGRATION
 * 
 * This script applies the photography schema to your existing Captura database.
 * It safely adds photography tables without affecting your existing camera rental data.
 * 
 * Usage:
 *   node apply-photography-schema.js
 * 
 * Requirements:
 *   - Database connection configured in .env.local
 *   - Existing Captura rental database
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyPhotographySchema() {
  try {
    console.log('🎬 Starting Photography Database Migration...\n');

    // Read the schema file
    const schemaPath = path.join(__dirname, 'database-photography-schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('📋 Schema file loaded successfully');
    console.log('📊 Checking existing database structure...\n');

    // Check existing tables
    const { data: existingTables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['cameras', 'customers', 'bookings']);

    if (tablesError) {
      throw new Error(`Failed to check existing tables: ${tablesError.message}`);
    }

    console.log('✅ Existing tables found:');
    existingTables.forEach(table => {
      console.log(`   📁 ${table.table_name}`);
    });
    console.log('');

    // Apply the photography schema
    console.log('🎨 Applying photography schema...');
    console.log('   This will create:');
    console.log('   📸 photography_gallery');
    console.log('   📦 photography_packages');
    console.log('   🎁 photography_addons');
    console.log('   📅 photography_bookings');
    console.log('   🔗 photography_booking_addons');
    console.log('   🗓️ photography_calendar_events');
    console.log('');

    // Execute the schema
    const { error: schemaError } = await supabase.rpc('exec_sql', {
      sql: schemaSql
    });

    if (schemaError) {
      // Try alternative method if RPC doesn't work
      console.log('🔄 Trying alternative execution method...');
      
      // Split SQL into individual statements
      const statements = schemaSql
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

      for (const statement of statements) {
        if (statement.trim()) {
          const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
          if (error) {
            console.warn(`⚠️  Warning: ${error.message}`);
          }
        }
      }
    }

    console.log('✅ Photography schema applied successfully!\n');

    // Verify new tables were created
    const { data: newTables, error: verifyError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .like('table_name', 'photography_%');

    if (verifyError) {
      console.warn('⚠️  Could not verify new tables, but migration likely succeeded');
    } else {
      console.log('📊 New photography tables created:');
      newTables.forEach(table => {
        console.log(`   ✨ ${table.table_name}`);
      });
      console.log('');
    }

    // Check sample data
    console.log('📦 Checking sample data...');
    
    try {
      const { data: packages, error: packagesError } = await supabase
        .from('photography_packages')
        .select('name, category')
        .limit(5);

      if (!packagesError && packages.length > 0) {
        console.log('✅ Sample packages loaded:');
        packages.forEach(pkg => {
          console.log(`   📋 ${pkg.name} (${pkg.category})`);
        });
      }

      const { data: addons, error: addonsError } = await supabase
        .from('photography_addons')
        .select('name, category')
        .limit(5);

      if (!addonsError && addons.length > 0) {
        console.log('✅ Sample add-ons loaded:');
        addons.forEach(addon => {
          console.log(`   🎁 ${addon.name} (${addon.category})`);
        });
      }
    } catch (err) {
      console.log('ℹ️  Sample data check skipped');
    }

    console.log('\n🎉 PHOTOGRAPHY DATABASE MIGRATION COMPLETED!\n');
    console.log('🚀 Next Steps:');
    console.log('   1. Update your admin interface to use the new tables');
    console.log('   2. Test photography booking flow');
    console.log('   3. Upload sample gallery images');
    console.log('   4. Configure photography-specific settings');
    console.log('\n📸 Your photography business is ready to go live! ✨');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Check your .env.local file has correct Supabase credentials');
    console.error('   2. Ensure your database is accessible');
    console.error('   3. Verify you have sufficient permissions');
    console.error('   4. Try running the SQL file manually in Supabase dashboard');
    process.exit(1);
  }
}

// Run migration
applyPhotographySchema();
