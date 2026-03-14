# 🔑 **URGENT: .env.local Recovery Guide**

## ⚠️ **Your Environment Variables Were Lost!**

When you added the Eventbrite API, the `.env.local` file was overwritten and all your other API keys were lost.

---

## ✅ **WHAT YOU NEED TO DO NOW**

### **Step 1: Create a New `.env.local` File**

Create a file called `.env.local` in the **root directory** of your project (same folder as `package.json`).

---

### **Step 2: Add ALL These Variables**

Copy and paste this **entire content** into your `.env.local` file:

```env
# ==================================
# SUPABASE (REQUIRED - App won't work without these!)
# ==================================
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# ==================================
# SITE CONFIGURATION
# ==================================
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# ==================================
# WHATSAPP
# ==================================
NEXT_PUBLIC_WHATSAPP_BUSINESS_NUMBER=+60177464121

# ==================================
# PUSH NOTIFICATIONS (Optional)
# ==================================
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key_here

# ==================================
# EXTERNAL EVENT APIs (Optional - Events page will work without these)
# ==================================
NEXT_PUBLIC_EVENTBRITE_TOKEN=your_eventbrite_token_here
NEXT_PUBLIC_TICKETMASTER_KEY=your_ticketmaster_key_here
NEXT_PUBLIC_SEATGEEK_CLIENT_ID=your_seatgeek_client_id_here
```

---

### **Step 3: Fill in YOUR Actual Values**

#### **🚨 MOST IMPORTANT: Supabase Keys** (App won't work without these!)

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Replace these values:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=(paste the "anon public" key)
   SUPABASE_SERVICE_ROLE_KEY=(paste the "service_role" key)
   ```

#### **Optional: External Event APIs**

These are **optional** - your app will work fine without them:
- **Eventbrite**: https://www.eventbrite.com/platform/
- **Ticketmaster**: https://developer.ticketmaster.com/
- **SeatGeek**: https://seatgeek.com/

---

## 🔍 **How to Check if It's Working**

### **After you create `.env.local` with your Supabase keys:**

1. **Restart your dev server:**
   ```bash
   # Stop the current server (Ctrl+C)
   # Then start it again:
   npm run dev
   ```

2. **Check the console for errors:**
   - No errors = ✅ Working!
   - "Supabase" errors = ❌ Check your Supabase keys

---

## 📁 **Where to Create the File**

```
Your project structure:
├── src/
├── public/
├── package.json
├── .env.local        ← CREATE THIS FILE HERE!
└── ...
```

---

## 🎯 **Quick Checklist**

- [ ] Created `.env.local` in root directory
- [ ] Added **all** environment variables (copy the full template above)
- [ ] Replaced Supabase URLs and keys with your actual values
- [ ] Restarted your dev server
- [ ] App is working without errors

---

## 💡 **Pro Tips**

### **Never Overwrite `.env.local` Again!**

When adding a new API key:
1. **OPEN** the existing `.env.local` file
2. **ADD** the new line at the bottom
3. **DON'T** create a new file from scratch

### **Backup Your Keys**

Store your API keys somewhere safe (password manager, secure notes) so you can recover them if this happens again.

---

## ⚠️ **Security Warning**

**NEVER:**
- ❌ Commit `.env.local` to Git
- ❌ Share your Supabase Service Role Key publicly
- ❌ Post your API keys in screenshots

**The `.env.local` file is already in `.gitignore` - keep it that way!**

---

## 🆘 **Still Having Issues?**

If your app still doesn't work after adding the Supabase keys:

1. Check for typos in the keys
2. Make sure there are no extra spaces
3. Verify the Supabase URL ends with `.supabase.co`
4. Restart your dev server completely
5. Check the browser console for specific errors

---

**Remember:** The Supabase keys are the most critical! Everything else is optional.

Get those working first, then worry about the external event APIs later.


