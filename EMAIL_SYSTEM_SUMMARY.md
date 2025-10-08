# 📧 Email Notification System - Quick Reference

## What It Does

Automatically sends email reminders from **captura.my@gmail.com** to **haikaltdm46@gmail.com** for:

1. **Pickup Reminders** 📦
   - Sent daily at 8 AM
   - For customers who need to pick up equipment today
   
2. **Return Reminders** 🔙
   - Sent daily at 8 AM
   - For customers who need to return equipment today

3. **New Booking Notifications** 🆕
   - Sent when customer submits a booking
   - Requires manual integration (optional)

---

## Files Created

### Core System:
```
src/lib/email/
  └── emailService.ts              Email sending functions

src/app/api/email/
  ├── check-reminders/route.ts     Daily reminder checker
  └── test-config/route.ts         Test endpoint

vercel.json                        Cron configuration (8 AM daily)
```

### Documentation:
```
EMAIL_SETUP_GUIDE.md              Complete setup instructions
EMAIL_SYSTEM_SUMMARY.md           This file
```

### Package Updates:
```
package.json                      Added nodemailer dependencies
```

---

## Setup (Quick Version)

### 1. Get Gmail App Password
- Go to https://myaccount.google.com/security
- Enable 2-Step Verification
- Generate App Password
- Copy 16-character password

### 2. Add to `.env.local`
```bash
EMAIL_USER=captura.my@gmail.com
EMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
EMAIL_FROM=captura.my@gmail.com
ADMIN_EMAIL=haikaltdm46@gmail.com
```

### 3. Add to Vercel
- Settings → Environment Variables
- Add same 4 variables
- Redeploy

### 4. Install & Test
```bash
npm install
npm run dev
# Visit: http://localhost:3000/api/email/test-config
```

---

## API Endpoints

| Endpoint | Purpose | Method |
|----------|---------|--------|
| `/api/email/check-reminders` | Check and send daily reminders | GET |
| `/api/email/test-config` | Test email configuration | GET |

---

## Schedule

**Cron:** Every day at 8:00 AM (Malaysia time)  
**Configured in:** `vercel.json`

```json
{
  "crons": [{
    "path": "/api/email/check-reminders",
    "schedule": "0 8 * * *"
  }]
}
```

---

## Email Templates

All emails include:
- Booking ID
- Customer name
- Camera name
- Phone & email
- Relevant dates
- Styled HTML with company branding

Colors:
- Pickup: Purple gradient
- Return: Pink gradient
- New booking: Blue gradient

---

## How It Works

### Daily at 8 AM:
1. Vercel cron triggers `/api/email/check-reminders`
2. System queries Supabase for:
   - Pickups today (`pickup_date = today`, `equipment_picked_up = false`)
   - Returns today (`end_date = today`, `equipment_returned = false`)
3. Sends email for each booking via Gmail SMTP
4. Returns summary of sent emails

---

## Testing

### Local Testing:
```bash
# Test email configuration
curl http://localhost:3000/api/email/test-config

# Check what reminders would be sent
curl http://localhost:3000/api/email/check-reminders
```

### Production Testing:
```bash
# Visit your deployment URL
https://your-domain.vercel.app/api/email/test-config
```

---

## Monitoring

### Check if cron is running:
1. Vercel Dashboard → Your Project
2. Deployments → Latest
3. Functions → `/api/email/check-reminders`
4. View logs

### Expected logs:
```
🔔 Checking for pickup and return reminders...
📦 Found 2 pickups for today
✅ Pickup reminder email sent: booking-id
🔙 Found 1 returns for today  
✅ Return reminder email sent: booking-id
```

---

## Customization

### Change Schedule:
Edit `vercel.json`:
```json
"schedule": "0 9,17 * * *"  // 9 AM and 5 PM
```

### Change Recipient:
Update `.env.local`:
```bash
ADMIN_EMAIL=new-email@gmail.com
```

### Change Email Template:
Edit `src/lib/email/emailService.ts`

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Invalid login" | Use App Password, not regular password |
| No emails received | Check spam folder, verify env vars |
| Cron not running | Check Vercel logs, ensure redeployed |
| Test fails | Verify Gmail App Password is correct |

---

## Next Steps (Optional)

### 1. Add New Booking Notifications:
In `src/app/api/bookings/submit/route.ts`, add:
```typescript
import { sendNewBookingNotification } from '@/lib/email/emailService';

// After booking created:
await sendNewBookingNotification({
  bookingId: result.booking_id,
  customerName: bookingData.customer_name,
  cameraName: bookingData.camera_name,
  phone: bookingData.customer_phone,
  email: bookingData.customer_email,
  startDate: bookingData.start_date,
  endDate: bookingData.end_date,
  totalAmount: bookingData.total_amount
});
```

### 2. Add SMS Notifications:
- Use Twilio or similar service
- Add SMS sending alongside emails

### 3. Send to Customer:
- Modify templates to send to customer instead of admin
- Add customer email as recipient

### 4. Multiple Recipients:
- Change `to` field to array: `to: [email1, email2]`

---

## Security Notes

✅ App Password (not regular password)  
✅ Environment variables (not in code)  
✅ HTTPS only  
✅ `.env.local` in `.gitignore`  

---

## Support

For help, see:
- **EMAIL_SETUP_GUIDE.md** - Complete setup guide
- **Vercel Logs** - Runtime errors
- **Test endpoint** - `/api/email/test-config`

---

**System Status: Ready ✅**

Once environment variables are set, the system will automatically send daily reminders at 8 AM!

