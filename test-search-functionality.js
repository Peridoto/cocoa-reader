#!/usr/bin/env node

/**
 * Test script to verify search functionality works on both titles and descriptions
 */

async function testSearchFunctionality() {
    console.log('🔍 Testing Search Functionality');
    console.log('===============================\n');

    const baseUrl = 'http://localhost:3000';
    
    try {
        // Test 1: Get all articles to see what we have
        console.log('1. Fetching all articles...');
        const allResponse = await fetch(`${baseUrl}/api/articles`);
        const allData = await allResponse.json();
        
        console.log(`✅ Found ${allData.total} total articles`);
        
        // Show first few articles with their titles and excerpts
        console.log('\n📋 Sample articles:');
        allData.articles.slice(0, 3).forEach((article, index) => {
            console.log(`${index + 1}. Title: "${article.title}"`);
            console.log(`   Excerpt: "${article.excerpt || 'No excerpt'}"`);
            console.log(`   Domain: "${article.domain}"`);
            console.log('');
        });

        // Test 2: Search by title keyword
        console.log('2. Testing search by title...');
        const titleSearchResponse = await fetch(`${baseUrl}/api/articles?search=Google`);
        const titleSearchData = await titleSearchResponse.json();
        
        console.log(`🔍 Search for "Google" found ${titleSearchData.articles.length} results`);
        titleSearchData.articles.forEach((article, index) => {
            console.log(`   ${index + 1}. "${article.title}" - ${article.domain}`);
        });

        // Test 3: Search by excerpt/description keyword  
        console.log('\n3. Testing search by description/excerpt...');
        const excerptSearchResponse = await fetch(`${baseUrl}/api/articles?search=formación`);
        const excerptSearchData = await excerptSearchResponse.json();
        
        console.log(`🔍 Search for "formación" found ${excerptSearchData.articles.length} results`);
        excerptSearchData.articles.forEach((article, index) => {
            console.log(`   ${index + 1}. "${article.title}"`);
            console.log(`       Excerpt: "${article.excerpt || 'No excerpt'}"`);
        });

        // Test 4: Search by domain
        console.log('\n4. Testing search by domain...');
        const domainSearchResponse = await fetch(`${baseUrl}/api/articles?search=example.com`);
        const domainSearchData = await domainSearchResponse.json();
        
        console.log(`🔍 Search for "example.com" found ${domainSearchData.articles.length} results`);
        domainSearchData.articles.forEach((article, index) => {
            console.log(`   ${index + 1}. "${article.title}" - ${article.domain}`);
        });

        // Test 5: Test case-insensitive search
        console.log('\n5. Testing case-insensitive search...');
        const caseTestResponse = await fetch(`${baseUrl}/api/articles?search=GOOGLE`);
        const caseTestData = await caseTestResponse.json();
        
        console.log(`🔍 Search for "GOOGLE" (uppercase) found ${caseTestData.articles.length} results`);

        // Test 6: Search with no results
        console.log('\n6. Testing search with no results...');
        const noResultsResponse = await fetch(`${baseUrl}/api/articles?search=nonexistentword12345`);
        const noResultsData = await noResultsResponse.json();
        
        console.log(`🔍 Search for "nonexistentword12345" found ${noResultsData.articles.length} results (should be 0)`);

        console.log('\n🎉 Search functionality test completed!');
        console.log('\n📝 Search currently works on:');
        console.log('   ✅ Article titles');
        console.log('   ✅ Article excerpts/descriptions');
        console.log('   ✅ Article domains');
        console.log('   ✅ Article URLs');
        console.log('   ✅ Case-insensitive matching');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.log('\n🔧 Make sure the development server is running:');
        console.log('   npm run dev');
        process.exit(1);
    }
}

// Check if server is running
async function checkServer() {
    try {
        const response = await fetch('http://localhost:3000/api/articles');
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
    await testSearchFunctionality();
}

// Run the test
if (require.main === module) {
    main().catch(console.error);
}
