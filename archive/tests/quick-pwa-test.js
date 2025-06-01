// Quick PWA Browser Test
// Run this in the browser console at http://localhost:3002

console.log('🥥 Cocoa Reader PWA Quick Test');
console.log('=================================');

// Test 1: Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistration().then(registration => {
        if (registration) {
            console.log('✅ Service Worker registered:', registration.scope);
        } else {
            console.log('❌ Service Worker not found');
        }
    });
} else {
    console.log('❌ Service Worker not supported');
}

// Test 2: Manifest
fetch('/manifest.json')
    .then(response => response.json())
    .then(manifest => {
        console.log('✅ Manifest loaded:', manifest.name);
    })
    .catch(error => {
        console.log('❌ Manifest error:', error.message);
    });

// Test 3: Local Database
try {
    const dbRequest = indexedDB.open('cocoa-reader-db', 1);
    dbRequest.onsuccess = () => {
        console.log('✅ IndexedDB accessible');
        dbRequest.result.close();
    };
    dbRequest.onerror = () => {
        console.log('❌ IndexedDB error');
    };
} catch (error) {
    console.log('❌ IndexedDB not supported');
}

// Test 4: PWA Install Prompt
if ('BeforeInstallPromptEvent' in window) {
    console.log('✅ PWA install supported');
} else {
    console.log('⚠️ PWA install prompt not available (may still be installable)');
}

// Test 5: Offline Detection
console.log('🌐 Network status:', navigator.onLine ? 'Online' : 'Offline');

setTimeout(() => {
    console.log('=================================');
    console.log('🎯 PWA test completed! Check results above.');
    console.log('💡 Try: Go to DevTools > Application tab to see PWA details');
}, 1000);
