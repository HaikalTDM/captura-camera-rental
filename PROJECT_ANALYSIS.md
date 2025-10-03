# 📸 CAPTURA - Complete Project Analysis

## 🎯 Project Overview

**CAPTURA** is a dual-service platform providing:
1. **Camera Rental Service** - Equipment rental for photographers and content creators
2. **Photography Service** - Professional photography for events, weddings, and special occasions

**Tech Stack:**
- **Frontend**: Next.js 15.5.3, React 19, TypeScript
- **Styling**: Tailwind CSS 4 with custom components and glass morphism effects
- **Database**: Supabase (PostgreSQL) with real-time features
- **Authentication**: Supabase Auth (for admin panel)
- **Deployment**: Vercel (with automatic deployments from GitHub)
- **Integrations**: WhatsApp Business API, TidyCal booking calendars

---

## 📁 Project Structure

```
captura/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── page.tsx             # Gateway page (choose rental or photography)
│   │   ├── rental/              # Camera rental public pages
│   │   ├── photography/         # Photography service public pages
│   │   ├── admin/               # Admin panel (rental management)
│   │   │   ├── page.tsx        # Dashboard
│   │   │   ├── cameras/        # Camera inventory management
│   │   │   ├── bookings/       # Booking management
│   │   │   ├── customers/      # Customer database
│   │   │   ├── accessories/    # Accessory management
│   │   │   ├── calendar/       # Rental calendar view
│   │   │   ├── reports/        # Business reports
│   │   │   └── photography/    # Photography admin section
│   │   └── api/                # API routes
│   │       ├── bookings/       # Booking operations
│   │       ├── cameras/        # Camera CRUD
│   │       ├── customers/      # Customer management
│   │       ├── calendar/       # Availability checking
│   │       ├── whatsapp/       # WhatsApp notifications
│   │       └── photography/    # Photography service APIs
│   │
│   ├── components/              # React components
│   │   ├── Navigation.tsx      # Main navigation
│   │   ├── CameraCatalog.tsx   # Camera listing
│   │   ├── CameraCard.tsx      # Individual camera card
│   │   ├── BookingForm.tsx     # Booking submission form
│   │   ├── BookingSuccess.tsx  # Success confirmation
│   │   ├── PickupDeliverySection.tsx  # Pickup/delivery info with map
│   │   ├── CustomCalendar.tsx  # Booking calendar
│   │   ├── PhotographyGallery.tsx     # Photography portfolio
│   │   └── admin/              # Admin-specific components
│   │
│   ├── lib/
│   │   ├── supabase.ts         # Supabase client & types
│   │   ├── api/                # API helper functions
│   │   │   ├── bookings.ts    # Booking operations
│   │   │   ├── website-bookings.ts  # Customer booking submissions
│   │   │   ├── photography-gallery.ts
│   │   │   └── pickup-scheduling.ts
│   │   ├── pricing.ts          # Pricing calculations
│   │   └── dateUtils.ts        # Date formatting utilities
│   │
│   ├── types/
│   │   └── index.ts            # TypeScript interfaces
│   │
│   └── utils/
│       ├── whatsapp.ts         # WhatsApp message formatting
│       └── phoneFormatter.ts   # Phone number validation
│
├── public/
│   ├── images/                 # Camera images, logos, icons
│   ├── icons/                  # PWA icons
│   └── manifest.json          # PWA manifest
│
└── database files/             # SQL schemas and migrations
```

---

## 🎨 Frontend Architecture

### 1. **Gateway Page** (`/`)
- Landing page with two service options
- Elegant card-based navigation
- Links to `/rental` or `/photography`

### 2. **Camera Rental Section** (`/rental`)

**Main Components:**
- `HeroSection` - Hero banner with CTA
- `TrustSection` - Trust badges and features
- `CameraCatalog` - Displays available cameras from database
- `PickupDeliverySection` - Interactive map and pickup/delivery info
- `Footer` - Contact information and links

**Booking Flow:**
1. Customer selects camera and dates
2. `BookingForm` collects customer details
3. Validates data client-side
4. Submits to `/api/bookings/submit`
5. Creates customer record (if new)
6. Creates booking with status `pending_approval`
7. Sends WhatsApp notification to admin
8. Shows `BookingSuccess` confirmation

