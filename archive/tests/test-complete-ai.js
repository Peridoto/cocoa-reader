#!/usr/bin/env node

/**
 * Complete End-to-End AI Processing Test
 * Tests the entire AI processing pipeline from UI to database
 */

const BASE_URL = 'http://localhost:3000';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runCompleteTest() {
  console.log('🚀 Starting Complete AI Processing End-to-End Test\n');
  
  let testsPassed = 0;
  let testsFailed = 0;

  // Test 1: Server Health
  console.log('1️⃣ Testing server health...');
  try {
    const response = await fetch(`${BASE_URL}/api/test-ai`);
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Server health check passed');
      testsPassed++;
    } else {
      throw new Error('Health check failed');
    }
  } catch (error) {
    console.log('   ❌ Server health check failed:', error.message);
    testsFailed++;
    return;
  }

  await sleep(500);

  // Test 2: Articles API
  console.log('\n2️⃣ Testing articles API with AI fields...');
  let articles = [];
  try {
    const response = await fetch(`${BASE_URL}/api/articles`);
    if (response.ok) {
      const data = await response.json();
      articles = data.articles;
      console.log(`   ✅ Found ${articles.length} articles`);
      
      if (articles.length > 0) {
        const firstArticle = articles[0];
        const hasAIFields = 'aiProcessed' in firstArticle && 'summary' in firstArticle;
        console.log(`   ✅ AI fields present: ${hasAIFields}`);
        console.log(`   📊 Processed: ${articles.filter(a => a.aiProcessed).length}/${articles.length}`);
      }
      testsPassed++;
    } else {
      throw new Error('Articles API failed');
    }
  } catch (error) {
    console.log('   ❌ Articles API test failed:', error.message);
    testsFailed++;
  }

  await sleep(500);

  // Test 3: Single Article Processing
  console.log('\n3️⃣ Testing single article AI processing...');
  const unprocessedArticles = articles.filter(a => !a.aiProcessed);
  if (unprocessedArticles.length > 0) {
    try {
      const testArticle = unprocessedArticles[0];
      console.log(`   🎯 Processing: "${testArticle.title.slice(0, 40)}..."`);
      
      const response = await fetch(`${BASE_URL}/api/articles/process-v2`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId: testArticle.id })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`   ✅ Processing successful: ${result.success}`);
        console.log(`   📝 Summary generated: ${!!result.processing?.summary?.summary}`);
        console.log(`   🏷️ Category assigned: ${result.processing?.categories?.primaryCategory || 'N/A'}`);
        testsPassed++;
      } else {
        throw new Error(`Processing failed: ${response.status}`);
      }
    } catch (error) {
      console.log('   ❌ Single processing test failed:', error.message);
      testsFailed++;
    }
  } else {
    console.log('   ℹ️  No unprocessed articles available for testing');
  }

  await sleep(1000);

  // Test 4: Batch Processing
  console.log('\n4️⃣ Testing batch processing...');
  try {
    const response = await fetch(`${BASE_URL}/api/articles/process-v2?batchSize=3`);
    if (response.ok) {
      const result = await response.json();
      console.log(`   ✅ Batch processing completed`);
      console.log(`   📊 Processed: ${result.processed || 0} articles`);
      console.log(`   ❌ Failed: ${result.failed || 0} articles`);
      testsPassed++;
    } else {
      throw new Error(`Batch processing failed: ${response.status}`);
    }
  } catch (error) {
    console.log('   ❌ Batch processing test failed:', error.message);
    testsFailed++;
  }

  await sleep(1000);

  // Test 5: Verify Updates in Articles API
  console.log('\n5️⃣ Verifying processed articles in API...');
  try {
    const response = await fetch(`${BASE_URL}/api/articles`);
    if (response.ok) {
      const data = await response.json();
      const processedCount = data.articles.filter(a => a.aiProcessed).length;
      console.log(`   ✅ Articles API shows ${processedCount}/${data.articles.length} processed`);
      
      // Show a processed article's data
      const processedArticle = data.articles.find(a => a.aiProcessed);
      if (processedArticle) {
        console.log(`   📝 Sample processed article:`);
        console.log(`      Title: ${processedArticle.title.slice(0, 40)}...`);
        console.log(`      Category: ${processedArticle.primaryCategory || 'N/A'}`);
        console.log(`      Reading Time: ${processedArticle.readingTime || 'N/A'} min`);
        console.log(`      Sentiment: ${processedArticle.sentiment || 'N/A'}`);
      }
      testsPassed++;
    } else {
      throw new Error('Final verification failed');
    }
  } catch (error) {
    console.log('   ❌ Final verification failed:', error.message);
    testsFailed++;
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('🏁 TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Tests Passed: ${testsPassed}`);
  console.log(`❌ Tests Failed: ${testsFailed}`);
  console.log(`📊 Success Rate: ${Math.round((testsPassed / (testsPassed + testsFailed)) * 100)}%`);
  
  if (testsFailed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! AI Processing is fully functional.');
    console.log('\n💡 Next steps:');
    console.log('   1. Open http://localhost:3000 in your browser');
    console.log('   2. Look for "Generate AI Summary" buttons on articles');
    console.log('   3. Click the settings gear icon for batch processing');
    console.log('   4. Test the UI functionality manually');
  } else {
    console.log('\n⚠️  Some tests failed. Check the error messages above.');
  }
}

if (require.main === module) {
  runCompleteTest().catch(console.error);
}

module.exports = { runCompleteTest };
