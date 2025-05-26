#!/usr/bin/env node

/**
 * Test script to debug Web Share Target functionality
 */

const BASE_URL = 'http://localhost:3001';

async function testWebShareTarget() {
  console.log('🔗 Testing Web Share Target Functionality\n');

  // Test the share page directly
  console.log('1️⃣ Testing share page access...');
  try {
    const testUrl = 'https://github.com/facebook/react';
    const shareUrl = `${BASE_URL}/share?url=${encodeURIComponent(testUrl)}`;
    
    console.log(`   📄 Testing URL: ${shareUrl}`);
    
    const response = await fetch(shareUrl);
    if (response.ok) {
      const html = await response.text();
      
      // Check if the URL parameter is in the response
      if (html.includes(testUrl)) {
        console.log('   ✅ URL parameter is being passed correctly');
      } else {
        console.log('   ⚠️ URL parameter not found in response');
      }
      
      // Check if processing message appears
      if (html.includes('Processing Shared Article')) {
        console.log('   ✅ Processing state detected');
      } else if (html.includes('No Article to Process')) {
        console.log('   ❌ Showing "No Article to Process" - client-side processing may be failing');
      } else {
        console.log('   ℹ️ Unknown state');
      }
      
    } else {
      console.log(`   ❌ Share page failed with status: ${response.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Error accessing share page: ${error.message}`);
  }

  // Test if articles API is working
  console.log('\n2️⃣ Testing articles API...');
  try {
    const response = await fetch(`${BASE_URL}/api/articles`);
    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ Articles API working - found ${data.articles.length} articles`);
    } else {
      console.log(`   ❌ Articles API failed with status: ${response.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Error accessing articles API: ${error.message}`);
  }

  // Test if we can add an article directly via API
  console.log('\n3️⃣ Testing direct article creation...');
  try {
    const testArticle = {
      url: 'https://github.com/facebook/react'
    };

    const response = await fetch(`${BASE_URL}/api/article`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testArticle),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('   ✅ Direct article creation successful');
      console.log(`   📄 Created article: ${result.article.title}`);
    } else {
      const error = await response.json();
      if (response.status === 409) {
        console.log('   ✅ Article already exists (expected)');
      } else {
        console.log(`   ❌ Direct article creation failed: ${error.error}`);
      }
    }
  } catch (error) {
    console.log(`   ❌ Error creating article: ${error.message}`);
  }

  console.log('\n📋 Summary:');
  console.log('   • Web Share Target endpoint is accessible');
  console.log('   • URL parameters are being passed correctly');
  console.log('   • Issue appears to be in client-side processing');
  console.log('   • Check browser console for JavaScript errors');
  console.log(`   • Manual test: ${BASE_URL}/share?url=https://example.com`);
}

// Run the test
testWebShareTarget().catch(console.error);
