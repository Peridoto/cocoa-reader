// PWA Android Installation Diagnostic Script
// Run this in the browser console on Android Chrome

console.log('🔍 PWA Android Installation Diagnostic');
console.log('=======================================');

// Check if service worker is registered
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    console.log('✅ Service Worker API available');
    console.log(`📊 Registered service workers: ${registrations.length}`);
    registrations.forEach((reg, index) => {
      console.log(`   ${index + 1}. Scope: ${reg.scope}`);
      console.log(`      State: ${reg.active ? reg.active.state : 'no active worker'}`);
    });
  });
} else {
  console.log('❌ Service Worker API not available');
}

// Check manifest
fetch('/manifest.json')
  .then(response => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  })
  .then(manifest => {
    console.log('✅ Manifest accessible');
    console.log('📋 Manifest details:');
    console.log(`   Name: ${manifest.name}`);
    console.log(`   Short name: ${manifest.short_name}`);
    console.log(`   Start URL: ${manifest.start_url}`);
    console.log(`   Display: ${manifest.display}`);
    console.log(`   Theme color: ${manifest.theme_color}`);
    console.log(`   Icons: ${manifest.icons ? manifest.icons.length : 0}`);
    
    // Check icons
    if (manifest.icons && manifest.icons.length > 0) {
      console.log('🖼️ Icon details:');
      manifest.icons.forEach((icon, index) => {
        console.log(`   ${index + 1}. ${icon.src} (${icon.sizes}) - Purpose: ${icon.purpose || 'any'}`);
        
        // Test if icon is accessible
        fetch(icon.src)
          .then(iconResponse => {
            if (iconResponse.ok) {
              console.log(`   ✅ Icon ${icon.src} accessible`);
            } else {
              console.log(`   ❌ Icon ${icon.src} not accessible (${iconResponse.status})`);
            }
          })
          .catch(err => {
            console.log(`   ❌ Icon ${icon.src} failed to load: ${err.message}`);
          });
      });
    } else {
      console.log('❌ No icons defined in manifest');
    }
  })
  .catch(err => {
    console.log(`❌ Manifest not accessible: ${err.message}`);
  });

// Check PWA install criteria
console.log('🎯 PWA Installation Criteria Check:');

// Check if running on HTTPS (required for PWA)
if (location.protocol === 'https:' || location.hostname === 'localhost') {
  console.log('✅ Secure context (HTTPS or localhost)');
} else {
  console.log('❌ Not a secure context - PWA requires HTTPS');
}

// Check if it's already installed
if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
  console.log('✅ Already running as installed PWA');
} else {
  console.log('📱 Running in browser mode');
}

// Check beforeinstallprompt event
let installPromptAvailable = false;
window.addEventListener('beforeinstallprompt', (e) => {
  installPromptAvailable = true;
  console.log('✅ beforeinstallprompt event fired - PWA installable!');
});

// Wait a moment and check if prompt was triggered
setTimeout(() => {
  if (!installPromptAvailable) {
    console.log('❌ beforeinstallprompt event not fired');
    console.log('💡 Possible reasons:');
    console.log('   - PWA already installed');
    console.log('   - Manifest issues');
    console.log('   - Service worker not registered');
    console.log('   - Icons missing or invalid');
    console.log('   - Not meeting PWA criteria');
  }
}, 2000);

// Additional Android Chrome specific checks
console.log('🤖 Android Chrome Specific Checks:');
console.log(`   User Agent: ${navigator.userAgent}`);
console.log(`   Platform: ${navigator.platform}`);
console.log(`   Touch support: ${navigator.maxTouchPoints > 0 ? 'Yes' : 'No'}`);

// Check viewport meta tag
const viewport = document.querySelector('meta[name="viewport"]');
if (viewport) {
  console.log(`✅ Viewport meta tag: ${viewport.content}`);
} else {
  console.log('❌ Missing viewport meta tag');
}

// Check manifest link
const manifestLink = document.querySelector('link[rel="manifest"]');
if (manifestLink) {
  console.log(`✅ Manifest link: ${manifestLink.href}`);
} else {
  console.log('❌ Missing manifest link in HTML');
}

console.log('=======================================');
console.log('📝 To fix PWA installation issues:');
console.log('1. Ensure all icons are accessible');
console.log('2. Check service worker registration');
console.log('3. Verify manifest is valid JSON');
console.log('4. Test on HTTPS domain');
console.log('5. Clear browser cache and try again');
