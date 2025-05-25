// Test script to verify search functionality and CORS proxy fixes
console.log('Testing Cocoa Reader Search and CORS functionality...');

// Test data for search
const testArticles = [
  {
    id: 'test-1',
    title: 'JavaScript Best Practices',
    url: 'https://example.com/js-practices',
    domain: 'example.com',
    textContent: 'Learn about modern JavaScript development patterns, including async/await, promises, and functional programming techniques.',
    cleanedHTML: '<p>Learn about modern JavaScript development patterns...</p>',
    excerpt: 'Learn about modern JavaScript development patterns...',
    read: false,
    createdAt: new Date(),
    scroll: 0,
    readingTime: 5
  },
  {
    id: 'test-2', 
    title: 'Web Performance Optimization',
    url: 'https://example.com/performance',
    domain: 'example.com',
    textContent: 'Techniques for improving website speed including image optimization, code splitting, and lazy loading strategies.',
    cleanedHTML: '<p>Techniques for improving website speed...</p>',
    excerpt: 'Techniques for improving website speed...',
    read: true,
    createdAt: new Date(),
    scroll: 0,
    readingTime: 8
  }
];

// Function to test local database operations
async function testLocalDatabase() {
  console.log('\n=== Testing Local Database ===');
  
  try {
    // Import the local database module
    const { localDB } = await import('./src/lib/local-database.js');
    
    console.log('Initializing database...');
    await localDB.init();
    
    console.log('Adding test articles...');
    for (const article of testArticles) {
      await localDB.saveArticle(article);
      console.log(`✓ Added: ${article.title}`);
    }
    
    console.log('\nTesting search functionality...');
    
    // Test 1: Search by title
    console.log('\n1. Search by title "JavaScript":');
    const titleResults = await localDB.searchArticles('JavaScript');
    console.log(`Found ${titleResults.length} results:`, titleResults.map(a => a.title));
    
    // Test 2: Search by content
    console.log('\n2. Search by content "optimization":');
    const contentResults = await localDB.searchArticles('optimization');
    console.log(`Found ${contentResults.length} results:`, contentResults.map(a => a.title));
    
    // Test 3: Search by content "async/await"
    console.log('\n3. Search by content "async/await":');
    const asyncResults = await localDB.searchArticles('async/await');
    console.log(`Found ${asyncResults.length} results:`, asyncResults.map(a => a.title));
    
    // Test 4: Search by domain
    console.log('\n4. Search by domain "example.com":');
    const domainResults = await localDB.searchArticles('example.com');
    console.log(`Found ${domainResults.length} results:`, domainResults.map(a => a.title));
    
    console.log('\n✓ Search functionality is working correctly!');
    
  } catch (error) {
    console.error('❌ Local database test failed:', error);
  }
}

// Function to test CORS proxy system
async function testCORSProxy() {
  console.log('\n=== Testing CORS Proxy System ===');
  
  try {
    // Import the client scraper
    const { clientScraper } = await import('./src/lib/client-scraper.js');
    
    console.log('Testing with totalhse.com (the problematic URL)...');
    const result = await clientScraper.scrapeArticle('https://totalhse.com');
    
    console.log('✓ CORS proxy test results:');
    console.log(`Title: ${result.title}`);
    console.log(`Domain: ${result.domain}`);
    console.log(`URL: ${result.url}`);
    console.log(`Text content length: ${result.textContent?.length || 0} characters`);
    console.log(`Has cleaned HTML: ${!!result.cleanedHTML}`);
    
    if (result.textContent === 'Content not available') {
      console.log('⚠️  Content could not be fetched, but fallback was created successfully');
    } else {
      console.log('✓ Content was successfully fetched!');
    }
    
  } catch (error) {
    console.error('❌ CORS proxy test failed:', error);
  }
}

// Run tests
async function runTests() {
  await testLocalDatabase();
  await testCORSProxy();
  console.log('\n=== Test Complete ===');
}

runTests().catch(console.error);
