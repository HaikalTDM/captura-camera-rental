# 📸 CAPTURA - Professional Camera Rental Platform

A comprehensive camera rental website with advanced admin management system, built with modern web technologies for professional camera rental businesses.

## 🌟 Features

### 🎬 **Customer-Facing Website**
- **Modern Landing Page** with professional hero section and glass morphism effects
- **Dynamic Camera Catalog** with real-time pricing and availability from database
- **Interactive Booking System** with TidyCal integration and custom calendars
- **Customer Gallery** showcasing work done with rental equipment
- **Responsive Design** optimized for all devices and screen sizes
- **WhatsApp Integration** for instant customer communication

### 🔧 **Admin Management Panel**
- **Complete Camera Management** - Add, edit, delete cameras with full specifications
- **Booking Management** - Manual booking entry, bulk CSV import, and status tracking
- **Accessory Management** - Full CRUD operations for camera accessories
- **Customer Database** - Comprehensive customer relationship management
- **Business Settings** - Configurable contact info, pricing, and policies
- **Real-Time Synchronization** - Admin changes instantly reflect on main website

### 📊 **Advanced Features**
- **Multiple Booking Sources** - Website, phone, WhatsApp, in-person tracking
- **Bulk Data Import** - CSV import for historical bookings and customers
- **Payment Tracking** - Deposit and final payment status management
- **Maintenance Scheduling** - Equipment maintenance tracking and alerts
- **Inventory Management** - Stock levels and availability monitoring

## 🛠️ Tech Stack

- **Frontend**: Next.js 15.5.3, React, TypeScript
- **Styling**: Tailwind CSS with custom components and glass morphism effects
- **Database**: Supabase (PostgreSQL) with real-time features
- **Authentication**: Supabase Auth for admin panel
- **Deployment**: Vercel with automatic deployments
- **Booking Integration**: TidyCal with custom calendar components
- **Communication**: WhatsApp Business API integration

## Getting Started

1. **Install dependencies:**
```bash
npm install
```

2. **Run the development server:**
```bash
npm run dev
```

3. **Open your browser:**
Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 🔥 Live Development with Real-time Changes

The application supports **hot reloading** - any changes you make to the code will automatically update in the browser without refreshing!

### Live Demo Mode

To see automated real-time changes:

```bash
npm run live-demo
```

This will automatically apply changes every 5 seconds to demonstrate the live updating capability.

### Development with Live Updates

```bash
npm run dev
```

- ✅ **Hot Module Replacement (HMR)** - Changes appear instantly
- ✅ **Fast Refresh** - React state is preserved during updates
- ✅ **Error Overlay** - See errors directly in the browser
- ✅ **TypeScript** - Real-time type checking

## 📅 TidyCal Integration - Inline Calendars

**✅ NEW: Each camera now has its own inline booking calendar!**

### Current Setup

Each camera card includes an **interactive demo calendar** that shows:
- ✅ **Monthly calendar view**
- ✅ **Available time slots**
- ✅ **Real-time booking summary**
- ✅ **Individual calendar per camera**

### Step 1: Get Your TidyCal Embed Code

