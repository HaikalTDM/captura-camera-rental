# 🔑 **COMPLETE API KEYS & ENVIRONMENT VARIABLES GUIDE**

I scanned your **entire project** and found **ALL** the environment variables you need!

---

## 🚨 **PRIORITY 1: REQUIRED (App Won't Work Without These!)**

### **Supabase (Database)**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Where to get:** https://supabase.com/dashboard → Your Project → Settings → API

**Used in:**
- `src/lib/supabase.ts` (database connection)
- `src/app/api/email/check-reminders/route.ts` (automated reminders)

**Impact if missing:** ❌ **App crashes - nothing works!**

---

## ⚠️ **PRIORITY 2: IMPORTANT (Features Won't Work)**

### **Email Notifications**
```env
EMAIL_FROM=captura.my@gmail.com
EMAIL_USER=captura.my@gmail.com
EMAIL_APP_PASSWORD=your_gmail_app_password_here
ADMIN_EMAIL=haikaltdm46@gmail.com
```

**Where to get Gmail App Password:**
1. Go to Google Account settings
2. Security → 2-Step Verification → App passwords
3. Generate new app password
4. Copy the 16-character password

**Used in:**
- `src/lib/email/emailService.ts` (email sending)
- `src/app/api/email/test-config/route.ts` (email testing)
- `src/app/api/email/check-reminders/route.ts` (automated reminders)

**Impact if missing:** ⚠️ **Email notifications won't work** (booking confirmations, reminders, etc.)

---

### **WhatsApp Notifications**
```env
WHATSAPP_BUSINESS_NUMBER=+60177464121
ADMIN_WHATSAPP_NUMBER=+60177464121
NEXT_PUBLIC_WHATSAPP_BUSINESS_NUMBER=+60177464121
```

**Optional (Only if using WhatsApp Business API):**
```env
WHATSAPP_API_URL=your_whatsapp_api_url_here
WHATSAPP_API_TOKEN=your_whatsapp_api_token_here
```

**Used in:**
- `src/lib/api/website-bookings.ts` (customer notifications)
- `src/app/api/whatsapp/send-booking/route.ts` (booking messages)
- `src/app/api/whatsapp/send-admin-notification/route.ts` (admin alerts)
- `src/app/api/photography/bookings/submit/route.ts` (photography bookings)

**Impact if missing:** ⚠️ **WhatsApp links will work, but automated messages won't send**

---

## 📱 **PRIORITY 3: OPTIONAL (Nice to Have)**

### **Push Notifications (PWA)**
```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key_here
VAPID_PUBLIC_KEY=your_vapid_public_key_here
VAPID_PRIVATE_KEY=your_vapid_private_key_here
```

**How to generate:**
```bash
npx web-push generate-vapid-keys
```

**Used in:**
- `src/components/admin/PushNotificationToggle.tsx` (PWA notifications)
- `src/app/api/push-notifications/send/route.ts` (sending push notifications)
- `src/app/api/bookings/submit/route.ts` (booking alerts)
- `src/app/api/email/check-reminders/route.ts` (reminder alerts)

**Impact if missing:** 📱 **PWA push notifications won't work (everything else works fine)**

---

### **AI Assistant (Chatbot)**
```env
DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

**Where to get:** https://platform.deepseek.com/

**Used in:**
- `src/app/api/admin/ai-assistant/route.ts` (AI chatbot in admin)

**Impact if missing:** 🤖 **AI assistant won't work (rest of admin works fine)**

---

### **External Event APIs**
```env
NEXT_PUBLIC_EVENTBRITE_TOKEN=your_eventbrite_token_here
NEXT_PUBLIC_TICKETMASTER_KEY=your_ticketmaster_key_here
NEXT_PUBLIC_SEATGEEK_CLIENT_ID=your_seatgeek_client_id_here
```

**Where to get:**
- Eventbrite: https://www.eventbrite.com/platform/
- Ticketmaster: https://developer.ticketmaster.com/
- SeatGeek: https://seatgeek.com/

**Used in:**
- `src/lib/api/externalEvents.ts` (Events page - loads live events)

**Impact if missing:** 📅 **Events page shows only curated events (no external events)**

---

## 🌐 **PRIORITY 4: CONFIGURATION (Auto-set)**

### **Site URLs**
```env
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NODE_ENV=development
```

**Used in:**
- `src/app/api/email/check-reminders/route.ts` (links in emails)
- `src/app/api/bookings/submit/route.ts` (notification links)
- `src/app/api/photography/bookings/submit/route.ts` (booking details)
- `src/components/ErrorBoundary.tsx` (error display)

**For Production:** Update to your actual domain (e.g., `https://captura.my`)

**Impact if missing:** 🔗 **Uses defaults - links in emails/notifications might be wrong**

---

## ✅ **RECOMMENDED `.env.local` FILE**

### **Minimal Setup (Just to Get Started):**
```env
# REQUIRED - App won't work without these
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# SITE CONFIG
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### **Full Setup (All Features Working):**
```env
# ==================================
# SUPABASE (REQUIRED)
# ==================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# ==================================
# EMAIL NOTIFICATIONS (IMPORTANT)
# ==================================
EMAIL_FROM=captura.my@gmail.com
EMAIL_USER=captura.my@gmail.com
EMAIL_APP_PASSWORD=your_gmail_app_password
ADMIN_EMAIL=haikaltdm46@gmail.com

