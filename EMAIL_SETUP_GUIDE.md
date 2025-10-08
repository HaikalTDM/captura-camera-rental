# 📧 Email Notification System Setup Guide

## Overview

This system automatically sends email reminders for:
- 📦 **Pickup Reminders** - When customers need to pick up equipment
- 🔙 **Return Reminders** - When equipment is due for return
- 🆕 **New Booking Notifications** - When customers submit bookings

Emails are sent from: `captura.my@gmail.com`  
Emails go to: `haikaltdm46@gmail.com`

---

## 🚀 Quick Setup (5 Steps)

### Step 1: Enable Gmail App Password

1. Go to your Google Account: https://myaccount.google.com/
2. Click **Security** in the left sidebar
3. Enable **2-Step Verification** (if not already enabled)
4. After 2-Step Verification is enabled, go back to Security
5. Scroll down to **"Signing in to Google"**
6. Click on **"App passwords"**
7. Select app: **Mail**
8. Select device: **Other (Custom name)**
9. Enter name: **Captura Email Service**
10. Click **Generate**
11. **Copy the 16-character password** (e.g., `abcd efgh ijkl mnop`)

> ⚠️ **Important**: This is different from your regular Gmail password!

---

### Step 2: Update Environment Variables

Add these to your `.env.local` file:

```bash
# Email Configuration
EMAIL_USER=captura.my@gmail.com
EMAIL_APP_PASSWORD=your-16-char-app-password-here
EMAIL_FROM=captura.my@gmail.com
ADMIN_EMAIL=haikaltdm46@gmail.com
```

**Example:**
```bash
EMAIL_USER=captura.my@gmail.com
EMAIL_APP_PASSWORD=abcd efgh ijkl mnop
EMAIL_FROM=captura.my@gmail.com
ADMIN_EMAIL=haikaltdm46@gmail.com
```

---

### Step 3: Add to Vercel Environment Variables (For Production)

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **captura** project
3. Go to **Settings** → **Environment Variables**
4. Add each variable:

| Key | Value |
|-----|-------|
| `EMAIL_USER` | `captura.my@gmail.com` |
| `EMAIL_APP_PASSWORD` | Your 16-char app password |
| `EMAIL_FROM` | `captura.my@gmail.com` |
| `ADMIN_EMAIL` | `haikaltdm46@gmail.com` |

5. Click **Save**
6. **Redeploy** your project for changes to take effect

---

### Step 4: Install Dependencies

```bash
npm install
```

This will install:
- `nodemailer` - Email sending library
- `@types/nodemailer` - TypeScript types

---

### Step 5: Test the Email System

**Option A: Test Locally**

Create a test file `test-email.js`:

```javascript
require('dotenv').config({ path: '.env.local' });

async function testEmail() {
  const { sendPickupReminder } = require('./src/lib/email/emailService.ts');
  
  const result = await sendPickupReminder({
    bookingId: '12345678-test',
    customerName: 'Test Customer',
    cameraName: 'DJI Osmo Pocket 3',
    phone: '+60123456789',
    email: 'customer@example.com',
    pickupDate: 'Wednesday, 8 October 2025'
  });
  
  console.log('Test result:', result ? 'SUCCESS ✅' : 'FAILED ❌');
}

testEmail();
```

Run: `node test-email.js`

**Option B: Test via API**

Visit: `http://localhost:3000/api/email/check-reminders`

Or use curl:
```bash
curl http://localhost:3000/api/email/check-reminders
```

---

## ⏰ Automatic Daily Reminders

### How It Works:

The system checks **daily at 8:00 AM (Malaysia time)** for:
- Pickups scheduled for today
- Returns due today

