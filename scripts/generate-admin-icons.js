const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Icon sizes needed for Admin PWA
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// SVG content for the CAPTURA Admin icon (blue theme)
const adminSvgContent = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <!-- Background Circle -->
  <circle cx="256" cy="256" r="240" fill="#3b82f6" stroke="#2563eb" stroke-width="8"/>
  
  <!-- Camera Body -->
  <rect x="140" y="200" width="232" height="160" rx="20" fill="#ffffff"/>
  <rect x="150" y="210" width="212" height="140" rx="15" fill="#f3f4f6"/>
  
  <!-- Camera Lens -->
  <circle cx="256" cy="280" r="60" fill="#374151"/>
  <circle cx="256" cy="280" r="45" fill="#1f2937"/>
  <circle cx="256" cy="280" r="30" fill="#111827"/>
  <circle cx="256" cy="280" r="15" fill="#000000"/>
  
  <!-- Lens Reflection -->
  <circle cx="245" cy="270" r="8" fill="#ffffff" opacity="0.6"/>
  
  <!-- Camera Flash -->
  <rect x="320" y="220" width="25" height="15" rx="3" fill="#fbbf24"/>
  
  <!-- Camera Viewfinder -->
  <rect x="200" y="220" width="30" height="20" rx="3" fill="#374151"/>
  
  <!-- Admin Badge -->
  <circle cx="380" cy="150" r="35" fill="#ef4444"/>
  <text x="380" y="160" font-family="Arial, sans-serif" font-size="24" font-weight="bold" text-anchor="middle" fill="#ffffff">A</text>
  
  <!-- ADMIN Text -->
  <text x="256" y="420" font-family="Arial, sans-serif" font-size="32" font-weight="bold" text-anchor="middle" fill="#ffffff">ADMIN</text>
  
  <!-- Decorative Elements -->
  <circle cx="180" cy="180" r="4" fill="#ffffff" opacity="0.8"/>
  <circle cx="332" cy="180" r="4" fill="#ffffff" opacity="0.8"/>
  <circle cx="180" cy="380" r="4" fill="#ffffff" opacity="0.8"/>
  <circle cx="332" cy="380" r="4" fill="#ffffff" opacity="0.8"/>
</svg>
`;

async function generateAdminIcons() {
  console.log('🎨 Generating Admin PWA icons...');
  
  try {
    // Generate admin icons for each size
    for (const size of iconSizes) {
      const outputPath = path.join(iconsDir, `admin-icon-${size}x${size}.png`);
      
      await sharp(Buffer.from(adminSvgContent))
        .resize(size, size)
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Generated admin ${size}x${size} icon`);
    }
    
    // Generate admin shortcut icons
    const shortcuts = ['bookings', 'calendar', 'customers', 'dashboard'];
    
    for (const shortcut of shortcuts) {
      await sharp(Buffer.from(adminSvgContent))
        .resize(96, 96)
        .png()
        .toFile(path.join(iconsDir, `shortcut-${shortcut}.png`));
    }
    
    console.log('✅ Generated admin shortcut icons');
    console.log('🎉 All Admin PWA icons generated successfully!');
    
  } catch (error) {
    console.error('❌ Error generating admin icons:', error);
  }
}

generateAdminIcons();
