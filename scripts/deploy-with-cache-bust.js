#!/usr/bin/env node

/**
 * CAPTURA Deployment Script with Cache Busting
 * 
 * This script automatically updates cache versions and handles deployment
 * to prevent custom domain caching issues.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 CAPTURA Deployment with Cache Busting');
console.log('=========================================');

// Generate new cache version based on current timestamp
const newVersion = `v${Date.now()}`;
console.log(`📦 New cache version: ${newVersion}`);

// Update service worker cache version
const serviceWorkerPath = path.join(__dirname, '../public/admin-sw.js');

try {
  let serviceWorkerContent = fs.readFileSync(serviceWorkerPath, 'utf8');
  
  // Update cache version in service worker
  serviceWorkerContent = serviceWorkerContent.replace(
    /const CACHE_VERSION = '[^']+';/,
    `const CACHE_VERSION = '${newVersion}';`
  );
  
  fs.writeFileSync(serviceWorkerPath, serviceWorkerContent);
  console.log('✅ Updated service worker cache version');
  
} catch (error) {
  console.error('❌ Error updating service worker:', error.message);
  process.exit(1);
}

// Update admin manifest version
const manifestPath = path.join(__dirname, '../public/admin-manifest.json');

try {
  const manifestContent = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  manifestContent.version = newVersion;
  manifestContent.start_url = `/admin?v=${newVersion}`;
  
  fs.writeFileSync(manifestPath, JSON.stringify(manifestContent, null, 2));
  console.log('✅ Updated admin manifest version');
  
} catch (error) {
  console.error('❌ Error updating manifest:', error.message);
  process.exit(1);
}

// Build and deploy
console.log('🔨 Building application...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Git commit and push
console.log('📝 Committing changes...');
try {
  execSync('git add .', { stdio: 'inherit' });
  execSync(`git commit -m "Deploy with cache bust ${newVersion} - Fix custom domain sync"`, { stdio: 'inherit' });
  execSync('git push origin master', { stdio: 'inherit' });
  console.log('✅ Changes committed and pushed');
} catch (error) {
  console.error('❌ Git operations failed:', error.message);
  process.exit(1);
}

console.log(`
🎉 DEPLOYMENT COMPLETE!

📋 WHAT WAS DONE:
- Updated service worker cache version to ${newVersion}
- Updated admin manifest with new version
- Built application with fresh cache keys
- Committed and pushed changes to trigger Vercel deployment

🔄 NEXT STEPS FOR CUSTOM DOMAIN:
1. Wait 2-3 minutes for Vercel deployment to complete
2. Clear browser cache on custom domain (Ctrl+Shift+R)
3. If using CDN (Cloudflare, etc.), purge cache
4. Test custom domain - should now show latest updates

💡 TROUBLESHOOTING:
- If still seeing old content, run: node scripts/clear-pwa-cache.js
- Check Vercel dashboard for deployment status
- Verify custom domain DNS settings point to Vercel
`);
