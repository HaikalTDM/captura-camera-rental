# 🎉 Canon R50 Social Media Discount System - Complete Guide

## ✅ What Was Implemented

I've added a **Social Media Discount System** specifically for the **Canon R50** camera that works in both:
1. **Admin Manual Booking** (`/admin/bookings/add`)
2. **Client Self-Booking** (`/rental/cameras`)

### **Key Features:**
- ✅ **Canon R50 Only** - Discount toggle only appears when Canon R50 is selected
- ✅ **RM5 per day discount** - Fixed discount amount
- ✅ **Admin Control** - Admins can enable/disable and customize discount amount
- ✅ **Client Self-Service** - Customers can apply discount themselves when booking online
- ✅ **Automatic Tracking** - Discount details saved in booking notes
- ✅ **Transparent Pricing** - Shows original vs discounted price
- ✅ **Proof Required** - Customers must show proof of follow/share at pickup

---

## 💰 Pricing Structure - Canon R50

### **Regular Pricing (No Discount):**
| Days | Rate | Total |
|------|------|-------|
| 1-3 days | RM60/day | RM60-180 |
| 4+ days | RM55/day | RM220+ |

### **With RM5 Social Media Discount:**
| Days | Original Rate | Discounted Rate | Total | **Savings** |
|------|---------------|-----------------|-------|-------------|
| 1 day | RM60 | RM55 | RM55 | **RM5** |
| 3 days | RM60 | RM55 | RM165 | **RM15** |
| 4 days | RM55 | RM50 | RM200 | **RM20** |
| 7 days | RM55 | RM50 | RM350 | **RM35** |

---

## 🔧 How It Works

### **1. Admin Manual Booking** (`/admin/bookings/add`)

#### **When Discount Appears:**
- Only when **Canon R50** is selected from camera dropdown
- Automatically hides for other cameras

#### **How to Apply:**

1. **Select Canon R50** from camera dropdown
2. **Purple discount section appears** below pickup method
3. **Toggle switch ON** to enable discount
4. **Customize discount amount** (default: RM5/day)
5. **See real-time price update** in Payment Summary
6. **Create booking** - Discount auto-saved in notes

#### **What Admin Sees:**

```
┌──────────────────────────────────────────────┐
│ 🎉 Social Media Discount (Canon R50 Only)   │
│ Customer shared/reposted/followed            │
│                                    [Toggle]  │
│                                              │
│ When enabled:                                │
│ ┌──────────────────────────────────────────┐ │
│ │ Discount per Day (RM)                    │ │
│ │ [  5  ]                                  │ │
│ │ 💡 Total discount: RM15                  │ │
│ └──────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘

Payment Summary:
┌──────────────────────────────────────────────┐
│ Daily Rate:                                  │
│   RM60 (strikethrough)                       │
│   RM55 ← Discounted                          │
│                                              │
│ Total Amount: RM165                          │
│ Saved RM15! ← Green text                     │
└──────────────────────────────────────────────┘
```

---

### **2. Client Self-Booking** (`/rental/cameras`)

#### **When Discount Appears:**
- Only when customer selects **Canon R50** and proceeds to booking form
- Automatically shown for Canon R50 bookings

#### **How Customers Apply:**

1. **Browse cameras** on `/rental/cameras`
2. **Click "Book Now"** on Canon R50 card
3. **Select dates** in calendar
4. **Click "Book Now"** to open booking form
5. **See purple discount section** above Special Requests
6. **Toggle switch ON** to apply RM5/day discount
7. **See updated pricing** in Payment Information
8. **Complete booking** with discounted price

#### **What Customer Sees:**