# ==================================
# WHATSAPP (IMPORTANT)
# ==================================
WHATSAPP_BUSINESS_NUMBER=+60177464121
ADMIN_WHATSAPP_NUMBER=+60177464121
NEXT_PUBLIC_WHATSAPP_BUSINESS_NUMBER=+60177464121

# Optional: WhatsApp Business API
# WHATSAPP_API_URL=your_api_url
# WHATSAPP_API_TOKEN=your_api_token

# ==================================
# SITE CONFIGURATION
# ==================================
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# ==================================
# PUSH NOTIFICATIONS (OPTIONAL)
# ==================================
# Run: npx web-push generate-vapid-keys
# NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key
# VAPID_PUBLIC_KEY=your_public_key
# VAPID_PRIVATE_KEY=your_private_key

# ==================================
# AI ASSISTANT (OPTIONAL)
# ==================================
# DEEPSEEK_API_KEY=your_deepseek_key

# ==================================
# EXTERNAL EVENTS (OPTIONAL)
# ==================================
# NEXT_PUBLIC_EVENTBRITE_TOKEN=your_token
# NEXT_PUBLIC_TICKETMASTER_KEY=your_key
# NEXT_PUBLIC_SEATGEEK_CLIENT_ID=your_client_id
```

---

## 📊 **SUMMARY TABLE**

| Variable | Priority | Impact if Missing | Where Used |
|----------|----------|-------------------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | 🚨 **CRITICAL** | App crashes | Database connection |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 🚨 **CRITICAL** | App crashes | Database queries |
| `SUPABASE_SERVICE_ROLE_KEY` | 🚨 **CRITICAL** | Server APIs fail | Admin operations |
| `EMAIL_*` | ⚠️ **HIGH** | No email notifications | Booking confirmations |
| `WHATSAPP_*` | ⚠️ **HIGH** | No WhatsApp messages | Customer notifications |
| `VAPID_*` | 📱 **MEDIUM** | No push notifications | PWA alerts |
| `DEEPSEEK_API_KEY` | 🤖 **LOW** | No AI chatbot | Admin assistant |
| `EVENTBRITE_*` | 📅 **LOW** | No external events | Events page |
| `*_BASE_URL` | 🔗 **LOW** | Wrong links | Email/notification links |

---

## 🎯 **QUICK START CHECKLIST**

### **To Get App Running:**
- [ ] Create `.env.local` file in project root
- [ ] Add Supabase URL and keys
- [ ] Restart dev server (`npm run dev`)
- [ ] Test: Open app, should load without errors

### **To Enable Email Notifications:**
- [ ] Generate Gmail App Password
- [ ] Add `EMAIL_*` variables
- [ ] Test: `/api/email/test-config`

### **To Enable WhatsApp:**
- [ ] Add WhatsApp phone numbers
- [ ] Test: Create a booking

### **To Enable Push Notifications:**
- [ ] Run `npx web-push generate-vapid-keys`
- [ ] Add VAPID keys
- [ ] Test: Install PWA, enable notifications

### **To Enable AI Assistant:**
- [ ] Get DeepSeek API key
- [ ] Add to `.env.local`
- [ ] Test: Admin → AI Assistant

### **To Enable External Events:**
- [ ] Get API keys from event platforms
- [ ] Add to `.env.local`
- [ ] Test: `/rental/events`

---

## 🔒 **SECURITY NOTES**

### **NEVER Commit These to Git:**
- ❌ `.env.local`
- ❌ `.env.production`
- ❌ Any file with real API keys

### **Safe to Share:**
- ✅ `.env.example` (with placeholder values)
- ✅ Variable names (without actual values)

### **Keep Private:**
- 🔐 `SUPABASE_SERVICE_ROLE_KEY` (full database access)
- 🔐 `EMAIL_APP_PASSWORD` (email sending access)
- 🔐 `VAPID_PRIVATE_KEY` (push notification signing)
- 🔐 `DEEPSEEK_API_KEY` (AI API access)
- 🔐 `WHATSAPP_API_TOKEN` (messaging access)

---

## 🆘 **TROUBLESHOOTING**

### **App won't load:**
→ Check Supabase keys are correct

### **Emails not sending:**
→ Verify Gmail App Password (not regular password!)

### **WhatsApp links broken:**
→ Check phone number format: `+60177464121`

### **Push notifications not working:**
→ Generate new VAPID keys: `npx web-push generate-vapid-keys`

### **AI assistant not responding:**
→ Verify DeepSeek API key is valid

### **Events page showing only curated events:**
→ External API keys might be invalid or missing

---

## 📝 **PRODUCTION DEPLOYMENT**

When deploying to Vercel/production:

1. **Update URLs:**
   ```env
   NEXT_PUBLIC_BASE_URL=https://yourdomain.com
   NEXT_PUBLIC_SITE_URL=https://yourdomain.com
   ```

2. **Add Environment Variables in Vercel:**
   - Go to Vercel Dashboard
   - Project Settings → Environment Variables
   - Add ALL the variables from your `.env.local`
   - Redeploy

3. **Test Everything:**
   - Database connection
   - Email notifications
   - WhatsApp messages
   - Push notifications
   - AI assistant
   - External events

---

**You now have a complete list of ALL API keys and environment variables needed!** 🎉

**Start with the REQUIRED ones (Supabase), then add the rest as you need them!**


