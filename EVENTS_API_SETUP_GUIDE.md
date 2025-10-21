# 🔌 EVENTS API SETUP GUIDE

## 📁 **FILE STRUCTURE**

```
src/
├── lib/
│   ├── api/
│   │   ├── bookings.ts                ← Existing
│   │   ├── events.ts                  ← NEW: Events CRUD
│   │   └── externalEvents.ts          ← NEW: External API integration
│   └── supabase.ts                    ← Existing
```

---

## 🗄️ **DATABASE SETUP**

### **Step 1: Create Events Table in Supabase**

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Run the SQL from `database-events-schema.sql`
4. This will:
   - ✅ Create `events` table
   - ✅ Add indexes for performance
   - ✅ Set up Row Level Security
   - ✅ Insert 13 sample Malaysian events

---

## 🔧 **USING THE EVENTS API**

### **Import in your components:**

```typescript
import { getAllEvents, getUpcomingEvents, getEventsByCategory } from '@/lib/api/events';

// In your component
const events = await getAllEvents();
const upcomingEvents = await getUpcomingEvents();
const holidays = await getEventsByCategory('holiday');
```

### **Update Events Page to use database:**

```typescript
// src/app/rental/events/page.tsx

import { getAllEvents } from '@/lib/api/events';

useEffect(() => {
  loadEvents();
}, []);

const loadEvents = async () => {
  try {
    const data = await getAllEvents();
    setEvents(data);
  } catch (error) {
    console.error('Error loading events:', error);
  }
};
```

---

## 🌐 **EXTERNAL API INTEGRATION (OPTIONAL)**

### **Step 1: Get API Keys**

#### **Eventbrite (Recommended):**
1. Sign up: https://www.eventbrite.com/platform/
2. Create an app
3. Get your OAuth token
4. **Free tier:** 50 requests/day
5. **Good for:** Concerts, festivals, local events

#### **Ticketmaster:**
1. Sign up: https://developer.ticketmaster.com/
2. Create an app
3. Get API key
4. **Free tier:** 5000 requests/day
5. **Good for:** Concerts, sports, theater

#### **SeatGeek:**
1. Sign up: https://seatgeek.com/
2. Get client ID
3. **Free tier:** Available
4. **Good for:** Sports, concerts

---

### **Step 2: Add to .env.local**

Create `.env.local` file (if it doesn't exist):

```bash
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# External Event APIs (Optional)
NEXT_PUBLIC_EVENTBRITE_TOKEN=your_token_here
NEXT_PUBLIC_TICKETMASTER_KEY=your_key_here
NEXT_PUBLIC_SEATGEEK_CLIENT_ID=your_client_id_here
```

---

### **Step 3: Use External APIs**

```typescript
import { fetchEventbriteEvents, fetchAllExternalEvents } from '@/lib/api/externalEvents';

// Fetch from Eventbrite
const liveEvents = await fetchEventbriteEvents('Kuala Lumpur');

// Or fetch from all sources
const allExternalEvents = await fetchAllExternalEvents();
```

---

## 🎯 **RECOMMENDED APPROACH**

### **Phase 1: Use Database (Current)**
✅ Already set up with sample data
✅ Fast and reliable
✅ Full control
✅ No API limits

**Current implementation in `/rental/events` already works!**

---

### **Phase 2: Add External APIs (Optional)**

**When to use:**
- Want live concert/sports data
- Need automatic event updates
- Building larger event platform

**How to integrate:**

```typescript
// src/app/rental/events/page.tsx

const loadEvents = async () => {
  try {
    // Get curated events from database
    const curatedEvents = await getAllEvents();
    
    // Optionally add live events
    const liveEvents = await fetchEventbriteEvents('Kuala Lumpur');
    
    // Combine both
    const allEvents = [...curatedEvents, ...liveEvents];
    setEvents(allEvents);
  } catch (error) {
    console.error('Error loading events:', error);
  }
};
```

---

## 📊 **ADMIN MANAGEMENT (Future)**

Create admin panel to manage events:

```typescript
import { addEvent, updateEvent, deleteEvent, toggleEventStatus } from '@/lib/api/events';

// Add new event
await addEvent({
  title: 'F1 Singapore Grand Prix',
  date: '2025-09-21',
  category: 'sports',
  demand: 'peak',
  // ... other fields
});

// Update event
await updateEvent('event-id', { 
  special_offer: '20% off!' 
});

// Toggle active/inactive
await toggleEventStatus('event-id', false);

// Delete event
await deleteEvent('event-id');
```

---

## 🚀 **QUICK START**

### **1. Database Approach (Easiest):**

```bash
# 1. Run SQL in Supabase
database-events-schema.sql

# 2. Update Events page
# Replace static data with:
const events = await getAllEvents();

# Done! ✅
```

### **2. External API Approach (Advanced):**

```bash
# 1. Get API keys from:
- Eventbrite.com/platform
- developer.ticketmaster.com

# 2. Add to .env.local
NEXT_PUBLIC_EVENTBRITE_TOKEN=xxx

# 3. Use in component
const liveEvents = await fetchEventbriteEvents();

# Done! ✅
```

---

## 🎯 **CURRENT STATUS**

✅ **Files created:**
- `src/lib/api/events.ts` - Database functions
- `src/lib/api/externalEvents.ts` - External APIs
- `database-events-schema.sql` - Database schema

✅ **Events page:**
- Currently using static data
- Ready to connect to database
- Ready to integrate external APIs

✅ **Next step:**
- Run SQL in Supabase
- OR add external API keys
- OR keep static data (works fine!)

---

## 💡 **RECOMMENDATION**

**For your stage (15+ customers):**

1. **Start with database** (run SQL schema)
2. **Keep it simple** (manual curation)
3. **Add external APIs later** when you need live events

**Why:**
- ✅ Full control over content
- ✅ No API costs
- ✅ Fast performance
- ✅ Easy to update
- ✅ No rate limits

---

**Questions? Let me know!** 🚀