This is configured in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/email/check-reminders",
      "schedule": "0 8 * * *"
    }
  ]
}
```

### Cron Schedule Format:

```
0 8 * * *
│ │ │ │ │
│ │ │ │ └─ Day of week (0-6, 0 = Sunday)
│ │ │ └─── Month (1-12)
│ │ └───── Day of month (1-31)
│ └─────── Hour (0-23)
└───────── Minute (0-59)
```

**Examples:**
- `0 8 * * *` - Daily at 8:00 AM
- `0 9,17 * * *` - Twice daily at 9 AM and 5 PM
- `*/30 * * * *` - Every 30 minutes
- `0 0 * * 0` - Weekly on Sunday at midnight

### Change Schedule:

Edit `vercel.json` and change the `schedule` value, then redeploy.

---

## 📧 Email Templates

### 1. Pickup Reminder
- **Subject:** `🔔 PICKUP REMINDER - [Customer] - [Camera]`
- **Sent when:** pickup_date is today
- **Condition:** equipment_picked_up = false, booking_status = confirmed

### 2. Return Reminder
- **Subject:** `🔔 RETURN REMINDER - [Customer] - [Camera]`
- **Sent when:** end_date is today
- **Condition:** equipment_returned = false, equipment_picked_up = true

### 3. New Booking Notification
- **Subject:** `🆕 NEW BOOKING - [Customer] - [Camera]`
- **Sent when:** Customer submits booking
- **Trigger:** Manual in booking form

---

## 🔧 Manual Testing & Troubleshooting

### Test Email Configuration

```bash
curl http://localhost:3000/api/email/test-config
```

### Check Today's Reminders

```bash
curl http://localhost:3000/api/email/check-reminders
```

### Common Issues:

#### ❌ "Invalid login"
- Make sure you're using an **App Password**, not your regular Gmail password
- Ensure 2-Step Verification is enabled on your Google Account

#### ❌ "Connection timeout"
- Check your internet connection
- Gmail SMTP might be blocked by firewall
- Try using port 465 instead of 587

#### ❌ "Username and Password not accepted"
- Remove spaces from app password (should be 16 chars with no spaces)
- Generate a new app password
- Ensure EMAIL_USER and EMAIL_APP_PASSWORD are set correctly

#### ❌ Emails going to spam
- Add `captura.my@gmail.com` to safe senders in your personal email
- Check SPF/DKIM settings (automatic with Gmail)

---

## 🔐 Security Best Practices

✅ **DO:**
- Use environment variables for sensitive data
- Use Gmail App Passwords (not regular password)
- Keep `.env.local` in `.gitignore`
- Rotate app passwords periodically

❌ **DON'T:**
- Commit passwords to GitHub
- Share your app password
- Use regular Gmail password in code
- Hardcode email credentials

---

## 📊 Monitoring & Logs

### Check Vercel Logs:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Click **Deployments**
4. Click on latest deployment
5. Click **Functions** tab
6. Find `/api/email/check-reminders`
7. View logs

### Log Messages:

```
✅ Pickup reminder email sent: [booking-id]
✅ Return reminder email sent: [booking-id]
❌ Error sending pickup reminder email: [error]
```

---

## 🎨 Customizing Email Templates

Edit `/src/lib/email/emailService.ts`:

### Change Email Content:

```typescript
export async function sendPickupReminder(data: EmailData) {
  const mailOptions = {
    subject: `Your custom subject here`,
    html: `
      <div style="...">
        Your custom HTML here
      </div>
    `
  };
  // ...
}
```

### Change From/To Addresses:

Update `.env.local`:
```bash
EMAIL_FROM=your-business-email@gmail.com
ADMIN_EMAIL=your-personal-email@gmail.com
```

---

## 📞 Support

If you need help:
1. Check this guide first
2. Review Vercel logs for errors
3. Test email config: `/api/email/test-config`
4. Check Gmail App Password is correct

---

## ✅ Checklist

Before going live, make sure:

- [ ] Gmail App Password generated
- [ ] Environment variables set in `.env.local`
- [ ] Environment variables added to Vercel
- [ ] Dependencies installed (`npm install`)
- [ ] Test email sent successfully
- [ ] Vercel cron configured
- [ ] Project redeployed to Vercel
- [ ] Checked Vercel logs for cron execution
- [ ] Added sender to safe list (avoid spam)

---

**Setup Complete! 🎉**

Your email reminder system is now ready to send automated pickup and return reminders daily at 8 AM!

