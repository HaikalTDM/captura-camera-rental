# 📸 CAPTURA - Professional Camera Rental & Photography Platform

A comprehensive dual-service platform for **camera equipment rental** and **photography services**, built with Next.js 15, React 19, and Supabase.

**Live Site**: [captura.my](https://captura.my)

---

## 🌟 Overview

CAPTURA is a full-featured platform with:
- **Customer-facing website** for camera rentals and photography bookings
- **Admin dashboard** for managing bookings, equipment, customers, and operations
- **AI assistant** to help admins check availability and manage bookings
- **Email & push notifications** for pickup/return reminders
- **Invoice generation** system
- **PWA support** for mobile admin management

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15.5.3 (App Router)
- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Email**: Nodemailer (Gmail SMTP)
- **Push Notifications**: Web Push API
- **AI**: DeepSeek API
- **Deployment**: Vercel
- **Domain**: Cloudflare (DNS)

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env.local` file (see `.env.example`):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Email (Gmail SMTP)
EMAIL_USER=captura.my@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=captura.my@gmail.com
ADMIN_EMAIL=haikaltdm46@gmail.com

# Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key

# Base URL
NEXT_PUBLIC_BASE_URL=https://captura.my

# AI Assistant (DeepSeek)
DEEPSEEK_API_KEY=sk-your-deepseek-api-key

# Admin Auth
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-password
```

### 3. Run Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 📋 Features

### 🎬 Customer Website

#### Camera Rental
- **Interactive catalog** with real-time availability
- **Custom calendar** for date selection with conflict detection
- **Dynamic pricing** (discounts for 3+ days)
- **Booking flow** with customer details and terms acceptance
- **Pickup options**: Shop pickup or home delivery
- **WhatsApp integration** for instant communication

#### Photography Services
- **Package browsing** (wedding, portrait, event, product)
- **Gallery showcase** of past work
- **TidyCal integration** for bookings

### 🔧 Admin Dashboard

#### Core Management
- **Dashboard**: Overview of bookings, revenue, upcoming pickups/returns
- **Booking Approvals**: Review and approve pending bookings
- **Calendar**: Visual timeline of all bookings by camera
- **Bookings**: Full CRUD, status tracking, invoice generation
- **Cameras**: Equipment management with specs and pricing
- **Accessories**: Manage add-on items
- **Customers**: CRM with booking history
- **Gallery**: Upload and manage portfolio images

#### Advanced Features
- **Bulk CSV Import**: Import bookings and customers
- **Invoice Generation**: PDF invoices with branding
- **WhatsApp Integration**: Click-to-chat for pickups/returns
- **Search & Filters**: Advanced booking search
- **PWA Support**: Install admin app on mobile

### 🤖 AI Assistant

**Powered by DeepSeek** - Chat interface in admin dashboard

**What it can do:**
- Check camera availability for date ranges
- Get booking details
- Search customer information
- View upcoming pickups and returns
- List recent bookings
- Show all cameras with pricing

**Example queries:**
- "Is the GoPro available from Oct 20-25?"
- "Show me today's pickups"
- "Find customer john@example.com"
- "List all pending bookings"

### 📧 Email System

**Admin Notifications** (to haikaltdm46@gmail.com):
- New booking received
- Pickup reminder (day before)
- Return reminder (on return date)

**Customer Emails**:
- Thank you email upon booking
- Pickup reminder (day before, after 9:30 PM)
- Return reminder (return date, by 10:00 PM)

**Automated via Vercel Cron** (daily at 8:00 AM UTC)

### 🔔 Push Notifications

**PWA Admin App** receives push notifications for:
- New bookings
- Upcoming pickups
- Upcoming returns

**Setup:**
- Enable notifications in admin dashboard
- Install PWA on mobile device
- Receive real-time alerts

---

## 📁 Project Structure

```
captura/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Customer homepage
│   │   ├── admin/                      # Admin dashboard
│   │   │   ├── page.tsx                # Dashboard overview
│   │   │   ├── booking-approvals/      # Pending approvals
│   │   │   ├── calendar/               # Booking calendar
│   │   │   ├── bookings/               # Booking management
│   │   │   ├── cameras/                # Equipment management
│   │   │   ├── customers/              # Customer CRM
│   │   │   └── gallery/                # Portfolio management
│   │   ├── api/
│   │   │   ├── bookings/               # Booking CRUD APIs
│   │   │   ├── email/                  # Email notification APIs
│   │   │   ├── push-notifications/     # Push notification APIs
│   │   │   └── admin/ai-assistant/     # AI assistant API
│   │   └── photography/                # Photography service pages
│   ├── components/
│   │   ├── admin/                      # Admin dashboard components
│   │   │   ├── AIAssistant.tsx         # AI chat widget
│   │   │   ├── BookingApprovalCard.tsx # Approval card
│   │   │   └── PushNotificationToggle.tsx
│   │   ├── CustomCalendar.tsx          # Date picker with conflicts
│   │   ├── BookingForm.tsx             # Customer booking form
│   │   ├── Toast.tsx                   # Notification toasts
│   │   └── ...
│   └── lib/
│       ├── supabase.ts                 # Supabase client
│       ├── email/emailService.ts       # Email sending logic
│       ├── push-notifications/         # Push notification logic
│       └── api/                        # API helpers
├── public/
│   ├── images/                         # Camera and gallery images
│   ├── service-worker.js               # PWA service worker
│   └── manifest.json                   # PWA manifest
├── scripts/
│   ├── add-second-osmo-pocket-3.js     # Camera addition script
│   └── ...
└── sql/
    ├── create-push-subscriptions-table.sql
    └── fix-pickup-date.sql
```

---

## 🗄️ Database Schema

### Tables

**cameras**
- `id`, `name`, `description`, `image_url`, `status`
- `daily_rate`, `weekly_rate`, `monthly_rate`, `deposit_amount`
- Specs: `purchase_date`, `serial_number`, `warranty_expiry`
- Maintenance tracking

**bookings**
- `id`, `customer_id`, `camera_id`
- Dates: `start_date`, `end_date`, `pickup_date`
- Status: `booking_status` (pending/confirmed/cancelled/completed)
- Tracking: `equipment_picked_up`, `equipment_returned`
- Payment: `total_amount`, `deposit_paid`, `final_payment_status`
- `pickup_method` (shop/delivery), `booking_source`

**customers**
- `id`, `full_name`, `email`, `phone`, `ic_number`
- Address fields
- Created/updated timestamps

**accessories**
- Add-on items (batteries, tripods, cases, etc.)

**gallery**
- Portfolio images for photography service

**push_subscriptions**
- Web push subscription data for PWA notifications

### Database Triggers

**Auto-calculate pickup_date**
- Trigger: `set_pickup_date_trigger`
- Function: `set_pickup_date()`
- Sets `pickup_date = start_date - 1 day` on insert/update

---

## ⚙️ Setup Guides

### Email Notifications Setup

1. **Generate Gmail App Password**
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable 2-Step Verification
   - Go to App Passwords → Generate new app password
   - Copy the 16-character password

2. **Add to Vercel**
   ```
   EMAIL_USER=captura.my@gmail.com
   EMAIL_PASSWORD=your-16-char-app-password
   EMAIL_FROM=captura.my@gmail.com
   ADMIN_EMAIL=haikaltdm46@gmail.com
   ```

3. **Test Email**
```bash
   curl https://captura.my/api/email/test-config
   ```

4. **Cron Job** (already configured in `vercel.json`)
   - Runs daily at 8:00 AM UTC
   - Endpoint: `/api/email/check-reminders`

### Push Notifications Setup

1. **Generate VAPID Keys**
   ```bash
   npx web-push generate-vapid-keys
   ```

2. **Add to Vercel**
   ```
   NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-public-key
   VAPID_PRIVATE_KEY=your-private-key
   ```

3. **Create Database Table**
   - Run `scripts/create-push-subscriptions-table.sql` in Supabase SQL Editor

4. **Enable in Admin Dashboard**
   - Login to admin
   - Click "Enable Notifications" toggle
   - Allow browser permissions
   - Install PWA for mobile notifications

### AI Assistant Setup

1. **Get DeepSeek API Key**
   - Visit [platform.deepseek.com](https://platform.deepseek.com)
   - Sign up/login
   - Create API key (starts with `sk-`)
   - **Add credits**: ~RM20-50 recommended for months of usage

2. **Add to Vercel**
   ```
   DEEPSEEK_API_KEY=sk-your-key-here
   ```

3. **Use the Assistant**
   - Login to admin dashboard
   - Click floating chat bubble (bottom-right)
   - Ask questions about bookings, availability, customers

**Example queries:**
```
"Is DJI Osmo Pocket 3 available Oct 20-25?"
"Show recent bookings"
"What pickups are today?"
"Find customer with email john@example.com"
"List all cameras"
```

---

## 🎨 Available Cameras

1. **DJI Action 5 Pro** - RM50/day (RM45/day for 3+ days)
2. **DJI Osmo Pocket 3** - RM50/day (RM45/day for 3+ days)
3. **DJI Osmo Pocket 3 (ii)** - RM50/day (RM45/day for 3+ days)

---

## 🔐 Admin Access

**Login URL**: [captura.my/admin/login](https://captura.my/admin/login)

**Credentials**: Stored in `ADMIN_USERNAME` and `ADMIN_PASSWORD` environment variables

**PWA Installation**:
- Visit admin dashboard on mobile
- Click "Add to Home Screen"
- Open installed app
- Enable push notifications

---

## 📱 Customer Booking Flow

1. **Browse Cameras**: View available cameras with specs
2. **Select Dates**: Interactive calendar shows availability
3. **Check Conflicts**: Toast warning if dates unavailable
4. **Enter Details**: Name, email, phone, IC, address
5. **Choose Pickup**: Shop pickup (after 9:30 PM) or delivery
6. **Accept Terms**: Terms and conditions modal
7. **Submit**: Booking sent for admin approval
8. **Email Confirmation**: Customer receives thank you email
9. **Admin Notification**: Admin receives booking alert (email + push)
10. **Pickup Reminder**: Sent day before pickup
11. **Return Reminder**: Sent on return date

---

## 🚢 Deployment

### Vercel (Current)

**Domain**: captura.my (via Cloudflare DNS)

**Environment Variables** (all set in Vercel dashboard):
- Supabase credentials
- Email configuration
- Push notification keys
- DeepSeek API key
- Admin credentials

**Automatic Deployment**:
- Push to `master` branch → Auto deploy to production
- Preview deployments for PRs

**Cron Jobs**:
- Daily email/push reminders at 8:00 AM UTC

### Manual Deploy
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

---

## 🧪 Testing

### Test Email System
```bash
# Local
curl http://localhost:3000/api/email/test-config

# Production
curl https://captura.my/api/email/test-config
```

### Test Reminder System
```bash
curl https://captura.my/api/email/check-reminders
```

Expected response:
```json
{
  "success": true,
  "date": "2025-10-17",
  "summary": {
    "pickups": { "count": 1, "sent": 1, "ids": ["..."] },
    "returns": { "count": 0, "sent": 0, "ids": [] }
  }
}
```

### Test AI Assistant
1. Login to admin
2. Click chat bubble
3. Ask: "List all cameras"
4. Should receive formatted list with pricing

---

## 📊 Business Rules

### Pricing
- **Standard Rate**: RM50/day
- **Discount Rate**: RM45/day for 3+ days
- **Deposit**: Varies by camera

### Pickup & Return
- **Pickup Time**: After 9:30 PM (day before rental start)
- **Return Time**: By 10:00 PM (on rental end date)
- **Methods**: Shop pickup or home delivery

### Booking Status
- `pending` - Awaiting admin approval
- `confirmed` - Approved and confirmed
- `cancelled` - Cancelled by customer or admin
- `completed` - Equipment returned

---

## 🐛 Troubleshooting

### Email Not Sending
- Check Gmail app password is correct
- Verify `EMAIL_PASSWORD` in Vercel has no spaces
- Test with `/api/email/test-config`
- Check Vercel logs: `vercel logs`

### Push Notifications Not Working
- Ensure VAPID keys are set in Vercel
- Check browser permissions granted
- Verify service worker registered (DevTools → Application → Service Workers)
- Check push subscription saved in database

### AI Assistant Not Responding
- Verify `DEEPSEEK_API_KEY` is set
- Check DeepSeek account has credits
- Review Vercel function logs
- Test API directly: POST to `/api/admin/ai-assistant`

### Date/Time Issues
- Database stores dates in YYYY-MM-DD format
- Frontend parses in local timezone
- Pickup date = start_date - 1 day (via database trigger)

### Booking Conflicts
- Calendar checks for overlapping bookings
- Query: `start_date <= end_date AND end_date >= start_date`
- Toast warning shows if conflict detected

---

## 🔒 Security

- **Admin Auth**: Credential-based (stored in env vars)
- **API Protection**: Server-side validation
- **Database**: Row Level Security (RLS) on Supabase
- **Service Role**: Only used in server-side API routes
- **Environment Variables**: Never exposed to client
- **Email Credentials**: App-specific password (not account password)

---

## 📈 Future Enhancements

- [ ] Payment gateway integration (Stripe/PayPal)
- [ ] SMS notifications (Twilio)
- [ ] Multi-language support (Malay, Chinese)
- [ ] Customer login and booking history
- [ ] Equipment damage tracking
- [ ] Revenue analytics dashboard
- [ ] Advanced reporting (PDF exports)
- [ ] Inventory management for accessories
- [ ] Automated late return penalties

---

## 📞 Support & Contact

**Business Email**: captura.my@gmail.com  
**Admin Email**: haikaltdm46@gmail.com  
**Website**: [captura.my](https://captura.my)

---

## 📄 License

Proprietary - CAPTURA Camera Rental & Photography Services

---

**Built with ❤️ using Next.js 15 and React 19**
