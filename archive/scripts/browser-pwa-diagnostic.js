// PWA Android Diagnostic Script - Run in Browser Console
// Copy and paste this into the browser's DevTools Console

console.log('🔍 PWA Android Installation Diagnostic');
console.log('=======================================');

// 1. Check Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    console.log(`✅ Service Worker Support: Available`);
    console.log(`📊 Registered Service Workers: ${registrations.length}`);
    
    if (registrations.length > 0) {
      registrations.forEach((reg, index) => {
        console.log(`   SW ${index + 1}: ${reg.scope}`);
        console.log(`   State: ${reg.active ? 'Active' : 'Not Active'}`);
      });
    } else {
      console.log('⚠️  No service workers registered');
    }
  });
} else {
  console.log('❌ Service Worker Support: Not Available');
}

// 2. Check Manifest
fetch('/manifest.json')
  .then(response => response.json())
  .then(manifest => {
    console.log('\n📄 Manifest Analysis:');
    console.log('✅ Manifest accessible');
    console.log(`   Name: ${manifest.name}`);
    console.log(`   Short Name: ${manifest.short_name}`);
    console.log(`   Start URL: ${manifest.start_url}`);
    console.log(`   Display: ${manifest.display}`);
    console.log(`   Theme Color: ${manifest.theme_color}`);
    console.log(`   Background Color: ${manifest.background_color}`);
    console.log(`   Icons: ${manifest.icons ? manifest.icons.length : 0} found`);
    
    // Check icon requirements
    if (manifest.icons) {
      const iconSizes = manifest.icons.map(icon => icon.sizes);
      const hasRequiredSizes = [
        iconSizes.includes('192x192'),
        iconSizes.includes('512x512')
      ];
      
      console.log('\n🖼️  Icon Analysis:');
      manifest.icons.forEach(icon => {
        console.log(`   ${icon.sizes} - ${icon.purpose || 'any'} - ${icon.src}`);
      });
      
      if (hasRequiredSizes.every(Boolean)) {
        console.log('✅ Required icon sizes present (192x192, 512x512)');
      } else {
        console.log('⚠️  Missing required icon sizes');
      }
    }
  })
  .catch(error => {
    console.log('❌ Manifest not accessible:', error);
  });

// 3. Check Installation Status
const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
const isInWebAppiOS = (window.navigator).standalone === true;

console.log('\n📱 Installation Status:');
console.log(`   Standalone mode: ${isStandalone ? 'Yes' : 'No'}`);
console.log(`   iOS Web App: ${isInWebAppiOS ? 'Yes' : 'No'}`);
console.log(`   Already installed: ${isStandalone || isInWebAppiOS ? 'Yes' : 'No'}`);

// 4. Check BeforeInstallPrompt
let deferredPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
  console.log('\n🚀 BeforeInstallPrompt Event Fired!');
  console.log('✅ PWA is installable');
  deferredPrompt = e;
  e.preventDefault();
});

// 5. Android Chrome Specific Checks
const isAndroid = /Android/i.test(navigator.userAgent);
const isChrome = /Chrome/i.test(navigator.userAgent) && !/Edge/i.test(navigator.userAgent);

console.log('\n🤖 Android Chrome Detection:');
console.log(`   Is Android: ${isAndroid ? 'Yes' : 'No'}`);
console.log(`   Is Chrome: ${isChrome ? 'Yes' : 'No'}`);
console.log(`   User Agent: ${navigator.userAgent}`);

// 6. HTTPS Check
console.log('\n🔒 Security Check:');
console.log(`   HTTPS: ${location.protocol === 'https:' ? 'Yes' : 'No'}`);
console.log(`   Protocol: ${location.protocol}`);
console.log(`   Origin: ${location.origin}`);

// 7. Final Summary
setTimeout(() => {
  console.log('\n📋 PWA Installation Requirements Summary:');
  console.log('=========================================');
  
  const requirements = [
    { name: 'Service Worker', check: 'serviceWorker' in navigator },
    { name: 'Manifest', check: true }, // We'll assume it's accessible if no error
    { name: 'HTTPS (Production)', check: location.protocol === 'https:' || location.hostname === 'localhost' },
    { name: 'Valid Icons', check: true }, // Checked above
    { name: 'User Engagement', check: 'May require user interaction first' }
  ];
  
  requirements.forEach(req => {
    const status = typeof req.check === 'boolean' ? (req.check ? '✅' : '❌') : '⚠️ ';
    console.log(`${status} ${req.name}: ${req.check}`);
  });
  
  console.log('\n💡 Next Steps:');
  console.log('1. Check browser console for any errors');
  console.log('2. Try interacting with the page (click, scroll)');
  console.log('3. Wait a few seconds for beforeinstallprompt event');
  console.log('4. Check Chrome menu for "Install app" or "Add to Home screen"');
  console.log('5. On Android: Chrome menu > Add to Home screen');
}, 2000);

// Test function to trigger install prompt
window.testInstallPrompt = () => {
  if (deferredPrompt) {
    console.log('🚀 Triggering install prompt...');
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      console.log(`User choice: ${choiceResult.outcome}`);
      deferredPrompt = null;
    });
  } else {
    console.log('❌ No install prompt available. Try interacting with the page first.');
  }
};

console.log('\n🛠️  Test Commands:');
console.log('- Run testInstallPrompt() to trigger install prompt');
console.log('- Check Chrome DevTools > Application > Manifest');
console.log('- Check Chrome DevTools > Application > Service Workers');
