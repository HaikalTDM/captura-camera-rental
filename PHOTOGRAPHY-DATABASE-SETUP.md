# 📸 Captura Photography Database Setup Guide

This guide will help you add photography functionality to your existing Captura database.

## 🎯 Overview

The photography schema integrates seamlessly with your existing camera rental database by:
- **Reusing existing tables**: `customers`, `business_settings`, `payment_records`
- **Adding new tables**: Photography-specific functionality
- **Maintaining separation**: Clear boundaries between rental and photography

## 📋 Prerequisites

- ✅ Existing Captura rental database
- ✅ Supabase credentials in `.env.local`
- ✅ Database access permissions

## 🚀 Implementation Options

### Option 1: Automated Script (Recommended)

```bash
# Install dependencies (if not already installed)
npm install @supabase/supabase-js dotenv

# Run the migration script
node apply-photography-schema.js
```

### Option 2: Manual SQL Execution

1. **Open Supabase Dashboard**
   - Go to your Supabase project
   - Navigate to SQL Editor

2. **Execute Schema File**
   - Copy contents of `database-photography-schema.sql`
   - Paste into SQL Editor
   - Click "Run"

3. **Verify Success**
   - Check for new tables in Table Editor
   - Look for sample data in `photography_packages`

### Option 3: Via Database Tool

```bash
# If using psql or similar
psql -h your-db-host -U your-username -d your-database -f database-photography-schema.sql
```

## 📊 New Database Structure

### Photography Tables Created:

#### 📸 **photography_gallery**
```sql
- Portfolio images with categories
- Admin upload management
- Client association
- Metadata (camera, location, etc.)
```

#### 📦 **photography_packages**
```sql
- Base photography packages
- Wedding, corporate, portrait packages
- Pricing for main/second shooter
- Package inclusions
```

#### 🎁 **photography_addons** 
```sql
- Package enhancements
- Categorized add-ons
- Migrated from file-based system
- Admin manageable
```

#### 📅 **photography_bookings**
```sql
- Photography session bookings
- Links to customers (shared table)
- Package selection + add-ons
- Payment tracking
- Event details
```

#### 🔗 **photography_booking_addons**
```sql
- Junction table for booking add-ons
- Tracks selected add-ons per booking
- Price snapshots
```

#### 🗓️ **photography_calendar_events**
```sql
- Calendar management
- Consultations, editing sessions
- Auto-created from bookings
- Scheduling system
```

## 🔄 Integration Points

### Shared Tables (Existing):
- **customers** → Used for both rental and photography clients
- **payment_records** → Handles payments for both services  
- **business_settings** → Shared configuration

### New Relationships:
```
customers ←→ photography_bookings
photography_packages ←→ photography_bookings
photography_addons ←→ photography_booking_addons
photography_bookings ←→ photography_calendar_events
```

## 📊 Sample Data Included

### Photography Packages:
- **Wedding**: Essential ($1,200), Premium ($1,800), Luxury ($2,800)
- **Corporate**: Essential ($800), Premium ($1,200)
- **Portrait**: Individual ($350), Family ($500)
- **Graduation**: Basic ($250), Premium ($400)

### Photography Add-ons:
- **Extras**: Additional Hour, Drone, Second Photographer
- **Editing**: Rush Editing, Advanced Retouching
- **Products**: Photo Albums, Canvas Prints
- **Logistics**: Travel Fee, Insurance

## 🛠️ Post-Migration Steps

### 1. Update Admin Interface
```typescript
// Update your admin components to use new tables
import { createClient } from '@supabase/supabase-js';

// Example: Fetch photography bookings
const { data: bookings } = await supabase
  .from('photography_bookings')
  .select(`
    *,
    customers(full_name, email),
    photography_packages(name)
  `);
```

### 2. Migrate Add-ons Data
```javascript
// Your existing add-ons in src/data/addons.ts
// are now in the database as photography_addons table
// Update your components to fetch from Supabase instead
```

### 3. Test Booking Flow
- Create test photography booking
- Verify calendar event creation
- Test payment tracking
- Check admin dashboard

### 4. Configure Gallery
- Upload sample images to photography_gallery
- Set featured images
- Test public gallery display

## 🔍 Verification Queries

Check if migration succeeded:

```sql
-- Check new tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'photography_%';

-- Check sample packages
SELECT name, category, base_price 
FROM photography_packages 
ORDER BY category, sort_order;

-- Check sample add-ons
SELECT name, category, price 
FROM photography_addons 
ORDER BY category, sort_order;

-- Verify customer table integration
SELECT COUNT(*) as rental_customers FROM customers;
```

## 🚨 Troubleshooting

### Common Issues:

#### ❌ "relation does not exist"
- **Solution**: Existing `customers` table missing
- **Fix**: Run camera rental schema first

#### ❌ "permission denied"
- **Solution**: Insufficient database permissions
- **Fix**: Use service role key, not anon key

#### ❌ "function update_updated_at_column() does not exist"
- **Solution**: Missing trigger function
- **Fix**: Ensure existing schema applied first

#### ❌ "RLS policies blocking access"
- **Solution**: Row Level Security enabled
- **Fix**: Add appropriate RLS policies

### Recovery Steps:

```sql
-- If migration partially failed, cleanup:
DROP TABLE IF EXISTS photography_calendar_events CASCADE;
DROP TABLE IF EXISTS photography_booking_addons CASCADE;
DROP TABLE IF EXISTS photography_bookings CASCADE;
DROP TABLE IF EXISTS photography_addons CASCADE;
DROP TABLE IF EXISTS photography_packages CASCADE;
DROP TABLE IF EXISTS photography_gallery CASCADE;

-- Then re-run migration
```

## ✅ Success Indicators

✅ **6 new tables** created with `photography_` prefix  
✅ **Sample packages** loaded (9 packages)  
✅ **Sample add-ons** loaded (12 add-ons)  
✅ **Triggers** created for updated_at timestamps  
✅ **Views** created for admin dashboard  
✅ **No errors** in migration output  

## 🎉 Next Steps

1. **Update Frontend**: Modify admin components to use new tables
2. **Test Booking Flow**: Create test photography booking
3. **Upload Gallery**: Add sample portfolio images  
4. **Configure Settings**: Update business settings for photography
5. **Train Users**: Show your friend the new photography admin

Your photography database is ready! 📸✨

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify your `.env.local` configuration
3. Review Supabase dashboard for errors
4. Test with a simple query first

**Database Structure**: Rental + Photography = Complete Business System! 🏆
