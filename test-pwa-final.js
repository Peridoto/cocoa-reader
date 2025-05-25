#!/usr/bin/env node

const http = require('http');

console.log('🥥 Cocoa Reader PWA Final Test');
console.log('===============================');

// Test basic server response
function testServer() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3000', (res) => {
      console.log('✅ Server responding on port 3000');
      resolve(true);
    });
    req.on('error', () => {
      console.log('❌ Server not responding');
      resolve(false);
    });
    req.setTimeout(5000, () => {
      console.log('❌ Server timeout');
      resolve(false);
    });
  });
}

// Test manifest
function testManifest() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3000/manifest.json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const manifest = JSON.parse(data);
          if (manifest.name && manifest.name.includes('Cocoa Reader')) {
            console.log('✅ PWA Manifest is valid and accessible');
            console.log(`   Name: ${manifest.name}`);
            console.log(`   Start URL: ${manifest.start_url}`);
            console.log(`   Display: ${manifest.display}`);
            resolve(true);
          } else {
            console.log('❌ PWA Manifest missing required fields');
            resolve(false);
          }
        } catch (e) {
          console.log('❌ PWA Manifest is not valid JSON');
          resolve(false);
        }
      });
    });
    req.on('error', () => {
      console.log('❌ PWA Manifest not accessible');
      resolve(false);
    });
  });
}

// Test service worker
function testServiceWorker() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3000/sw.js', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (data.includes('CACHE_NAME') && data.includes('addEventListener')) {
          console.log('✅ Service Worker is accessible and valid');
          resolve(true);
        } else {
          console.log('❌ Service Worker missing required content');
          resolve(false);
        }
      });
    });
    req.on('error', () => {
      console.log('❌ Service Worker not accessible');
      resolve(false);
    });
  });
}

async function runTests() {
  console.log('\n🔍 Testing PWA Components...\n');
  
  const serverOk = await testServer();
  if (!serverOk) {
    console.log('\n❌ Server test failed. Please ensure the dev server is running.');
    return;
  }
  
  const manifestOk = await testManifest();
  const swOk = await testServiceWorker();
  
  console.log('\n📱 PWA Status Summary:');
  console.log('======================');
  console.log(`Server: ${serverOk ? '✅' : '❌'}`);
  console.log(`Manifest: ${manifestOk ? '✅' : '❌'}`);
  console.log(`Service Worker: ${swOk ? '✅' : '❌'}`);
  
  if (serverOk && manifestOk && swOk) {
    console.log('\n🎉 PWA is ready!');
    console.log('\n📋 Manual Tests to Complete:');
    console.log('1. Open Chrome DevTools');
    console.log('2. Go to Application > Service Workers');
    console.log('3. Go to Application > Manifest');
    console.log('4. Test adding an article');
    console.log('5. Test offline mode (Network > Offline)');
    console.log('6. Look for install button in address bar');
  } else {
    console.log('\n⚠️  Some PWA components need attention');
  }
}

runTests().catch(console.error);
