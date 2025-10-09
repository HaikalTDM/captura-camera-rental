# 📧 Customer Email System

## Overview

Customers now receive **automatic email notifications** from `captura.my@gmail.com` at key stages of their booking journey.

---

## 📬 Email Types

### 1. **Thank You Email** 🎉
**Sent:** Immediately after booking submission  
**To:** Customer email  
**Subject:** `🎉 Booking Confirmed - Thank You for Choosing Captura!`

**Contains:**
- Booking confirmation
- Booking ID
- Camera details
- Rental period
- Total amount
- Pickup date
- Pickup location with map links
- What to bring (ID, deposit)
- What's next steps

---

### 2. **Pickup Reminder Email** 📦
**Sent:** 
- **1 day before pickup** (via daily cron at 8 AM)
- **Immediately** if booking and pickup are same day

**To:** Customer email  
**Subject:** `📦 Reminder: Camera Pickup Tomorrow - [Camera Name]`

**Contains:**
- Pickup date highlighted
- What to bring checklist
- Pickup location with Google Maps & Waze links
- Booking details
- Contact information

---

### 3. **Return Reminder Email** 🔙
**Sent:** On return date at 8 AM  
**To:** Customer email  
**Subject:** `🔙 Return Reminder: Camera Due Today by 10 PM - [Camera Name]`

**Contains:**
- **10 PM deadline** prominently displayed
- Return checklist (check condition, pack accessories, format card)
- Return location with map links
- Deposit refund information
- Late return warning

---

## ⏰ Automated Schedule

| Event | Timing | Email Sent |
|-------|--------|------------|
| Customer books | Immediately | ✅ Thank You Email |
| Same-day booking | Immediately | ✅ Thank You + Pickup Reminder |
| 1 day before pickup | 8:00 AM daily | ✅ Pickup Reminder |
| Return date | 8:00 AM | ✅ Return Reminder (10 PM deadline) |

---

## 🎨 Email Design

All emails feature:
- **Beautiful gradient headers** (different color per type)
- Professional HTML formatting
- Mobile-responsive design
- Clear call-to-action buttons
- Google Maps & Waze navigation buttons
- Captura branding and footer
- Contact information

**Color Themes:**
- Thank You: Purple gradient
- Pickup: Green gradient
- Return: Orange gradient

---

## 🔄 How It Works

### Booking Flow:
```
1. Customer submits booking
   ↓
2. System creates booking in database
   ↓
3. Thank you email sent immediately
   ↓
4. IF pickup is today:
      → Pickup reminder sent immediately
   ELSE:
      → Pickup reminder sent 1 day before
   ↓
5. On return date at 8 AM:
      → Return reminder sent (10 PM deadline)
```

### Daily Cron (8 AM):
```
1. Check pickups scheduled for today
   ↓
2. Send pickup reminders to customers
   ↓
3. Send pickup reminders to admin
   ↓
4. Check returns due today
   ↓
5. Send return reminders to customers (10 PM deadline)
   ↓
6. Send return reminders to admin
```

---

## 📝 Email Content Examples

### Thank You Email Key Points:
- Warm welcome message
- Complete booking details table
- "What's Next?" step-by-step guide
- Important reminders (bring ID)
- Pickup location details
- Contact information

### Pickup Reminder Key Points:
- "Your camera is ready for pickup!"
- **"Pickup after 9:30 PM"** (prominent)
- "What to Bring" checklist:
  - Valid ID
  - RM100 deposit
  - Booking confirmation
- Map links to location
- Contact to confirm exact pickup time

### Return Reminder Key Points:
- "**Return by 10:00 PM Tonight**" (prominent)
- Before you return checklist:
  - Check equipment condition
  - Pack all accessories
  - Format memory card
  - Bring to location
- Deposit refund information
- Late return warning

---

## 🔧 Technical Implementation

### Files Modified:
```
src/lib/email/emailService.ts
  └── Added:
      - sendCustomerThankYouEmail()
      - sendCustomerPickupReminder()
      - sendCustomerReturnReminder()

src/app/api/bookings/submit/route.ts
  └── Sends thank you email after booking
  └── Sends immediate pickup reminder if same-day

src/app/api/email/check-reminders/route.ts
  └── Sends customer pickup reminders
  └── Sends customer return reminders
  └── Sends admin reminders
```

### Email Data Structure:
```typescript
{
  bookingId: string,
  customerName: string,
  cameraName: string,
  phone: string,
  email: string,        // Customer email
  pickupDate?: string,
  returnDate?: string,
  startDate?: string,
  endDate?: string,
  totalAmount?: number
}
```

---

## ✅ Features

### **Immediate Emails:**
- ✅ Thank you email sent right after booking
- ✅ Pickup reminder sent immediately for same-day bookings

### **Scheduled Emails:**
- ✅ Pickup reminders sent 1 day before
- ✅ Return reminders sent on return date at 8 AM

### **Smart Logic:**
- ✅ Detects same-day bookings
- ✅ Sends pickup reminder immediately if needed
- ✅ Return reminder mentions 10 PM deadline
- ✅ Includes Google Maps & Waze links
- ✅ Professional HTML design
- ✅ Mobile-responsive

---

## 📍 Pickup Location (All Emails)

**Caltex Selayang Pandang**  
Lot 1, 2, Batu 8, Jalan Rawang  
Selayang Pandang, 68100 Batu Caves  
Selangor, Malaysia

**Map Links Included:**
- Google Maps (direct navigation)
- Waze (direct navigation)

---

## 🔐 Security & Privacy

- Emails sent via secure Gmail SMTP
- Customer emails only go to customer
- Admin emails only go to admin
- No sensitive data in subject lines
- Professional sender: "Captura Camera Rental"

---

## 📊 Email Tracking

All emails log to console:
```
✅ Thank you email sent to customer: customer@email.com
✅ Pickup reminder sent to customer: customer@email.com
✅ Return reminder sent to customer: customer@email.com
```

Check Vercel logs to verify emails were sent.

---

## 🎯 Benefits

### For Customers:
- ✅ Instant booking confirmation
- ✅ Clear pickup instructions
- ✅ Return deadline reminder
- ✅ Easy navigation to location
- ✅ Professional experience

### For Admin:
- ✅ Less customer inquiries
- ✅ Fewer missed pickups
- ✅ On-time returns
- ✅ Professional brand image
- ✅ Automated customer service

---

## 🧪 Testing

### Test Customer Emails:
1. Make a test booking on your site
2. Check customer email for thank you email
3. Check if pickup reminder is sent (if same day)

### Test Scheduled Emails:
Visit: `https://your-domain.vercel.app/api/email/check-reminders`

---

## 📋 Checklist

Before going live:
- [ ] Gmail App Password configured
- [ ] Environment variables set
- [ ] Test booking creates thank you email
- [ ] Test same-day booking sends pickup reminder
- [ ] Verify cron sends daily reminders
- [ ] Check customer receives emails
- [ ] Test all map links work
- [ ] Verify 10 PM mentioned in return email

---

## 🎉 Result

Customers now receive:
1. **Thank You** - Right after booking
2. **Pickup Reminder** - 1 day before (or same day)
3. **Return Reminder** - On return date with 10 PM deadline

All emails are **professional, beautiful, and helpful**! 📧✨

