const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Your logo should be placed at: public/icons/logo-source.png
const sourceImage = path.join(__dirname, '../public/icons/logo-source.png');
const outputDir = path.join(__dirname, '../public/icons');

// Icon sizes needed for PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcons() {
  console.log('🎨 Starting PWA icon generation...\n');

  if (!fs.existsSync(sourceImage)) {
    console.error('❌ Error: logo-source.png not found in public/icons/');
    console.log('📝 Please save your logo as: public/icons/logo-source.png');
    process.exit(1);
  }

  try {
    // Get original image dimensions
    const metadata = await sharp(sourceImage).metadata();
    console.log(`📏 Source image: ${metadata.width}x${metadata.height}px\n`);

    // Generate each size
    for (const size of sizes) {
      const outputPath = path.join(outputDir, `admin-icon-${size}x${size}.png`);
      
      await sharp(sourceImage)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 } // White background
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Generated: admin-icon-${size}x${size}.png`);
    }

    console.log('\n🎉 All PWA icons generated successfully!');
    console.log('📱 Your PWA will now use the new logo when installed.\n');

  } catch (error) {
    console.error('❌ Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();