```
┌──────────────────────────────────────────────┐
│ 🎉 Get RM5 OFF per day!            [Toggle] │
│ Follow/Share our Instagram or Facebook      │
│                                              │
│ When enabled:                                │
│ ┌──────────────────────────────────────────┐ │
│ │ ✅ Discount Applied: -RM15 total         │ │
│ │ Please show proof of follow/share        │ │
│ │ when picking up                          │ │
│ └──────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘

Payment Information:
┌──────────────────────────────────────────────┐
│ Original Rate: RM60/day (strikethrough)      │
│ Discounted Rate: RM55/day 🎉                 │
│ You Save: -RM15                              │
│ ─────────────────────────────────────────    │
│ Deposit (Refundable): RM100                  │
│ Rental Amount: RM165                         │
│ ─────────────────────────────────────────    │
│ Total Due: RM265                             │
│                                              │
│ 💰 You saved RM15 with social media discount!│
└──────────────────────────────────────────────┘
```

---

## 📝 Automatic Tracking

### **Booking Notes (Auto-Generated):**

When discount is applied, this is automatically added to booking notes:

```
💰 SOCIAL MEDIA DISCOUNT APPLIED:
- Original Rate: RM60/day
- Discounted Rate: RM55/day
- Discount: RM5/day × 3 days = RM15
- Customer shared/reposted/followed our account
```

**Benefits:**
- ✅ Track which bookings got discounts
- ✅ Calculate total discounts given per month
- ✅ Verify customer claimed discount at pickup
- ✅ Generate revenue reports

---

## 🎯 Usage Scenarios

### **Scenario 1: Customer Books Online (Self-Service)**

1. **Customer sees your Instagram post**
   - "Rent Canon R50 for RM60/day"
   - "Get RM5 off per day when you follow us!"

2. **Customer follows your account**
   - Takes screenshot as proof

3. **Customer books on website**
   - Goes to `/rental/cameras`
   - Selects Canon R50
   - Chooses dates (3 days)
   - Opens booking form
   - **Toggles discount ON**
   - Sees price: RM165 (saved RM15)
   - Completes booking

4. **Customer picks up camera**
   - Shows proof of Instagram follow
   - You verify and hand over camera
   - Customer happy with discount!

---

### **Scenario 2: Admin Creates Manual Booking**

1. **Customer contacts via WhatsApp**
   - "Hi, I want to rent Canon R50 for 3 days"
   - "I just followed your Instagram!"

2. **You verify the follow**
   - Check Instagram for new follower
   - Confirm it's the customer

3. **You create manual booking**
   - Go to `/admin/bookings/add`
   - Fill in customer details
   - Select Canon R50
   - **Purple discount section appears**
   - **Toggle discount ON**
   - See price: RM165 (saved RM15)
   - Create booking

4. **Send WhatsApp confirmation**
   - Click "Send WhatsApp" button
   - Message shows discount applied
   - Customer receives confirmation

---

### **Scenario 3: Customer Shares Post**

1. **Customer shares your Facebook post**
   - Tags your page
   - Adds caption about renting

2. **Customer books online**
   - Selects Canon R50
   - **Toggles discount ON**
   - Adds note: "Shared your Facebook post"

3. **You verify at pickup**
   - Check Facebook for shared post
   - Confirm customer shared
   - Hand over camera with discount applied

---

### **Scenario 4: Customer Doesn't Follow/Share**

1. **Customer books Canon R50 online**
   - Sees discount option
   - **Leaves toggle OFF** (honest customer)
   - Pays regular price: RM180 for 3 days

2. **OR customer tries to claim discount without proof**
   - Toggles discount ON
   - Books at RM165
   - At pickup, can't show proof
   - You charge difference: RM15
   - Customer learns to be honest next time

---

## 🔒 Verification Process

### **At Pickup:**

1. **Check booking notes** for discount info
2. **Ask customer for proof:**
   - Instagram follow screenshot
   - Facebook share link
   - Story mention screenshot
   - TikTok repost link

3. **Verify proof:**
   - Check if they actually followed
   - Confirm share is public
   - Verify tag is correct

4. **If proof valid:**
   - ✅ Hand over camera
   - ✅ Thank customer for support
   - ✅ Ask them to tag you in photos

5. **If no proof:**
   - ❌ Charge difference (RM5/day × days)
   - ❌ Explain discount policy
   - ❌ Offer to apply if they follow now

---

## 📊 Revenue Tracking

### **Monthly Report Example:**

