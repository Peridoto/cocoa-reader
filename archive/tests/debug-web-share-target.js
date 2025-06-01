// Test script to debug Web Share Target parameters
const http = require('http');

const testUrls = [
  'http://localhost:3003/share?url=https://example.com',
  'http://localhost:3003/share?url=https%3A//example.com',
  'http://localhost:3003/share?url=https://example.com&title=Test',
  'http://localhost:3003/share?url=https%3A//example.com&title=Test%20Article',
  'http://localhost:3003/share',
  'http://localhost:3003/share?title=Only%20Title',
  'http://localhost:3003/share?text=Only%20Text'
];

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    console.log(`\n🔍 Testing: ${url}`);
    
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const hasNoArticle = data.includes('No Article to Process') || data.includes('No URL was shared');
        const hasProcessing = data.includes('Processing') || data.includes('Saving article');
        const hasError = data.includes('Error') || data.includes('Failed');
        
        console.log(`   Status: ${res.statusCode}`);
        console.log(`   No Article Message: ${hasNoArticle ? '❌ YES' : '✅ NO'}`);
        console.log(`   Processing Started: ${hasProcessing ? '✅ YES' : '❌ NO'}`);
        console.log(`   Has Error: ${hasError ? '❌ YES' : '✅ NO'}`);
        
        resolve({ statusCode: res.statusCode, hasNoArticle, hasProcessing, hasError });
      });
    }).on('error', (err) => {
      console.log(`   ❌ Request failed: ${err.message}`);
      reject(err);
    });
  });
}

async function debugWebShareTarget() {
  console.log('🔬 Web Share Target Debug Test');
  console.log('===============================');
  
  try {
    for (const url of testUrls) {
      await makeRequest(url);
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay
    }
    
    console.log('\n📋 Test Summary:');
    console.log('================');
    console.log('✅ If any test shows "Processing Started: YES", Web Share Target is working');
    console.log('❌ If all tests show "No Article Message: YES", there\'s an issue with URL processing');
    console.log('\n💡 Next Steps:');
    console.log('- Check browser console for JavaScript errors when sharing');
    console.log('- Verify the PWA is installed properly in Chrome');
    console.log('- Test the manifest.json share_target configuration');
    
  } catch (error) {
    console.error('❌ Debug test failed:', error.message);
  }
}

debugWebShareTarget();