**Sub-pages:**
- `/rental/equipment` - Equipment specifications
- `/rental/gallery` - Customer gallery
- `/rental/faq` - Frequently asked questions
- `/rental/how-to-book` - Booking guide
- `/rental/support` - Support information

### 3. **Photography Service** (`/photography`)

**Features:**
- Photography packages (Main & Second Shooter)
- Event types: Private Events, Tunang, Nikah, Sanding
- Mobile-optimized package carousel
- Photography gallery from database
- Custom calendar integration
- Testimonials section
- Contact form

**Sub-pages:**
- `/photography/packages` - Package details
- `/photography/gallery` - Portfolio
- `/photography/testimonials` - Client reviews
- `/photography/faq` - FAQs
- `/photography/contact` - Contact form

### 4. **Admin Panel** (`/admin`)

**Authentication Required** (Supabase Auth)

**Dashboard Features:**
- Today's pickups and returns
- Active rentals count
- Pending approvals
- Revenue statistics
- Recent bookings overview
- Equipment availability status

**Key Admin Sections:**

#### **Cameras Management** (`/admin/cameras`)
- Add/Edit/Delete cameras
- Specifications editor (JSONB)
- Image upload
- Pricing configuration
- Quantity & availability tracking
- Maintenance scheduling

#### **Bookings Management** (`/admin/bookings`)
- View all bookings (filters by status, date, source)
- Approve/Reject pending bookings
- Manual booking entry
- Bulk CSV import for historical data
- Deposit payment tracking
- Final payment tracking
- Equipment pickup/return status
- Deposit refund management

**Booking Statuses:**
- `pending_approval` - Awaiting admin approval
- `confirmed` - Approved by admin
- `rejected` - Rejected by admin
- `cancelled` - Cancelled
- `completed` - Rental completed

**Booking Sources:**
- `website` - Online bookings
- `phone` - Phone reservations
- `whatsapp` - WhatsApp bookings
- `walk-in` - In-person bookings
- `manual` - Admin-entered
- `historical` - Imported from CSV

#### **Customers Management** (`/admin/customers`)
- Customer database
- Booking history per customer
- Contact information
- Emergency contacts
- Bulk delete operations

#### **Accessories Management** (`/admin/accessories`)
- Manage accessories (batteries, memory cards, etc.)
- Link accessories to cameras
- Pricing and quantity tracking

#### **Calendar View** (`/admin/calendar`)
- Visual calendar showing all bookings
- Color-coded by status
- Camera availability overview
- Date filtering

#### **Reports** (`/admin/reports`)
- Revenue reports
- Booking statistics
- Equipment utilization
- Customer analytics

#### **Photography Admin** (`/admin/photography`)
- Photography booking management
- Gallery management (upload/delete)
- Client management
- Package configuration
- Analytics

---

## 🗄️ Database Schema (Supabase/PostgreSQL)

### **Core Tables:**

#### 1. **cameras**
```sql
- id (UUID, PK)
- name, brand, model
- type (action/mirrorless/dslr/compact)
- daily_rate, weekly_rate, monthly_rate
- deposit_amount
- description, specifications (JSONB)
- image_url
- is_available, total_quantity, available_quantity
- condition, last_maintenance, next_maintenance
- serial_number, purchase_date, warranty_expiry
- timestamps
```

#### 2. **customers**
```sql
- id (UUID, PK)
- full_name, email (unique), phone, whatsapp
- address, id_number
- emergency_contact_name, emergency_contact_phone
- timestamps
```

#### 3. **bookings**
```sql
- id (UUID, PK)
- customer_id (FK), camera_id (FK)
- start_date, end_date, total_days
- daily_rate, total_amount
- deposit_amount, deposit_paid, deposit_paid_date
- final_payment_amount, final_payment_paid, final_payment_paid_date
- status, booking_status
- pickup_method (pickup/delivery)
- pickup_address, delivery_fee
- booking_source
- approval fields (approved_by, approved_at, rejection_reason)
- whatsapp_message_sent, whatsapp_sent_at
- equipment tracking (pickup_date, equipment_picked_up, equipment_return_date, etc.)
- deposit_refund tracking
- equipment_condition (pickup/return)
- timestamps
```

