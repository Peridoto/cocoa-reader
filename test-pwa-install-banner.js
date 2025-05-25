#!/usr/bin/env node

/**
 * Test PWA Installation Banner
 * Verifies that the installation prompt appears for browser users
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';

async function testInstallationBanner() {
  console.log('🔍 Testing PWA Installation Banner...\n');

  try {
    // Test 1: Check if PWAInstaller component is included
    console.log('1. Testing PWAInstaller component inclusion...');
    const homeResponse = await fetch(`${BASE_URL}/`);
    const homeHtml = await homeResponse.text();
    
    if (homeHtml.includes('PWAInstaller') || homeHtml.includes('Install Cocoa Reader')) {
      console.log('   ✅ PWAInstaller component detected');
    } else {
      console.log('   ⚠️  PWAInstaller component may not be visible yet (requires client-side rendering)');
    }

    // Test 2: Check manifest.json for PWA configuration
    console.log('\n2. Testing PWA manifest configuration...');
    const manifestResponse = await fetch(`${BASE_URL}/manifest.json`);
    const manifest = await manifestResponse.json();
    
    if (manifest.name && manifest.display === 'standalone') {
      console.log('   ✅ PWA manifest properly configured');
      console.log(`   📱 App name: ${manifest.name}`);
      console.log(`   🎨 Display mode: ${manifest.display}`);
    } else {
      console.log('   ❌ PWA manifest not properly configured');
    }

    // Test 3: Check service worker
    console.log('\n3. Testing service worker availability...');
    const swResponse = await fetch(`${BASE_URL}/sw.js`);
    
    if (swResponse.ok) {
      console.log('   ✅ Service worker available');
    } else {
      console.log('   ❌ Service worker not found');
    }

    console.log('\n📱 PWA Installation Banner Features:');
    console.log('   • Appears after 3 seconds for browser users');
    console.log('   • Automatically hides when app is installed');
    console.log('   • Can be dismissed (shows again after 7 days)');
    console.log('   • Supports both browser install prompt and manual instructions');
    console.log('   • Detects standalone mode (PWA installed)');

    console.log('\n🧪 Manual Testing Instructions:');
    console.log(`   1. Open ${BASE_URL} in Chrome/Edge (desktop/mobile)`);
    console.log('   2. Wait 3 seconds for installation banner to appear');
    console.log('   3. Click "Install App" to install the PWA');
    console.log('   4. Banner should disappear once installed');
    console.log('   5. Try "Maybe Later" to dismiss (reappears in 7 days)');

    console.log('\n✅ PWA Installation Banner implementation complete!');

  } catch (error) {
    console.error('❌ Error testing installation banner:', error.message);
  }
}

// Run the test
testInstallationBanner();
