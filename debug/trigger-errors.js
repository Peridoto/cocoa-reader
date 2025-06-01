// Test script to trigger various app functions that might generate empty error objects
// This script will test different scenarios that could produce the empty {} errors

console.log('🔍 Starting error trigger test...');

// Test 1: Storage operations
console.log('📱 Testing storage operations...');
try {
    // Test localStorage operations
    localStorage.setItem('test-key', 'test-value');
    localStorage.getItem('test-key');
    localStorage.removeItem('test-key');
    console.log('✅ localStorage operations completed');
} catch (error) {
    console.log('❌ localStorage error:', error);
    console.log('Error details:', JSON.stringify(error));
    console.log('Error keys:', Object.keys(error));
}

// Test 2: Fetch operations 
console.log('🌐 Testing network operations...');
try {
    fetch('/api/articles')
        .then(response => {
            console.log('✅ Fetch response:', response.status);
            return response.json();
        })
        .then(data => {
            console.log('✅ Fetch data received');
        })
        .catch(error => {
            console.log('❌ Fetch error:', error);
            console.log('Error details:', JSON.stringify(error));
            console.log('Error keys:', Object.keys(error));
            console.log('Error type:', typeof error);
            console.log('Error constructor:', error.constructor.name);
        });
} catch (error) {
    console.log('❌ Fetch setup error:', error);
    console.log('Error details:', JSON.stringify(error));
}

// Test 3: Service worker registration
console.log('⚙️ Testing service worker...');
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(() => {
            console.log('✅ Service worker registered');
        })
        .catch(error => {
            console.log('❌ Service worker error:', error);
            console.log('Error details:', JSON.stringify(error));
            console.log('Error keys:', Object.keys(error));
        });
}

// Test 4: Capacitor operations
console.log('📱 Testing Capacitor operations...');
if (window.Capacitor) {
    try {
        // Test basic Capacitor functionality
        console.log('Capacitor platform:', window.Capacitor.getPlatform());
        console.log('Capacitor native:', window.Capacitor.isNativePlatform());
        
        // Test Capacitor plugins
        if (window.Capacitor.Plugins) {
            console.log('Available plugins:', Object.keys(window.Capacitor.Plugins));
        }
    } catch (error) {
        console.log('❌ Capacitor error:', error);
        console.log('Error details:', JSON.stringify(error));
        console.log('Error keys:', Object.keys(error));
    }
}

// Test 5: DOM manipulation that might trigger errors
console.log('🎯 Testing DOM operations...');
try {
    const testElement = document.createElement('div');
    testElement.innerHTML = '<span>Test content</span>';
    document.body.appendChild(testElement);
    document.body.removeChild(testElement);
    console.log('✅ DOM operations completed');
} catch (error) {
    console.log('❌ DOM error:', error);
    console.log('Error details:', JSON.stringify(error));
    console.log('Error keys:', Object.keys(error));
}

// Test 6: Promise rejection handling
console.log('🔄 Testing promise rejections...');
Promise.reject(new Error('Test promise rejection'))
    .catch(error => {
        console.log('❌ Promise rejection caught:', error);
        console.log('Error details:', JSON.stringify(error));
        console.log('Error keys:', Object.keys(error));
    });

// Test 7: Async/await error handling
console.log('⏳ Testing async/await errors...');
(async () => {
    try {
        await new Promise((resolve, reject) => {
            setTimeout(() => reject(new Error('Async test error')), 100);
        });
    } catch (error) {
        console.log('❌ Async error caught:', error);
        console.log('Error details:', JSON.stringify(error));
        console.log('Error keys:', Object.keys(error));
    }
})();

console.log('🏁 Error trigger test setup complete');
