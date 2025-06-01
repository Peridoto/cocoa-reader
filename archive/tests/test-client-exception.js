#!/usr/bin/env node

// Test script to trigger client-side exceptions and verify debugging
console.log('🔍 Testing Client-Side Exception Detection');
console.log('==========================================');

const testUrl = 'http://localhost:3001';

// Test different scenarios that might trigger client-side exceptions
const testScenarios = [
  {
    name: 'Main Page Load',
    url: 'http://localhost:3001',
    description: 'Test basic page load for any client-side exceptions'
  },
  {
    name: 'Add Article Form',
    url: 'http://localhost:3001',
    description: 'Test article addition which might trigger the exception'
  },
  {
    name: 'Error Simulation',
    url: 'http://localhost:3001/error-simulation.js',
    description: 'Test error simulation script'
  },
  {
    name: 'Debug Test Page',
    url: 'file:///Users/pc/Documents/Escritorio/github/cocoa-readerweb/debug-test.html',
    description: 'Test standalone debug page'
  },
  {
    name: 'Share Handler',
    url: 'http://localhost:3001/share?url=https://example.com&title=Test',
    description: 'Test web share target which might trigger exceptions'
  }
];

async function testClientExceptionDetection() {
  console.log('🧪 Starting client-side exception detection tests...\n');

  for (const scenario of testScenarios) {
    console.log(`📋 Test: ${scenario.name}`);
    console.log(`🔗 URL: ${scenario.url}`);
    console.log(`📝 Description: ${scenario.description}`);
    
    try {
      // Use fetch to test if the endpoint is accessible
      if (scenario.url.startsWith('http://localhost:3001')) {
        const response = await fetch(scenario.url);
        if (response.ok) {
          console.log('   ✅ Page accessible');
          
          // Check if it's HTML content
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('text/html')) {
            const html = await response.text();
            
            // Check for error-related indicators in the HTML
            const errorIndicators = [
              'ComprehensiveErrorDebugger',
              'IOSSandboxErrorHandler',
              'client-side exception',
              'error-debugger',
              'sandbox extension',
              'TO JS undefined'
            ];
            
            const foundIndicators = errorIndicators.filter(indicator => 
              html.toLowerCase().includes(indicator.toLowerCase())
            );
            
            if (foundIndicators.length > 0) {
              console.log('   🔍 Found debugging components:', foundIndicators.join(', '));
            }
            
            // Check for any pre-existing error messages
            if (html.includes('client-side exception') || html.includes('error')) {
              console.log('   ⚠️  May contain error indicators');
            }
          }
        } else {
          console.log(`   ❌ Page not accessible: ${response.status}`);
        }
      } else {
        console.log('   ℹ️  External/file URL - skipping fetch test');
      }
    } catch (error) {
      console.log(`   ❌ Test failed: ${error.message}`);
    }
    
    console.log('');
  }

  console.log('🎯 Manual Testing Instructions:');
  console.log('==============================');
  console.log('1. Open browser to http://localhost:3001');
  console.log('2. Open browser dev tools (F12)');
  console.log('3. Check Console for error messages');
  console.log('4. Look for red error banner at top of page');
  console.log('5. Try adding an article to trigger potential exceptions');
  console.log('6. Check for "client-side exception has occurred" messages');
  console.log('7. Use error simulation: http://localhost:3001/error-simulation.js');
  console.log('8. Use debug test page: file:///Users/pc/Documents/Escritorio/github/cocoa-readerweb/debug-test.html');

  console.log('\n🔧 Debugging Components Active:');
  console.log('- ComprehensiveErrorDebugger: Real-time error capture');
  console.log('- IOSSandboxErrorHandler: iOS-specific error handling');
  console.log('- IOSErrorMonitor: Advanced error monitoring');
  console.log('- SplashScreenHandler: Enhanced error handling');

  console.log('\n💡 What to Look For:');
  console.log('- JavaScript errors in browser console');
  console.log('- Red error banners at top of page');
  console.log('- "sandbox extension" error messages');
  console.log('- "TO JS undefined" messages');
  console.log('- Plugin-related errors');
  console.log('- Network request failures');

  console.log('\n🚀 Next Steps:');
  console.log('1. Run this script: node test-client-exception.js');
  console.log('2. Open browser and test manually');
  console.log('3. Trigger various actions to reproduce the exception');
  console.log('4. Export debug info using window.__errorDebugger.getErrors()');
  console.log('5. Analyze captured errors to identify root cause');
}

// Check if server is running first
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3001');
    return response.ok;
  } catch {
    return false;
  }
}

async function main() {
  console.log('🔍 Checking if development server is running...');
  
  const serverRunning = await checkServer();
  if (!serverRunning) {
    console.log('❌ Development server is not running');
    console.log('📋 Please start the server first:');
    console.log('   npm run dev');
    console.log('   # or');
    console.log('   ./start-cocoa-reader.sh\n');
    process.exit(1);
  }
  
  console.log('✅ Server is running\n');
  await testClientExceptionDetection();
}

main().catch(console.error);