#### 4. **accessories**
```sql
- id (UUID, PK)
- name, type (lens/battery/memory_card/etc.)
- brand, model, description
- daily_rate, weekly_rate, monthly_rate
- deposit_amount
- total_quantity, available_quantity
- specifications (JSONB)
- timestamps
```

#### 5. **camera_accessories** (Junction table)
```sql
- id (UUID, PK)
- camera_id (FK), accessory_id (FK)
- is_included (boolean)
- quantity
```

#### 6. **gallery_images** (Rental customer gallery)
```sql
- id (UUID, PK)
- customer_name, camera_used, location
- image_url, alt_text
- is_active, upload_date
```

#### 7. **photography_gallery** (Photography service portfolio)
```sql
- id (UUID, PK)
- title, description
- image_url, thumbnail_url
- category, tags
- is_featured, is_active
- sort_order
```

#### 8. **payment_records**
```sql
- id (UUID, PK)
- booking_id (FK)
- payment_type (deposit/final/refund)
- amount, payment_method
- payment_reference, payment_date
```

#### 9. **maintenance_records**
```sql
- id (UUID, PK)
- camera_id (FK)
- maintenance_type (cleaning/repair/inspection)
- description, cost
- maintenance_date, performed_by
```

---

## 🔄 Key Business Workflows

### **1. Customer Booking Workflow**

```
Customer selects camera & dates
    ↓
Checks availability via calendar
    ↓
Fills booking form with details
    ↓
Submits booking (API: /api/bookings/submit)
    ↓
System creates/finds customer record
    ↓
Creates booking with status: pending_approval
    ↓
Sends WhatsApp notification to admin
    ↓
Shows success confirmation with booking ID
    ↓
Admin receives notification
    ↓
Admin reviews in /admin/booking-approvals
    ↓
Admin approves/rejects
    ↓
WhatsApp sent to customer with confirmation
    ↓
Customer picks up equipment (admin marks as picked_up)
    ↓
Rental period
    ↓
Customer returns equipment (admin marks as returned)
    ↓
Admin processes deposit refund
    ↓
Booking marked as completed
```

### **2. Equipment Pickup/Return Tracking**

**Pickup Rules:**
- `pickup_date` = `start_date - 1 day`
- Customer must pick up equipment one day before rental starts
- Admin marks `equipment_picked_up = true` when completed

**Return Tracking:**
- Equipment should be returned on `end_date`
- Admin inspects condition
- Records `equipment_condition_return`
- Marks `equipment_returned = true`
- Processes deposit refund

### **3. Payment Workflow**

**Deposit (RM100 fixed):**
- Paid upfront to reserve booking
- Tracked separately from rental cost
- Refunded after equipment return (if no damage)

**Final Payment (Rental Cost):**
- Total rental amount based on days × rate
- Can be paid before pickup or after
- Admin tracks payment status

**Delivery Fee (if applicable):**
- RM50 for delivery option
- Added to final payment

---

## 🔌 API Endpoints

### **Booking APIs**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/bookings/submit` | POST | Customer booking submission |
| `/api/bookings/[id]/approve` | POST | Approve pending booking |
| `/api/bookings/[id]/reject` | POST | Reject booking |
| `/api/bookings/[id]/deposit` | POST | Mark deposit as paid |
| `/api/bookings/[id]/final-payment` | POST | Mark final payment as paid |
| `/api/bookings/[id]/pickup-status` | POST | Update pickup status |
| `/api/bookings/[id]/return-status` | POST | Update return status |
| `/api/bookings/[id]/deposit-refund` | POST | Process deposit refund |
| `/api/bookings/[id]/delete` | DELETE | Delete booking |

### **Calendar & Availability**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/calendar/availability` | GET | Check camera availability for dates |

### **WhatsApp Integration**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/whatsapp/send-booking` | POST | Send booking confirmation to customer |
| `/api/whatsapp/send-admin-notification` | POST | Notify admin of new booking |

### **Photography APIs**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/photography/gallery` | GET | Fetch gallery images |
| `/api/photography/bookings/submit` | POST | Submit photography booking |
| `/api/photography/packages` | GET | Get photography packages |

