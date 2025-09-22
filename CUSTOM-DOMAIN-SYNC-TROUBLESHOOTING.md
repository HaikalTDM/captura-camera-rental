# CAPTURA Custom Domain Sync Troubleshooting Guide

## 🎯 **ISSUE RESOLVED - IMMEDIATE ACTIONS**

The custom domain caching issue has been **FIXED** with deployment `026f8ad`. Here's what to do now:

### ✅ **IMMEDIATE STEPS (Do These Now):**

1. **Clear Browser Cache on Custom Domain:**
   ```
   - Hold Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Or open custom domain in incognito/private mode
   ```

2. **Clear PWA Service Worker Cache:**
   ```
   - Open custom domain in browser
   - Press F12 (Developer Tools)
   - Go to Application tab > Storage
   - Click "Clear storage" button
   - Refresh page
   ```

3. **If Using CDN (Cloudflare, etc.):**
   ```
   - Log into your CDN dashboard
   - Find "Purge Cache" or "Clear Cache" option
   - Purge all cache for your domain
   ```

---

## 🔧 **WHAT WAS FIXED**

### **Root Cause Identified:**
- PWA Service Worker was using **cache-first strategy**
- Aggressive caching was serving outdated content on custom domain
- Cache version wasn't updating between deployments

### **Technical Fixes Applied:**
- ✅ **Updated cache version** to `v1758517386159` (timestamp-based)
- ✅ **Changed to network-first strategy** for fresh content
- ✅ **Enhanced cache cleanup** on service worker activation
- ✅ **Added automatic cache busting** for future deployments

---

## 🚀 **VERIFICATION STEPS**

### **Test Both URLs:**
1. **Vercel URL:** https://captura-camera-rental.vercel.app/admin
2. **Your Custom Domain:** [Your custom domain]/admin

### **What to Look For:**
- ✅ Both should show identical content
- ✅ Mobile horizontal scrolling should be fixed
- ✅ PWA install prompt should work
- ✅ Admin dashboard should be fully responsive

---

## 🛠️ **IF STILL SEEING ISSUES**

### **Advanced Cache Clearing:**

1. **Manual Service Worker Reset:**
   ```javascript
   // Open browser console on custom domain and run:
   navigator.serviceWorker.getRegistrations().then(function(registrations) {
     for(let registration of registrations) {
       registration.unregister();
     }
   });
   // Then refresh the page
   ```

2. **Clear All Browser Data:**
   ```
   - Chrome: Settings > Privacy > Clear browsing data
   - Firefox: Settings > Privacy > Clear Data
   - Safari: Develop > Empty Caches
   ```

3. **Mobile Device Cache:**
   ```
   - Uninstall PWA app if installed
   - Clear browser cache and data
   - Force-close browser app
   - Reopen and test
   ```

### **Run Cache Clearing Script:**
```bash
node scripts/clear-pwa-cache.js
```

---

## 🔍 **DIAGNOSTIC COMMANDS**

### **Check Deployment Status:**
```bash
# Verify latest commit is deployed
git log --oneline -1

# Check if Vercel URL has latest changes
curl -I https://captura-camera-rental.vercel.app/admin-sw.js
```

### **Compare Domain Headers:**
```bash
# Check Vercel URL
curl -I https://captura-camera-rental.vercel.app/admin

# Check Custom Domain (replace with your domain)
curl -I https://your-custom-domain.com/admin
```

---

## 🚨 **EMERGENCY DEPLOYMENT**

If you need to force an immediate cache refresh:

```bash
# Run the automated deployment script
node scripts/deploy-with-cache-bust.js
```

This will:
- Generate new cache version
- Update service worker
- Build and deploy
- Force cache invalidation

---

## 📱 **PWA SPECIFIC FIXES**

### **Service Worker Issues:**
- Cache version updated to timestamp-based system
- Network-first strategy ensures fresh content
- Automatic cleanup of old caches

### **Manifest Updates:**
- Admin manifest version synchronized
- Start URL includes cache-busting parameter
- PWA installation will use fresh cache

---

## 🔮 **PREVENTION FOR FUTURE**

### **Automated Cache Busting:**
- Service worker version auto-updates on deployment
- Timestamp-based cache keys prevent stale content
- Network-first strategy prioritizes fresh data

### **Deployment Best Practices:**
```bash
# Always use the cache-busting deployment script
node scripts/deploy-with-cache-bust.js

# Or manually update cache version before deploying
# Edit public/admin-sw.js and increment CACHE_VERSION
```

---

## 📞 **SUPPORT CHECKLIST**

If issues persist, check:
- [ ] Cleared browser cache with Ctrl+Shift+R
- [ ] Cleared PWA service worker cache
- [ ] Tested in incognito/private mode
- [ ] Purged CDN cache (if applicable)
- [ ] Verified DNS points to Vercel
- [ ] Checked Vercel deployment status
- [ ] Ran cache clearing script

---

## ✅ **SUCCESS INDICATORS**

You'll know it's working when:
- ✅ Custom domain shows same content as Vercel URL
- ✅ No horizontal scrolling on mobile
- ✅ PWA features work correctly
- ✅ Admin dashboard is fully responsive
- ✅ Service worker console shows new cache version

**The fix is deployed and ready - just clear your caches!** 🎉
