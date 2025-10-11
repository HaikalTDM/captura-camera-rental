# Notification System Summary

## Email + Push Notifications

Your Captura system now has a complete notification system that sends both **emails** and **push notifications** to keep you informed about bookings, pickups, and returns.

---

## 📧 Email Notifications

### When a Customer Books:

1. **Customer receives:**
   - ✅ Thank you email with booking details
   - 🕘 Pickup time: After 9:30 PM
   - 📞 Contact information

2. **Admin (you) receives:**
   - 🆕 New booking notification
   - Customer details
   - Camera and rental period
   - Total amount

### Daily Reminders (8:00 AM):

1. **Pickup Reminders** (sent to both customer & admin):
   - 📦 Equipment ready for pickup today
   - Reminder about 9:30 PM pickup time
   - Customer contact info

2. **Return Reminders** (sent to both customer & admin):
   - 🔙 Equipment must be returned by 10:00 PM tonight
   - Customer contact info
   - Inspection checklist for admin

---

## 📱 Push Notifications (PWA)

### Setup Required:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Generate VAPID keys:
   ```bash
   npm install -g web-push
   web-push generate-vapid-keys
   ```

3. Add to `.env.local`:
   ```env
   VAPID_PUBLIC_KEY=your_public_key
   VAPID_PRIVATE_KEY=your_private_key
   NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key
   NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
   ```

4. Create database table (run in Supabase SQL Editor):
   ```sql
   -- See scripts/create-push-subscriptions-table.sql
   ```

5. Deploy and add environment variables to Vercel

6. Enable notifications in your PWA:
   - Open admin dashboard on your phone
   - Click "Enable" on the Push Notifications card
   - Allow notifications when prompted

### When You'll Receive Push Notifications:

1. **🆕 New Booking** - Immediately when someone books
2. **📦 Pickup Today** - Daily at 8:00 AM for today's pickups
3. **🔙 Return Today** - Daily at 8:00 AM for today's returns

---

## System Architecture

### Files Created:

```
src/
├── lib/
│   ├── email/
│   │   └── emailService.ts          # Email templates & sending
│   └── push-notifications/
│       └── pushService.ts            # Push notification handling
├── app/
│   └── api/
│       ├── bookings/
│       │   └── submit/route.ts       # Sends email + push on booking
│       ├── email/
│       │   └── check-reminders/      # Daily cron job
│       │       └── route.ts
│       └── push-notifications/
│           ├── subscribe/route.ts     # Save subscription
│           ├── unsubscribe/route.ts   # Remove subscription
│           └── send/route.ts          # Send push to all devices
├── components/
│   └── admin/
│       └── PushNotificationToggle.tsx # UI for enabling push
public/
└── service-worker.js                  # Handles push events

scripts/
└── create-push-subscriptions-table.sql

Documentation:
├── EMAIL_SETUP_GUIDE.md              # Email configuration
├── EMAIL_SYSTEM_SUMMARY.md           # Email overview
├── PUSH_NOTIFICATIONS_SETUP.md       # Push notification setup
└── NOTIFICATION_SYSTEM_SUMMARY.md    # This file
```

---

## Email Configuration

### Environment Variables:

```env
# Gmail SMTP Configuration
EMAIL_USER=captura.my@gmail.com
EMAIL_APP_PASSWORD=your_16_character_app_password
EMAIL_FROM=captura.my@gmail.com
ADMIN_EMAIL=haikaltdm46@gmail.com
```

### Gmail App Password Setup:

1. Go to https://myaccount.google.com/apppasswords
2. Sign in with `captura.my@gmail.com`
3. Create app password named "Captura Notifications"
4. Copy the 16-character password
5. Add to `.env.local` as `EMAIL_APP_PASSWORD`

---

## Testing

### Test Email System:

```bash
# Test configuration
curl http://localhost:3000/api/email/test-config

# Test daily reminders
curl http://localhost:3000/api/email/check-reminders
```

### Test Push Notifications:

1. Enable notifications in your PWA
2. Make a test booking from the website
3. You should receive:
   - Email to `haikaltdm46@gmail.com`
   - Push notification on your phone

---

## Troubleshooting

### Emails Not Sending?

1. Check Gmail App Password is correct
2. Verify email environment variables in Vercel
3. Check Vercel deployment logs for errors
4. Ensure 2FA is enabled on Gmail account

### Push Notifications Not Working?

1. Ensure VAPID keys are generated and added to Vercel
2. Check that you've run the SQL script to create the table
3. Verify browser permissions allow notifications
4. Check service worker is registered (DevTools → Application → Service Workers)
5. Ensure `NEXT_PUBLIC_BASE_URL` is set correctly

---

## Quick Reference

### To Install:

```bash
npm install
```

### To Deploy:

```bash
git add .
git commit -m "Add notification system"
git push
```

### To Enable Push on Your Phone:

1. Open PWA admin dashboard
2. Click "Enable" on Push Notifications card
3. Allow notifications when prompted

---

## Support

If you need help:
- Check the detailed setup guides (EMAIL_SETUP_GUIDE.md, PUSH_NOTIFICATIONS_SETUP.md)
- Review Vercel deployment logs
- Check browser console for errors
- Verify all environment variables are set