---

## 🎨 Design System

**Colors:**
- Primary: Blue (#2563eb) - Rental service
- Gold: (#d4af37) - Photography service
- Success: Green (#10b981)
- Danger: Red (#ef4444)
- Dark: Gray-900 (#111827)
- Background gradients: Glass morphism effects

**Typography:**
- Sans-serif: Geist Sans
- Monospace: Geist Mono
- Serif: Used for headings in photography section

**Components:**
- Glass morphism cards
- Gradient buttons with hover effects
- Animated transitions
- Responsive grid layouts
- Mobile-first design

---

## 📱 Special Features

### **1. Progressive Web App (PWA)**
- Installable on mobile devices
- Offline capabilities
- Push notifications (admin panel)
- Service worker for caching

### **2. WhatsApp Integration**
- Automated customer notifications
- Admin alerts for new bookings
- Direct WhatsApp booking button
- Template messages for consistency

### **3. Calendar System**
- Custom-built calendar component
- Real-time availability checking
- Multi-camera support
- Color-coded status indicators
- Date range selection

### **4. Pickup & Delivery**
- Interactive Google Maps embed
- Map/Satellite view toggle
- Direct navigation links (Google Maps, Waze)
- Delivery fee calculation
- Location details with reviews

### **5. Gallery Systems**
- **Rental Gallery**: Customer work showcase
- **Photography Gallery**: Professional portfolio
- Image optimization
- Grid and carousel layouts
- Mobile-responsive

### **6. Import/Export**
- CSV import for historical bookings
- Bulk customer import
- Export booking reports
- Data migration tools

---

## 🔐 Security & Authentication

**Admin Authentication:**
- Supabase Auth for admin panel
- Email/password login
- Session management
- Protected routes

**Row Level Security (RLS):**
- Database-level permissions
- Public read for camera catalog
- Admin-only write permissions
- Customer data protection

---

## 🚀 Deployment

**Current Setup:**
- Hosted on Vercel
- Connected to GitHub repository
- Automatic deployments on push to master
- Environment variables in Vercel dashboard
- Custom domain support

**Environment Variables Required:**
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## 📊 Key Metrics & Analytics

**Tracked Metrics:**
- Total bookings
- Revenue (daily, weekly, monthly)
- Equipment utilization rate
- Popular cameras
- Booking sources
- Customer retention
- Payment collection rate
- Overdue returns

---

## 🔧 Maintenance & Operations

**Regular Tasks:**
- Equipment maintenance tracking
- Customer follow-ups
- Payment reminders
- Deposit refund processing
- Gallery updates
- Inventory checks

**System Monitoring:**
- Database backups (Supabase automatic)
- Error logging
- Performance monitoring
- Availability uptime

---

## 📈 Future Enhancement Possibilities

1. **Automated Reminders**
   - SMS/Email reminders for pickups
   - Return date notifications
   - Payment reminders

2. **Advanced Reporting**
   - Profit/loss statements
   - Tax reports
   - Customer lifetime value
   - Equipment ROI

3. **Extended Features**
   - Multi-language support
   - Loyalty program
   - Discount codes
   - Package deals
   - Insurance integration

4. **Mobile Apps**
   - Native iOS/Android apps
   - Customer portal
   - Admin mobile app

5. **Marketing Integration**
   - Email marketing (Mailchimp)
   - Social media integration
   - SEO optimization
   - Google Analytics

---

## 🎯 Current Status

**✅ Fully Functional:**
- Camera rental booking system
- Admin panel with full CRUD
- Customer database
- Payment tracking
- WhatsApp integration
- Photography service pages
- Gallery systems
- Calendar availability
- Pickup/delivery options

**🔄 Active Development:**
- Enhanced analytics
- Advanced reporting
- Performance optimizations
- UI/UX improvements

---

## 📞 Contact & Support

**Business Contact:**
- Phone: +60 17-746 4121
- Email: captura.my@gmail.com
- Location: Kuala Lumpur, Malaysia
- Pickup: Caltex Selayang Pandang

**Technical:**
- Framework: Next.js 15.5.3
- Node Version: 20+
- Package Manager: npm

---

*Last Updated: October 2025*
*Version: 0.1.0*

