#!/usr/bin/env node

/**
 * Test Script: Intelligent Content Extraction for iOS PWA
 * 
 * This script tests the enhanced content extraction functionality
 * that provides meaningful content even when CORS restrictions
 * prevent full article scraping in iOS PWA mode.
 */

const { chromium } = require('playwright');

const testUrls = [
  // GitHub URLs
  'https://github.com/microsoft/vscode',
  'https://github.com/facebook/react/blob/main/README.md',
  'https://github.com/nodejs/node/issues/12345',
  'https://github.com/vercel/next.js/pull/67890',
  
  // Documentation
  'https://nextjs.org/docs/getting-started',
  'https://developer.mozilla.org/en-US/docs/Web/API',
  'https://docs.github.com/en/actions',
  
  // Blog posts
  'https://medium.com/@author/some-article-title',
  'https://blog.example.com/post/my-blog-post',
  'https://dev.to/user/article-about-programming',
  
  // News
  'https://techcrunch.com/2024/01/01/tech-news-article',
  'https://arstechnica.com/gadgets/2024/01/device-review',
  'https://news.ycombinator.com/item?id=123456',
  
  // Academic
  'https://arxiv.org/abs/2024.01234',
  'https://scholar.google.com/citations?view_op=view_citation',
  'https://university.edu/research/paper-title',
  
  // Forums
  'https://stackoverflow.com/questions/12345/how-to-solve-problem',
  'https://reddit.com/r/programming/comments/abc123/discussion',
  'https://discourse.example.com/t/topic-discussion/456'
];

async function testIntelligentContentExtraction() {
  console.log('🧠 Testing Intelligent Content Extraction for iOS PWA Mode');
  console.log('=' .repeat(60));
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Simulate iOS PWA environment
  await page.addInitScript(() => {
    // Mock iOS PWA detection
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
    });
    
    Object.defineProperty(navigator, 'standalone', {
      value: true
    });
    
    // Mock fetch to always fail with CORS error for testing
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
      console.log(`Simulating CORS failure for: ${url}`);
      return Promise.reject(new Error('CORS policy: Cross origin requests are only supported for protocol schemes: http, data, chrome, chrome-extension, https.'));
    };
  });
  
  try {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    let passedTests = 0;
    let failedTests = 0;
    
    for (const [index, testUrl] of testUrls.entries()) {
      console.log(`\n📝 Test ${index + 1}/${testUrls.length}: ${testUrl}`);
      
      try {
        // Test the scraping functionality
        const result = await page.evaluate(async (url) => {
          // Import the client scraper
          const { clientScraper } = await import('/src/lib/client-scraper.ts');
          
          // Attempt to scrape the article
          const article = await clientScraper.scrapeArticle(url);
          
          return {
            title: article.title,
            domain: article.domain,
            excerpt: article.excerpt?.substring(0, 100) + '...',
            textContent: article.textContent?.substring(0, 200) + '...',
            readingTime: article.readingTime,
            hasIntelligentContent: article.textContent && 
              !article.textContent.includes('This is a limitation of iOS Safari PWA security policies') &&
              article.textContent.length > 100
          };
        }, testUrl);
        
        console.log(`   ✅ Title: ${result.title}`);
        console.log(`   🌐 Domain: ${result.domain}`);
        console.log(`   📄 Excerpt: ${result.excerpt}`);
        console.log(`   ⏱️  Reading Time: ${result.readingTime} min`);
        console.log(`   🧠 Intelligent Content: ${result.hasIntelligentContent ? 'YES' : 'NO'}`);
        
        if (result.hasIntelligentContent && result.title !== 'Untitled Article') {
          passedTests++;
          console.log(`   ✅ TEST PASSED`);
        } else {
          failedTests++;
          console.log(`   ❌ TEST FAILED - No intelligent content generated`);
        }
        
      } catch (error) {
        failedTests++;
        console.log(`   ❌ TEST FAILED - Error: ${error.message}`);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`📊 TEST RESULTS:`);
    console.log(`   ✅ Passed: ${passedTests}/${testUrls.length}`);
    console.log(`   ❌ Failed: ${failedTests}/${testUrls.length}`);
    console.log(`   📈 Success Rate: ${((passedTests / testUrls.length) * 100).toFixed(1)}%`);
    
    if (passedTests === testUrls.length) {
      console.log('\n🎉 ALL TESTS PASSED! Intelligent content extraction is working correctly.');
    } else if (passedTests > testUrls.length * 0.8) {
      console.log('\n✅ Most tests passed. Intelligent content extraction is mostly working.');
    } else {
      console.log('\n⚠️  Many tests failed. Intelligent content extraction needs improvement.');
    }
    
  } catch (error) {
    console.error('❌ Test setup failed:', error.message);
  } finally {
    await browser.close();
  }
}

async function testUrlPatternAnalysis() {
  console.log('\n🔍 Testing URL Pattern Analysis');
  console.log('=' .repeat(40));
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    const testPatterns = [
      { url: 'https://github.com/user/repo', expected: 'repository' },
      { url: 'https://docs.example.com/api', expected: 'documentation' },
      { url: 'https://medium.com/article', expected: 'blog' },
      { url: 'https://techcrunch.com/news', expected: 'news' },
      { url: 'https://stackoverflow.com/questions/123', expected: 'forum' },
      { url: 'https://arxiv.org/abs/123', expected: 'academic' }
    ];
    
    for (const test of testPatterns) {
      const result = await page.evaluate(async (url) => {
        const { clientScraper } = await import('/src/lib/client-scraper.ts');
        const urlObj = new URL(url);
        const patterns = clientScraper.analyzeUrlPatterns(url, urlObj.hostname, urlObj.pathname);
        return patterns;
      }, test.url);
      
      console.log(`📎 ${test.url}`);
      console.log(`   Expected: ${test.expected}`);
      console.log(`   Detected: ${JSON.stringify(result, null, 2)}`);
    }
    
  } catch (error) {
    console.error('❌ Pattern analysis test failed:', error.message);
  } finally {
    await browser.close();
  }
}

async function main() {
  try {
    console.log('🚀 Starting Intelligent Content Extraction Tests\n');
    
    // Run the main content extraction tests
    await testIntelligentContentExtraction();
    
    // Run URL pattern analysis tests
    await testUrlPatternAnalysis();
    
    console.log('\n✅ All tests completed!');
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3000');
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Main execution
(async () => {
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log('⚠️  Server not running. Starting server first...');
    console.log('💡 Run: npm run dev');
    console.log('Then run this test again.');
    process.exit(1);
  }
  
  await main();
})();
