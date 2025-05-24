#!/usr/bin/env node

// Simple test to check AI processing
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testSimpleAPI() {
  console.log('🧪 Simple AI Processing Test\n');
  
  try {
    // Test basic health check
    console.log('1. Testing health check...');
    const healthResponse = await fetch(`${BASE_URL}/api/test-ai`);
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('   ✅ Health check passed:', healthData.result.processed);
    } else {
      console.log('   ❌ Health check failed');
      return;
    }
    
    // Get articles to see what we have
    console.log('\n2. Getting articles...');
    const articlesResponse = await fetch(`${BASE_URL}/api/articles`);
    if (articlesResponse.ok) {
      const articlesData = await articlesResponse.json();
      console.log(`   ✅ Found ${articlesData.articles.length} articles`);
      
      const unprocessed = articlesData.articles.filter(a => !a.aiProcessed);
      console.log(`   📊 Unprocessed articles: ${unprocessed.length}`);
      
      if (unprocessed.length > 0) {
        const testArticle = unprocessed[0];
        console.log(`   🎯 Test article: "${testArticle.title.slice(0, 50)}..."`);
        
        // Test single article processing
        console.log('\n3. Testing single article processing...');
        const processResponse = await fetch(`${BASE_URL}/api/articles/process-v2`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ articleId: testArticle.id })
        });
        
        if (processResponse.ok) {
          const processData = await processResponse.json();
          console.log('   ✅ Single processing result:', processData);
        } else {
          console.log('   ❌ Single processing failed:', processResponse.status);
        }
        
        // Test batch processing
        console.log('\n4. Testing batch processing...');
        const batchResponse = await fetch(`${BASE_URL}/api/articles/process-v2?batchSize=5`);
        if (batchResponse.ok) {
          const batchData = await batchResponse.json();
          console.log('   ✅ Batch processing result:', batchData);
        } else {
          console.log('   ❌ Batch processing failed:', batchResponse.status);
        }
        
      } else {
        console.log('   ℹ️  No unprocessed articles to test with');
      }
    } else {
      console.log('   ❌ Failed to fetch articles');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSimpleAPI();
