# CAPTURA Production Database Troubleshooting Guide

## 🚨 **CRITICAL ISSUE: Booking Registration Broken in Production**

Your CAPTURA application works perfectly locally but fails in production due to database schema inconsistencies and permission issues.

---

## 📋 **STEP-BY-STEP SOLUTION**

### **STEP 1: Diagnose the Issues**

1. **Open Supabase Dashboard** → Go to your production project
2. **Navigate to SQL Editor** → Create a new query
3. **Copy and paste** the contents of `production-database-diagnosis.sql`
4. **Run the query** → This will show you exactly what's missing/broken
5. **Review the results** → Look for:
   - Missing foreign key constraints
   - Missing columns (name, reliability_score, total_bookings)
   - RLS policy issues
   - Orphaned records

### **STEP 2: Fix Database Structure**

1. **In Supabase SQL Editor** → Create a new query
2. **Copy and paste** the contents of `production-complete-fix.sql`
3. **Run the query** → This will:
   - Add missing columns to customers table
   - Fix foreign key relationships
   - Create proper indexes
   - Update data consistency
   - Fix RLS policies
4. **Check for errors** → If any errors occur, note them down

### **STEP 3: Fix RLS Policies (If Still Having Issues)**

If bookings still fail after Step 2:

1. **In Supabase SQL Editor** → Create a new query
2. **Copy and paste** the contents of `production-rls-policies.sql`
3. **Run the query** → This will reset all RLS policies to allow public access
4. **Test booking registration** → Try submitting a booking from captura.my

---

## 🔍 **COMMON ISSUES & SOLUTIONS**

### **Issue 1: "Could not find a relationship between 'bookings' and 'cameras'"**
**Solution**: Missing foreign key constraints
- Run `production-complete-fix.sql` to add proper foreign keys

### **Issue 2: "t.reliability is undefined"**
**Solution**: Missing customer columns
- The fix script adds `reliability_score`, `total_bookings`, and `name` columns

### **Issue 3: "Permission denied for table bookings"**
**Solution**: RLS policies blocking public access
- Run `production-rls-policies.sql` to fix permissions

### **Issue 4: "duplicate key value violates unique constraint"**
**Solution**: Data integrity issues
- The fix script includes data cleanup and consistency updates

---

## 🧪 **TESTING AFTER FIXES**

### **Test 1: Basic Database Access**
```sql
-- Run this in Supabase SQL Editor to test
SELECT COUNT(*) FROM cameras;
SELECT COUNT(*) FROM customers;
SELECT COUNT(*) FROM bookings;
```

### **Test 2: Foreign Key Relationships**
```sql
-- This should show the foreign key constraints
SELECT 
    tc.table_name,
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name = 'bookings';
```

### **Test 3: Customer Columns**
```sql
-- This should show all required customer columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'customers' 
AND column_name IN ('name', 'full_name', 'reliability_score', 'total_bookings', 'whatsapp')
ORDER BY column_name;
```

### **Test 4: Live Booking Submission**
1. Go to **captura.my**
2. Select a camera and dates
3. Fill in customer details
4. Submit booking
5. Check if it appears in Supabase database

---

## 🚨 **IF ISSUES PERSIST**

### **Check Browser Console**
1. Open **Developer Tools** (F12)
2. Go to **Console** tab
3. Try submitting a booking
4. Look for specific error messages
5. Share the exact error messages

### **Check Supabase Logs**
1. In Supabase Dashboard → **Logs**
2. Look for recent errors during booking submission
3. Check for permission denied or constraint violation errors

### **Check Network Requests**
1. In Developer Tools → **Network** tab
2. Try submitting a booking
3. Look for failed API requests
4. Check the response details for error messages

---

## 📞 **EMERGENCY WORKAROUND**

If you need bookings to work immediately while fixing the database:

1. **Temporarily disable RLS** on all tables:
```sql
ALTER TABLE cameras DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
```

2. **Grant full public access**:
```sql
GRANT ALL ON ALL TABLES IN SCHEMA public TO public, anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO public, anon;
```

⚠️ **WARNING**: This removes all security. Only use temporarily and re-enable security after fixing the issues.

---

## ✅ **SUCCESS INDICATORS**

You'll know the fix worked when:
- ✅ Bookings submit successfully from captura.my
- ✅ New bookings appear in Supabase database
- ✅ No console errors during booking submission
- ✅ Admin dashboard loads booking data properly
- ✅ Customer data displays correctly (no "undefined" errors)

---

## 📋 **FILES TO USE**

1. **`production-database-diagnosis.sql`** - Run first to identify issues
2. **`production-complete-fix.sql`** - Main fix for structure and relationships
3. **`production-rls-policies.sql`** - Additional fix for permissions if needed

**Run these files in order in your production Supabase SQL Editor.**
