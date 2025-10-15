# 🔧 Fix Email Reminders - Service Role Key Setup

## Problem
The email reminder system was failing with:
```json
{
  "errors": ["Failed to fetch pickup reminders", "Failed to fetch return reminders"]
}
```

**Root Cause:** The API route was using the Supabase **Anonymous Key** which is blocked by Row Level Security (RLS) policies. Server-side API routes need the **Service Role Key** which bypasses RLS.

---

## ✅ What I Fixed

1. ✅ Created `supabaseAdmin` client in `src/lib/supabase.ts` using Service Role Key
2. ✅ Updated `src/app/api/email/check-reminders/route.ts` to use `supabaseAdmin`
3. ✅ This allows the cron job to read bookings without RLS restrictions

---

## 🚀 How to Deploy the Fix

### **Step 1: Get Your Supabase Service Role Key**

1. Go to your Supabase project: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/settings/api
2. Find the **"Service Role Key"** section (⚠️ **NOT** the anon key!)
3. Click "Reveal" and copy the key
4. ⚠️ **IMPORTANT:** This key bypasses RLS - **NEVER** expose it to the client-side!

---

### **Step 2: Add Environment Variable to Vercel**

1. Go to: https://vercel.com/your-project/settings/environment-variables
2. Click **"Add New"**
3. Set:
   - **Name:** `SUPABASE_SERVICE_ROLE_KEY`
   - **Value:** (paste the service role key you copied)
   - **Environment:** Check all three: ✅ Production ✅ Preview ✅ Development
4. Click **"Save"**

---

### **Step 3: Deploy to Vercel**

Option A: Push to GitHub (automatic deploy)
```bash
git add .
git commit -m "Fix email reminders with service role key"
git push
```

Option B: Manual deploy via Vercel CLI
```bash
vercel --prod
```

---

### **Step 4: Test the Fix**

After deployment, test the reminder endpoint:

1. Open in browser:
   ```
   https://captura.my/api/email/check-reminders
   ```

2. You should see:
   ```json
   {
     "success": true,
     "date": "2025-10-15",
     "summary": {
       "pickups": {
         "count": 1,
         "sent": 1,
         "ids": ["booking-id"]
       },
       "returns": {
         "count": 0,
         "sent": 0,
         "ids": []
       }
     },
     "message": "Sent 1 pickup reminders and 0 return reminders"
   }
   ```

3. ✅ **No more errors!**
4. ✅ Check your email inbox for the pickup reminder

---

## 📅 Automated Daily Reminders

Once deployed, the cron job will automatically run **every day at 8:00 AM UTC (4:00 PM Malaysia time)** and:

1. ✅ Check for pickups scheduled for today
2. ✅ Send admin email to `haikaltdm46@gmail.com`
3. ✅ Send customer email with pickup details
4. ✅ Check for returns due today
5. ✅ Send return reminders

---

## 🔒 Security Notes

- ✅ `supabase` (anon key) - Used for client-side (browser) code - Respects RLS
- ✅ `supabaseAdmin` (service role key) - Used for server-side API routes - Bypasses RLS
- ⚠️ **NEVER** import or use `supabaseAdmin` in client-side components!

---

## ✅ Summary

| Issue | Status |
|-------|--------|
| Supabase RLS blocking queries | ✅ Fixed |
| Service role key added | ⏳ **Action Required** |
| Code updated to use `supabaseAdmin` | ✅ Done |
| Ready to deploy | ✅ Yes |

**Next Step:** Add `SUPABASE_SERVICE_ROLE_KEY` to Vercel and redeploy!

