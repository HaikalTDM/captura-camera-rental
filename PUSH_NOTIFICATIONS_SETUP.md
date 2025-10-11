# Push Notifications Setup Guide

## Overview
This system sends push notifications to your phone when:
- Someone makes a new booking
- Equipment needs to be picked up today
- Equipment needs to be returned today

## Prerequisites
- Admin PWA installed on your phone
- Gmail account configured for email notifications
- HTTPS enabled (required for push notifications)

---

## Step 1: Create Database Table

Run the SQL script in your Supabase SQL Editor:

```bash
# File: scripts/create-push-subscriptions-table.sql
```

Navigate to your Supabase project:
1. Go to **SQL Editor**
2. Copy the content from `scripts/create-push-subscriptions-table.sql`
3. Click **Run**

---

## Step 2: Generate VAPID Keys

VAPID keys are required for Web Push API. Generate them using Node.js:

### Option A: Using web-push CLI (Recommended)

```bash
# Install web-push globally
npm install -g web-push

# Generate VAPID keys
web-push generate-vapid-keys
```

This will output something like:
```
=======================================

Public Key:
BEl62iUYgUivxIkv69yViEuiBIa-Ib27SDbQjfTbSrqhPRxxxxx...

Private Key:
q3dxVapXCLvxxxxx...

=======================================
```

### Option B: Using Node.js script

Create a file `generate-vapid-keys.js`:

```javascript
const webpush = require('web-push');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('=======================================');
console.log('');
console.log('Public Key:');
console.log(vapidKeys.publicKey);
console.log('');
console.log('Private Key:');
console.log(vapidKeys.privateKey);
console.log('');
console.log('=======================================');
```

Then run:
```bash
node generate-vapid-keys.js
```

---

## Step 3: Configure Environment Variables

Add these to your `.env.local` file:

```env
# Push Notification VAPID Keys
VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key_here

# Base URL (for cron jobs to send push notifications)
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
```

**Important Notes:**
- The `NEXT_PUBLIC_VAPID_PUBLIC_KEY` must be the same as `VAPID_PUBLIC_KEY` (it's exposed to the browser)
- For local development, use `http://localhost:3000` as the base URL
- For production, use your actual domain (e.g., `https://captura.vercel.app`)

---

## Step 4: Deploy to Vercel

Push your changes and deploy:

```bash
git add .
git commit -m "Add push notifications system"
git push
```

In Vercel Dashboard:
1. Go to your project **Settings** → **Environment Variables**
2. Add all three environment variables:
   - `VAPID_PUBLIC_KEY`
   - `VAPID_PRIVATE_KEY`
   - `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
   - `NEXT_PUBLIC_BASE_URL`
3. **Redeploy** your application

---

## Step 5: Enable Notifications on Your Phone

1. Open the **Captura Admin** PWA on your phone
2. Log in to the admin panel
3. On the dashboard, you'll see a **"Push Notifications"** card
4. Click **"Enable"**
5. When prompted, click **"Allow"** to enable notifications

---

## Testing

### Test Push Notifications

After enabling notifications, test them:

1. **Test New Booking:**
   - Go to the main Captura website on another device
   - Book a camera
   - You should receive a push notification on your phone: "🆕 New Booking"

2. **Test Pickup Reminder:**
   - Wait for the daily cron job (8:00 AM) or manually trigger:
   ```bash
   curl https://your-domain.vercel.app/api/email/check-reminders
   ```
   - If there are pickups today, you'll get: "📦 Pickup Today"

3. **Test Return Reminder:**
   - Same as above, but for returns: "🔙 Return Today"

---

## Troubleshooting

### Notifications Not Working?

1. **Check Browser Permissions:**
   - Go to your phone's browser settings
   - Ensure notifications are allowed for your site

2. **Check VAPID Keys:**
   - Ensure they're correctly set in Vercel environment variables
   - Ensure `NEXT_PUBLIC_VAPID_PUBLIC_KEY` matches `VAPID_PUBLIC_KEY`

3. **Check Service Worker:**
   - Open browser DevTools (if available on mobile)
   - Go to Application → Service Workers
   - Ensure service worker is registered and active

4. **Check Database:**
   - Go to Supabase → Table Editor → `push_subscriptions`
   - Ensure your subscription is saved with `is_active = true`

5. **Check Console Logs:**
   - In your Vercel deployment logs, check for push notification errors
   - Look for messages like "✅ Push notification sent to admin"

### Re-enable Notifications

If notifications stop working:
1. Click **"Disable"** in the PWA
2. Wait 2 seconds
3. Click **"Enable"** again
4. Allow notifications when prompted

---

## How It Works

### Architecture

1. **Service Worker** (`public/service-worker.js`):
   - Registers on your device
   - Listens for push events
   - Shows notifications

2. **Subscription Storage** (`push_subscriptions` table):
   - Stores your device's push subscription
   - Includes encryption keys for secure messaging

3. **API Routes**:
   - `/api/push-notifications/subscribe` - Saves subscription to database
   - `/api/push-notifications/unsubscribe` - Removes subscription
   - `/api/push-notifications/send` - Sends push to all subscribed devices

4. **Triggers**:
   - **New Booking:** Sent immediately when customer books
   - **Pickup Reminder:** Sent by daily cron job at 8:00 AM
   - **Return Reminder:** Sent by daily cron job at 8:00 AM

---

## Security Notes

- VAPID private key must be kept secret (never expose to client)
- VAPID public key is safe to expose (it's needed by the browser)
- Push subscriptions are encrypted end-to-end
- Only your subscribed devices receive notifications

---

## Need Help?

If you encounter issues:
1. Check the Vercel deployment logs
2. Check browser console for errors
3. Verify all environment variables are set correctly
4. Ensure service worker is registered and active

