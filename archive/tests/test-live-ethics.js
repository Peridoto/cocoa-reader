#!/usr/bin/env node

/**
 * Live Web Ethics Testing Script
 * Tests the actual web ethics compliance with real URLs
 */

const fetch = require('node:fetch');

async function testWebEthicsCompliance() {
  console.log('🤖 Testing Cocoa Reader Web Ethics Compliance\n');
  
  const baseUrl = 'http://localhost:3000';
  
  // Test URLs with different ethical considerations
  const testUrls = [
    // Should work - most news sites allow archiving
    'https://example.com',
    
    // Test with a URL that has robots.txt
    'https://www.github.com',
    
    // Test URL normalization
    'example.com/test-article',
    
    // Test invalid URL handling
    'not-a-valid-url'
  ];
  
  console.log('Testing article creation with various URLs:\n');
  
  for (const url of testUrls) {
    console.log(`📝 Testing URL: ${url}`);
    console.log('─'.repeat(50));
    
    try {
      const response = await fetch(`${baseUrl}/api/article`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        console.log('✅ Article saved successfully');
        if (result.ethicsInfo) {
          console.log(`   Ethics check: ${result.ethicsInfo.allowed ? '✅ Allowed' : '❌ Blocked'}`);
          if (result.ethicsInfo.reason) {
            console.log(`   Reason: ${result.ethicsInfo.reason}`);
          }
        }
        console.log(`   Title: ${result.title || 'N/A'}`);
        console.log(`   Domain: ${result.domain || 'N/A'}`);
      } else {
        console.log(`❌ Failed: ${result.error || 'Unknown error'}`);
        if (result.ethicsInfo && !result.ethicsInfo.allowed) {
          console.log(`   🛡️  Blocked by ethics compliance: ${result.ethicsInfo.reason}`);
        }
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    
    console.log('');
  }
  
  // Test getting articles
  console.log('📋 Fetching saved articles:');
  console.log('─'.repeat(50));
  
  try {
    const response = await fetch(`${baseUrl}/api/articles`);
    const articles = await response.json();
    
    if (response.ok) {
      console.log(`✅ Found ${articles.length} articles`);
      articles.slice(0, 3).forEach((article, index) => {
        console.log(`   ${index + 1}. ${article.title} (${article.domain})`);
      });
    } else {
      console.log('❌ Failed to fetch articles');
    }
  } catch (error) {
    console.log(`❌ Error fetching articles: ${error.message}`);
  }
  
  console.log('\n✨ Web ethics compliance testing complete!');
  console.log('\n📖 Key Features Demonstrated:');
  console.log('   • URL normalization (auto-adding https://)');
  console.log('   • Web ethics compliance checking');
  console.log('   • robots.txt respect');
  console.log('   • Error handling for invalid URLs');
  console.log('   • Article extraction and storage');
}

// Only run if this script is executed directly
if (require.main === module) {
  testWebEthicsCompliance().catch(console.error);
}

module.exports = { testWebEthicsCompliance };
