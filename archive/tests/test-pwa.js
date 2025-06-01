// PWA Functionality Test
// Run this in the browser console to test various PWA features

console.log('🥥 Starting Cocoa Reader PWA Test...\n');

async function testPWAFeatures() {
  const results = {
    serviceWorker: false,
    localDatabase: false,
    clientScraping: false,
    clientAI: false,
    manifest: false,
    offlineCapability: false
  };

  try {
    // Test 1: Service Worker Registration
    console.log('1️⃣ Testing Service Worker...');
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        results.serviceWorker = true;
        console.log('✅ Service Worker is registered');
      } else {
        console.log('❌ Service Worker not found');
      }
    } else {
      console.log('❌ Service Worker not supported');
    }

    // Test 2: Local Database (IndexedDB)
    console.log('\n2️⃣ Testing Local Database...');
    try {
      // Import local database module
      const { localDB } = await import('/src/lib/local-database.ts');
      
      // Test basic database operations
      const testArticle = {
        url: 'https://example.com/test',
        title: 'Test Article',
        domain: 'example.com',
        textContent: 'This is a test article content.',
        cleanedHTML: '<p>This is a test article content.</p>',
        read: false,
        scroll: 0,
        aiProcessed: false
      };

      const savedArticle = await localDB.saveArticle(testArticle);
      if (savedArticle) {
        console.log('✅ Local database save works');
        
        const retrievedArticle = await localDB.getArticle(savedArticle.id);
        if (retrievedArticle) {
          console.log('✅ Local database retrieval works');
          results.localDatabase = true;
          
          // Clean up test article
          await localDB.deleteArticle(savedArticle.id);
          console.log('✅ Test article cleaned up');
        }
      }
    } catch (error) {
      console.log('❌ Local database error:', error.message);
    }

    // Test 3: Client-side Scraping
    console.log('\n3️⃣ Testing Client-side Scraping...');
    try {
      const { scrapeArticle } = await import('/src/lib/client-scraper.ts');
      
      // Test with a simple, reliable URL
      const scrapedData = await scrapeArticle('https://httpbin.org/html');
      if (scrapedData && scrapedData.title) {
        console.log('✅ Client-side scraping works');
        results.clientScraping = true;
      } else {
        console.log('❌ Client-side scraping failed');
      }
    } catch (error) {
      console.log('❌ Client-side scraping error:', error.message);
    }

    // Test 4: Client-side AI Processing
    console.log('\n4️⃣ Testing Client-side AI...');
    try {
      const { clientAI } = await import('/src/lib/client-ai.ts');
      
      const testContent = "This is a test article about artificial intelligence. AI is transforming many industries. Machine learning algorithms are becoming more sophisticated.";
      const aiResults = await clientAI.processArticle({
        id: 'test',
        textContent: testContent,
        title: 'Test AI Article',
        url: 'https://example.com/ai-test',
        domain: 'example.com',
        cleanedHTML: `<p>${testContent}</p>`,
        read: false,
        scroll: 0,
        aiProcessed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      if (aiResults && aiResults.summary) {
        console.log('✅ Client-side AI processing works');
        console.log('   Summary:', aiResults.summary);
        results.clientAI = true;
      } else {
        console.log('❌ Client-side AI processing failed');
      }
    } catch (error) {
      console.log('❌ Client-side AI error:', error.message);
    }

    // Test 5: Manifest and PWA Installation
    console.log('\n5️⃣ Testing PWA Manifest...');
    try {
      const response = await fetch('/manifest.json');
      if (response.ok) {
        const manifest = await response.json();
        if (manifest.name && manifest.icons) {
          console.log('✅ PWA manifest is valid');
          results.manifest = true;
          
          // Check if app can be installed
          if ('BeforeInstallPromptEvent' in window || window.navigator.standalone !== undefined) {
            console.log('✅ PWA installation supported');
          }
        }
      }
    } catch (error) {
      console.log('❌ Manifest error:', error.message);
    }

    // Test 6: Offline Capability
    console.log('\n6️⃣ Testing Offline Capability...');
    if ('serviceWorker' in navigator && results.serviceWorker) {
      // Test if main resources are cached
      try {
        const cache = await caches.open('cocoa-reader-v1');
        const cachedResponse = await cache.match('/');
        if (cachedResponse) {
          console.log('✅ Main page is cached for offline use');
          results.offlineCapability = true;
        } else {
          console.log('⚠️ Main page not yet cached (may need to refresh)');
        }
      } catch (error) {
        console.log('❌ Cache check error:', error.message);
      }
    } else {
      console.log('❌ Service Worker required for offline capability');
    }

  } catch (error) {
    console.log('❌ General test error:', error.message);
  }

  // Summary
  console.log('\n📊 PWA Test Results:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  for (const [feature, status] of Object.entries(results)) {
    const icon = status ? '✅' : '❌';
    const name = feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    console.log(`${icon} ${name}`);
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🎯 PWA Score: ${passed}/${total} (${Math.round(passed/total*100)}%)`);
  
  if (passed === total) {
    console.log('🎉 Congratulations! Your PWA is fully functional!');
  } else if (passed >= total * 0.8) {
    console.log('🚀 Great! Your PWA is mostly functional!');
  } else if (passed >= total * 0.5) {
    console.log('⚡ Good progress! Some features need attention.');
  } else {
    console.log('🔧 Keep working! Several features need fixes.');
  }
  
  return results;
}

// Auto-run the test
testPWAFeatures();
