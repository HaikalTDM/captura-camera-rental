#!/usr/bin/env node

/**
 * Live Demo Script for CAPTURA
 * This script demonstrates real-time changes to the application
 */

const fs = require('fs');
const path = require('path');

const heroPath = path.join(__dirname, '../src/components/HeroSection.tsx');

const demoChanges = [
  {
    search: '🎥 Premium Camera Rental for Your Creative Vision 🎬',
    replace: '📸 Professional Camera Rental Service 🎯',
    description: 'Updated hero tagline'
  },
  {
    search: 'RM45/day</span> 🔥 Live Updates!',
    replace: 'RM45/day</span> ⚡ Real-time Changes!',
    description: 'Updated pricing text'
  },
  {
    search: 'Browse Cameras',
    replace: '🚀 Explore Cameras',
    description: 'Updated CTA button'
  }
];

let currentIndex = 0;

function applyChange() {
  if (!fs.existsSync(heroPath)) {
    console.log('❌ Hero component not found');
    return;
  }

  const content = fs.readFileSync(heroPath, 'utf8');
  const change = demoChanges[currentIndex];
  
  if (content.includes(change.search)) {
    const newContent = content.replace(change.search, change.replace);
    fs.writeFileSync(heroPath, newContent);
    console.log(`✅ ${change.description}`);
  } else {
    console.log(`⚠️  Text not found: ${change.search}`);
  }

  currentIndex = (currentIndex + 1) % demoChanges.length;
}

function startDemo() {
  console.log('🎬 Starting CAPTURA Live Demo...');
  console.log('📱 Open http://localhost:3000 to see real-time changes');
  console.log('⏱️  Changes will apply every 5 seconds');
  console.log('🛑 Press Ctrl+C to stop\n');

  // Apply changes every 5 seconds
  setInterval(applyChange, 5000);
  
  // Apply first change immediately
  setTimeout(applyChange, 1000);
}

if (require.main === module) {
  startDemo();
}

module.exports = { applyChange, startDemo };
