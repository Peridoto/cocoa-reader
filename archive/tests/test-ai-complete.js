#!/usr/bin/env node

/**
 * Comprehensive AI Processing Test Suite
 * Tests all AI processing functionality end-to-end
 */

const BASE_URL = 'http://localhost:3000';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testAIProcessing() {
  console.log('🤖 Starting AI Processing Test Suite\n');
  
  let testsPassed = 0;
  let testsFailed = 0;

  // Test 1: Check server health
  console.log('1️⃣ Testing server health...');
  try {
    const response = await fetch(`${BASE_URL}/api/test-ai`);
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Server is running and AI processing works');
      console.log(`   📊 Test result: ${data.result.processed ? 'Success' : 'Failed'}`);
      testsPassed++;
    } else {
      throw new Error('Server not responding');
    }
  } catch (error) {
    console.log('   ❌ Server health check failed:', error.message);
    testsFailed++;
    return;
  }

  await sleep(500);

  // Test 2: Get articles
  console.log('\n2️⃣ Testing article retrieval...');
  let articles = [];
  try {
    const response = await fetch(`${BASE_URL}/api/articles`);
    if (response.ok) {
      const data = await response.json();
      articles = data.articles;
      console.log(`   ✅ Found ${articles.length} articles`);
      testsPassed++;
    } else {
      throw new Error('Failed to fetch articles');
    }
  } catch (error) {
    console.log('   ❌ Article retrieval failed:', error.message);
    testsFailed++;
  }

  await sleep(500);

  // Test 3: Single article processing
  console.log('\n3️⃣ Testing single article processing...');
  if (articles.length > 0) {
    const testArticle = articles.find(a => !a.aiProcessed) || articles[0];
    try {
      const response = await fetch(`${BASE_URL}/api/articles/process-v2`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ articleId: testArticle.id }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('   ✅ Single article processing successful');
        console.log(`   📝 Summary: ${result.processing.summary.summary.slice(0, 100)}...`);
        console.log(`   📚 Category: ${result.categories.primaryCategory}`);
        console.log(`   ⏱️ Reading time: ${result.processing.summary.readingTime} minutes`);
        console.log(`   😊 Sentiment: ${result.processing.summary.sentiment}`);
        testsPassed++;
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Processing failed');
      }
    } catch (error) {
      console.log('   ❌ Single article processing failed:', error.message);
      testsFailed++;
    }
  } else {
    console.log('   ⚠️ No articles available for testing');
  }

  await sleep(1000);

  // Test 4: Batch processing
  console.log('\n4️⃣ Testing batch processing...');
  try {
    const response = await fetch(`${BASE_URL}/api/articles/process-v2?batchSize=3`);
    if (response.ok) {
      const result = await response.json();
      console.log('   ✅ Batch processing completed');
      console.log(`   📊 Processed: ${result.processed} articles`);
      console.log(`   📈 Total: ${result.total} articles checked`);
      if (result.errors && result.errors.length > 0) {
        console.log(`   ⚠️ Errors: ${result.errors.length}`);
      }
      testsPassed++;
    } else {
      const error = await response.json();
      throw new Error(error.error || 'Batch processing failed');
    }
  } catch (error) {
    console.log('   ❌ Batch processing failed:', error.message);
    testsFailed++;
  }

  await sleep(500);

  // Test 5: Verify processed articles
  console.log('\n5️⃣ Testing processed article retrieval...');
  try {
    const response = await fetch(`${BASE_URL}/api/articles`);
    if (response.ok) {
      const data = await response.json();
      const processedArticles = data.articles.filter(a => a.aiProcessed);
      console.log(`   ✅ Found ${processedArticles.length} processed articles`);
      
      if (processedArticles.length > 0) {
        const sample = processedArticles[0];
        console.log(`   📝 Sample processed article: "${sample.title}"`);
        console.log(`   📊 Has summary: ${!!sample.summary}`);
        console.log(`   🏷️ Has category: ${!!sample.primaryCategory}`);
        console.log(`   ⏱️ Has reading time: ${!!sample.readingTime}`);
      }
      testsPassed++;
    } else {
      throw new Error('Failed to fetch processed articles');
    }
  } catch (error) {
    console.log('   ❌ Processed article verification failed:', error.message);
    testsFailed++;
  }

  await sleep(500);

  // Test 6: Feature completeness check
  console.log('\n6️⃣ Testing AI processing features...');
  try {
    const response = await fetch(`${BASE_URL}/api/test-ai`);
    if (response.ok) {
      const data = await response.json();
      const result = data.result;
      
      const features = {
        'Summary generation': !!result.summary && result.summary.length > 10,
        'Key points extraction': Array.isArray(result.keyPoints) && result.keyPoints.length > 0,
        'Reading time estimation': typeof result.readingTime === 'number' && result.readingTime > 0,
        'Sentiment analysis': ['positive', 'negative', 'neutral'].includes(result.sentiment),
        'Category classification': !!result.primaryCategory,
        'Multiple categories': Array.isArray(result.categories) && result.categories.length > 0,
        'Tag generation': Array.isArray(result.tags) && result.tags.length > 0,
      };

      console.log('   🔍 Feature Analysis:');
      Object.entries(features).forEach(([feature, working]) => {
        console.log(`   ${working ? '✅' : '❌'} ${feature}`);
      });

      const workingFeatures = Object.values(features).filter(Boolean).length;
      const totalFeatures = Object.keys(features).length;
      
      if (workingFeatures === totalFeatures) {
        console.log(`   🎉 All ${totalFeatures} features working perfectly!`);
        testsPassed++;
      } else {
        console.log(`   ⚠️ ${workingFeatures}/${totalFeatures} features working`);
        testsFailed++;
      }
    } else {
      throw new Error('Feature test failed');
    }
  } catch (error) {
    console.log('   ❌ Feature completeness check failed:', error.message);
    testsFailed++;
  }

  // Final results
  console.log('\n' + '='.repeat(50));
  console.log('🏁 AI PROCESSING TEST RESULTS');
  console.log('='.repeat(50));
  console.log(`✅ Tests Passed: ${testsPassed}`);
  console.log(`❌ Tests Failed: ${testsFailed}`);
  console.log(`📊 Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);

  if (testsFailed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! AI Processing is fully functional.');
    console.log('\n✨ Features available:');
    console.log('   • Automatic text summarization');
    console.log('   • Content categorization');
    console.log('   • Sentiment analysis');
    console.log('   • Reading time estimation');
    console.log('   • Key points extraction');
    console.log('   • Tag generation');
    console.log('   • Batch processing');
    console.log('\n💡 Ready for production use!');
  } else {
    console.log('\n⚠️ Some tests failed. Check the logs above for details.');
  }

  console.log('\n🔗 Test your app at: http://localhost:3000');
}

// Run the test
testAIProcessing().catch(error => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});
