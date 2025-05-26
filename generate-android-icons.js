#!/usr/bin/env node

/**
 * Generate all required PWA icons for Android Chrome compatibility
 */

const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

// Icon sizes required for optimal Android Chrome PWA support
const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

// Cocoa Reader brand colors
const BACKGROUND_COLOR = '#9333ea'; // Purple theme
const TEXT_COLOR = '#ffffff';

async function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Clear canvas
  ctx.fillStyle = BACKGROUND_COLOR;
  ctx.fillRect(0, 0, size, size);
  
  // Calculate text size based on icon size
  const fontSize = Math.floor(size * 0.6);
  ctx.fillStyle = TEXT_COLOR;
  ctx.font = `bold ${fontSize}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Draw coconut emoji or "CR" text
  const text = '🥥';
  try {
    // Try to draw emoji
    ctx.fillText(text, size / 2, size / 2);
  } catch (error) {
    // Fallback to "CR" text if emoji fails
    ctx.fillText('CR', size / 2, size / 2);
  }
  
  return canvas;
}

async function generateAllIcons() {
  console.log('🎨 Generating PWA icons for Android Chrome compatibility...\n');
  
  const publicDir = path.join(__dirname, 'public');
  
  // Ensure public directory exists
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  for (const size of ICON_SIZES) {
    try {
      console.log(`📱 Generating ${size}x${size} icon...`);
      
      const canvas = await generateIcon(size);
      const buffer = canvas.toBuffer('image/png');
      
      const filename = `icon-${size}.png`;
      const filepath = path.join(publicDir, filename);
      
      fs.writeFileSync(filepath, buffer);
      console.log(`   ✅ Generated ${filename}`);
      
    } catch (error) {
      console.error(`   ❌ Failed to generate ${size}x${size} icon:`, error.message);
    }
  }
  
  console.log('\n🎉 Icon generation complete!');
  console.log('\n📋 Generated icons:');
  ICON_SIZES.forEach(size => {
    console.log(`   • icon-${size}.png (${size}x${size})`);
  });
  
  console.log('\n📱 Android Chrome PWA Installation Tips:');
  console.log('   1. Clear browser cache and data');
  console.log('   2. Visit the app on HTTPS');
  console.log('   3. Look for "Add to Home Screen" in Chrome menu');
  console.log('   4. Ensure you meet user engagement requirements');
  console.log('   5. Check that service worker is registered');
}

// Check if canvas is available
try {
  require('canvas');
  generateAllIcons().catch(console.error);
} catch (error) {
  console.log('⚠️  Canvas module not available. Generating icons with basic method...\n');
  
  // Fallback: Copy existing icons to create missing sizes
  const publicDir = path.join(__dirname, 'public');
  const sourceIcon = path.join(publicDir, 'icon-192.png');
  
  if (fs.existsSync(sourceIcon)) {
    ICON_SIZES.forEach(size => {
      if (size !== 192 && size !== 512) {
        const targetIcon = path.join(publicDir, `icon-${size}.png`);
        if (!fs.existsSync(targetIcon)) {
          fs.copyFileSync(sourceIcon, targetIcon);
          console.log(`📱 Copied icon-${size}.png`);
        }
      }
    });
    console.log('\n✅ Icon generation complete (using existing 192px icon)');
  } else {
    console.log('❌ No source icon found. Please ensure icon-192.png exists.');
  }
}