```
Month: November 2024

Canon R50 Bookings:
- Total Bookings: 15
- Bookings with Discount: 6 (40%)
- Bookings without Discount: 9 (60%)

Revenue:
- Total Revenue: RM2,475
- Total Discounts Given: RM90
- Potential Revenue (no discounts): RM2,565
- Discount Rate: 3.5%

Social Media Growth:
- New Instagram Followers: 28
- Facebook Shares: 12
- Story Mentions: 8
- TikTok Reposts: 3

ROI Analysis:
- Cost per Follower: RM3.21 (RM90 ÷ 28)
- Organic Reach: ~5,000 impressions
- Paid Ads Equivalent: RM200-300
- **Net Benefit: RM110-210 saved on marketing**
```

---

## 💡 Marketing Tips

### **1. Promote the Discount:**

**Instagram Post:**
```
📸 SPECIAL OFFER! 🎉

Rent our Canon R50 for just RM55/day!
(Regular: RM60/day)

How to get RM5 OFF per day:
✅ Follow our account
✅ Share this post to your story
✅ Tag us @captura_rental

Book now: [link]

#CameraRental #CanonR50 #Photography
```

**Facebook Post:**
```
🎥 LIMITED TIME OFFER! 🎥

Canon R50 Camera Rental
RM55/day (Save RM5/day!)

To claim discount:
1. Follow our page
2. Share this post
3. Book online or WhatsApp us

Perfect for:
✨ Weddings
✨ Events
✨ Content Creation
✨ Travel

Book now: [link]
```

---

### **2. Website Banner:**

Add to `/rental/cameras` page:
```
🎉 FOLLOW US & SAVE RM5/DAY on Canon R50 rentals!
```

---

### **3. WhatsApp Status:**

```
📸 Canon R50 Special!
Follow us = RM5 OFF per day
Book now: [link]
```

---

## ✅ Technical Implementation

### **Files Modified:**

1. **`src/app/admin/bookings/add/page.tsx`**
   - Added social media discount state
   - Added Canon R50 detection
   - Added discount toggle UI (only shows for R50)
   - Updated pricing calculation
   - Updated WhatsApp message
   - Updated booking notes

2. **`src/components/BookingForm.tsx`**
   - Added social media discount state
   - Added Canon R50 detection
   - Added discount toggle UI (only shows for R50)
   - Updated pricing calculation
   - Updated payment information display
   - Updated booking notes

### **Key Logic:**

```typescript
// Detect Canon R50
const isCanonR50 = camera.name.toLowerCase().includes('canon') 
  && camera.name.toLowerCase().includes('r50');

// Calculate discount
const discountPerDay = 5; // RM5 fixed
const discountAmount = isCanonR50 && socialMediaDiscount 
  ? discountPerDay * totalDays 
  : 0;

// Apply to pricing
const discountedTotalCost = totalCost - discountAmount;
const discountedDailyRate = isCanonR50 && socialMediaDiscount 
  ? dailyRate - discountPerDay 
  : dailyRate;
```

---

## 🎉 Summary

✅ **Canon R50 Social Media Discount System Complete!**

### **Admin Features:**
- ✅ Toggle only appears for Canon R50
- ✅ Customizable discount amount (default: RM5/day)
- ✅ Real-time price calculation
- ✅ WhatsApp message shows discount
- ✅ Booking notes track discount

### **Client Features:**
- ✅ Toggle only appears for Canon R50
- ✅ Fixed RM5/day discount
- ✅ Clear pricing breakdown
- ✅ Proof required at pickup
- ✅ Self-service application

### **Benefits:**
- 💰 **Track Revenue** - Know exactly how much discount given
- 📊 **Measure ROI** - Compare to marketing costs
- 📱 **Organic Growth** - More followers/shares
- 🎯 **Customer Incentive** - Encourages social media engagement
- 🔍 **Transparent** - Clear pricing for customers

---

**Ready to use immediately!** 🚀

Test it now:
1. **Admin**: Go to `/admin/bookings/add`, select Canon R50
2. **Client**: Go to `/rental/cameras`, book Canon R50