1. Log in to your [TidyCal Dashboard](https://tidycal.com)
2. Create separate booking types for each camera:
   - `osmo-pocket-3-rental`
   - `action-5-pro-rental`
3. Copy the embed code for each:

```html
<script src="https://asset-tidycal.b-cdn.net//js/embed.js"></script>
<div id="tidycal-embed-osmo-pocket-3" data-path="your-username/osmo-pocket-3-rental"></div>
```

### Step 2: Replace Demo Calendars

1. Open `src/components/CameraCard.tsx`
2. Replace `TidyCalDemo` with `TidyCalEmbed`:

```tsx
// Replace this:
<TidyCalDemo
  cameraId={camera.id}
  cameraName={camera.name}
  className="w-full"
/>

// With this:
<TidyCalEmbed
  dataPath={`your-username/${camera.id}-rental`}
  cameraId={camera.id}
  cameraName={camera.name}
  className="w-full"
/>
<div id="tidycal-embed" data-path="your-username/camera-pickup"></div>
```

### Step 3: Create TidyCal Booking Types

For the camera rental service, consider creating these booking types:
- **Camera Pickup** - For customers to schedule equipment pickup
- **Camera Return** - For scheduling equipment returns
- **Equipment Demo** - For product demonstrations

### TidyCal Embed Options

**Option 1: Embed a specific booking type**
```html
<script src="https://asset-tidycal.b-cdn.net//js/embed.js"></script>
<div id="tidycal-embed" data-path="username/15-minute-meeting"></div>
```

**Option 2: Embed your entire booking page**
```html
<script src="https://asset-tidycal.b-cdn.net//js/embed.js"></script>
<div id="tidycal-embed" data-path="username"></div>
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main page with all components
│   └── globals.css         # Global styles
├── components/
│   ├── Navigation.tsx      # Header with mobile menu
│   ├── HeroSection.tsx     # Landing page hero
│   ├── CameraCatalog.tsx   # Camera grid display
│   ├── CameraCard.tsx      # Individual camera cards
│   ├── BookingModal.tsx    # Booking flow with TidyCal
│   ├── PricingCalculator.tsx # Dynamic pricing logic
│   ├── RentalSummary.tsx   # Booking confirmation
│   └── Footer.tsx          # Site footer
├── lib/
│   ├── cameras.ts          # Camera data
│   └── pricing.ts          # Pricing calculations
└── types/
    └── index.ts            # TypeScript interfaces
```

## Customization

### Adding New Cameras

1. Edit `src/lib/cameras.ts`
2. Add new camera objects with the required properties:
```typescript
{
  id: 'camera-id',
  name: 'Camera Name',
  description: 'Camera description',
  image: '/images/camera-image.jpg',
  dailyRate: 50,
  discountRate: 45,
  features: ['Feature 1', 'Feature 2'],
  specifications: {
    'Spec 1': 'Value 1',
    'Spec 2': 'Value 2'
  }
}
```

### Updating Pricing

Modify the pricing logic in `src/lib/pricing.ts`:
- Change discount thresholds
- Adjust discount rates
- Add seasonal pricing

### Styling

The app uses Tailwind CSS. Key design tokens:
- Primary color: Blue (blue-600)
- Success color: Green (green-600)
- Text: Gray scale (gray-900 to gray-400)
- Responsive breakpoints: sm, md, lg, xl

## Production Deployment

### Environment Setup

1. **Add camera images** to `public/images/`
2. **Configure TidyCal** embed codes
3. **Set up analytics** (Google Analytics, etc.)
4. **Configure SEO** metadata in `layout.tsx`

### 🚀 Live Deployment Options

#### Deploy to Vercel (Recommended)

1. **Quick Deploy:**
```bash
npm run deploy:vercel
```

2. **Or via GitHub:**
   - Push to GitHub repository
   - Connect to [Vercel](https://vercel.com)
   - Automatic deployments on every push

#### Deploy to Netlify

1. **Quick Deploy:**
```bash
npm run deploy:netlify
```

2. **Or via Git:**
   - Connect your repository to [Netlify](https://netlify.com)
   - Automatic builds and deployments

#### Other Platforms

- **AWS Amplify**: Connect GitHub repository for automatic deployments
- **DigitalOcean App Platform**: Deploy directly from GitHub
- **Railway**: One-click deployment from repository
- **Render**: Automatic deployments with zero config

### 🌐 Live Demo URLs

Once deployed, your live application will be available at:
- **Vercel**: `https://your-app.vercel.app`
- **Netlify**: `https://your-app.netlify.app`

All deployments include:
- ✅ **Automatic HTTPS**
- ✅ **Global CDN**
- ✅ **Automatic deployments**
- ✅ **Preview deployments** for pull requests

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TidyCal Help](https://help.tidycal.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
