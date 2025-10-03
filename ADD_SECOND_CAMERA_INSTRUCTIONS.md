# Adding DJI Osmo Pocket 3 (ii) to Your Inventory

You now have **2 methods** to add the second Osmo Pocket 3 camera:

---

## Method 1: Using SQL Script (Recommended - Fastest)

### Step 1: Open Supabase SQL Editor

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your **captura** project
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Run the SQL Script

Copy and paste the contents of `add-second-osmo-pocket-3.sql` into the SQL editor and click **Run**.

The script will:
- ✅ Add "DJI Osmo Pocket 3 (ii)" to your cameras table
- ✅ Set it as available with quantity = 1
- ✅ Use the same image as the original Osmo Pocket 3
- ✅ Give it the same pricing structure
- ✅ Create a unique ID (automatic)

### Step 3: Verify the Camera

After running the script, you can verify by:

```sql
SELECT id, name, brand, model, is_available, available_quantity 
FROM cameras 
WHERE name LIKE '%Osmo Pocket 3%'
ORDER BY name;
```

You should see both cameras listed.

---

## Method 2: Using Admin Panel (Manual Entry)

### Step 1: Login to Admin Panel

1. Navigate to `http://localhost:3000/admin/login` (or your production URL)
2. Login with your admin credentials

### Step 2: Add New Camera

1. Go to **Cameras** section (`/admin/cameras`)
2. Click **Add New Camera** button
3. Fill in the form:

**Basic Information:**
- **Name**: `DJI Osmo Pocket 3 (ii)`
- **Brand**: `DJI`
- **Model**: `Osmo Pocket 3`
- **Type**: `action`

**Pricing:**
- **Daily Rate**: `50` (RM50 for 1-2 days)
- **Weekly Rate**: `315` (RM45/day for 3+ days, 7 days = RM315)
- **Monthly Rate**: `1350` (RM45/day for 30 days)
- **Deposit Amount**: `100`

**Description:**
```
Professional compact camera with gimbal stabilization. Perfect for vlogging, content creation, and professional video production.
```

**Specifications (JSON):**
```json
{
  "Sensor": "1/1.3-inch CMOS, 9.4MP",
  "Video Resolution": "4K/120fps, 1080p/240fps",
  "Stabilization": "3-axis mechanical gimbal",
  "Screen": "2-inch rotatable touchscreen",
  "Battery Life": "Up to 166 minutes (4K/24fps)",
  "Storage": "Supports microSD up to 512GB",
  "Weight": "179g",
  "Special Features": "ActiveTrack 6.0, Face Tracking, Time-lapse, Slow Motion"
}
```

**Inventory:**
- **Image URL**: `/images/osmo-pocket-31.jpg`
- **Is Available**: ✅ Yes
- **Total Quantity**: `1`
- **Available Quantity**: `1`
- **Condition**: `excellent`
- **Location**: `Selayang`

4. Click **Save** or **Create Camera**

---

## How It Works After Adding

### ✅ Client Site (Rental Page)

Once added, the camera will **automatically appear** on:
- `/rental` - Main rental page
- Camera catalog section
- Each camera will have its own:
  - ✅ Booking calendar
  - ✅ Availability tracking
  - ✅ Separate booking management

**The system automatically:**
- Fetches all available cameras from database
- Shows them in the catalog
- Each camera has independent availability
- Uses the same images (as specified)

### ✅ Admin Site

The new camera will appear in:
- `/admin/cameras` - Camera management list
- `/admin/calendar` - Calendar view (with separate tracking)
- `/admin/bookings` - When creating bookings, you can select either camera

**Independent Tracking:**
- Each camera tracks its own bookings
- Separate availability calendars
- Individual maintenance records
- Separate booking history

---

## Verifying the Camera is Live

### On Client Site:

1. Visit `http://localhost:3000/rental`
2. Scroll to the **Available Cameras** section
3. You should see **2 Osmo Pocket 3 cameras**:
   - DJI Osmo Pocket 3
   - DJI Osmo Pocket 3 (ii)

### On Admin Site:

1. Visit `http://localhost:3000/admin/cameras`
2. You should see both cameras in the list
3. Click on each to view/edit details

---

## Calendar & Booking Differences

### Separate Calendars:
- Each camera has its own unique ID
- Bookings are tracked separately by `camera_id`
- Customer can book **both cameras** for the same dates if needed
- Each camera shows independent availability

### TidyCal Integration:
- Each camera will have its own TidyCal path based on its unique ID
- Format: `haikaltdm46/{camera-id}`

---

## Managing Two Osmo Pocket 3 Cameras

### Inventory Tracking:
- **Camera 1**: DJI Osmo Pocket 3
- **Camera 2**: DJI Osmo Pocket 3 (ii)

### Best Practices:
1. **Serial Numbers**: Add unique serial numbers to differentiate physical units
2. **Condition Tracking**: Track condition separately for each
3. **Maintenance**: Schedule maintenance independently
4. **Booking Notes**: Admins can specify which physical unit was rented

### In Admin Panel:
```
/admin/cameras → Shows both cameras
/admin/bookings → Can assign bookings to either camera
/admin/calendar → Shows availability for both separately
```

---

## Troubleshooting

### Camera Not Showing on Client Site?

Check:
1. **Is Available**: Must be `true`
2. **Available Quantity**: Must be > 0
3. **Browser Cache**: Hard refresh (`Ctrl + Shift + R`)
4. **Database**: Verify camera exists in Supabase

### Camera Shows Same Bookings?

- Each camera has a unique `id`
- Bookings are linked by `camera_id`
- If they share bookings, the `camera_id` in bookings table might be incorrect

### Images Not Loading?

- Both cameras use `/images/osmo-pocket-31.jpg`
- Check that the image exists in `public/images/`
- The image mapping is in `CameraCatalog.tsx` (already configured for Osmo Pocket names)

---

## Next Steps

1. ✅ Add the camera using Method 1 or Method 2
2. ✅ Verify it appears on `/rental`
3. ✅ Test booking each camera separately
4. ✅ Check calendar availability for both
5. ✅ Update quantity tracking if needed

---

**Note**: The system is designed to handle unlimited cameras. You can add as many Osmo Pocket 3 units as you have in inventory by repeating this process with different names like "(iii)", "(iv)", etc.

