#!/usr/bin/env node

/**
 * Simple test script to verify the application is working properly
 * Tests key API endpoints and functionality
 */

const BASE_URL = 'http://localhost:3000'

async function testApiEndpoint(endpoint, method = 'GET', body = null) {
  try {
    console.log(`🧪 Testing ${method} ${endpoint}`)
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    }
    
    if (body) {
      options.body = JSON.stringify(body)
    }
    
    const response = await fetch(`${BASE_URL}${endpoint}`, options)
    const data = await response.json()
    
    if (response.ok) {
      console.log(`✅ ${endpoint} - Status: ${response.status}`)
      return { success: true, data }
    } else {
      console.log(`❌ ${endpoint} - Status: ${response.status}, Error: ${data.error || 'Unknown error'}`)
      return { success: false, data }
    }
  } catch (error) {
    console.log(`❌ ${endpoint} - Network error: ${error.message}`)
    return { success: false, error: error.message }
  }
}

async function runTests() {
  console.log('🚀 Starting Cocoa Reader functionality tests...\n')
  
  // Test 1: Check if the API test endpoint works
  await testApiEndpoint('/api/test')
  
  // Test 2: Check if we can fetch articles
  const articlesResult = await testApiEndpoint('/api/articles')
  
  if (articlesResult.success) {
    console.log(`📚 Found ${articlesResult.data.articles?.length || 0} articles in database`)
  }
  
  // Test 3: Try to add a new article (test URL)
  console.log('\n🔗 Testing article creation...')
  const testArticle = {
    url: 'https://httpbin.org/json'
  }
  
  const createResult = await testApiEndpoint('/api/article', 'POST', testArticle)
  
  if (createResult.success) {
    console.log(`✅ Successfully created article: ${createResult.data.article?.title || 'Test Article'}`)
    
    // Test 4: Try to fetch the specific article
    const articleId = createResult.data.article?.id
    if (articleId) {
      await testApiEndpoint(`/api/article/${articleId}`)
    }
  }
  
  // Test 5: Test search functionality
  console.log('\n🔍 Testing search functionality...')
  await testApiEndpoint('/api/articles?search=test')
  
  console.log('\n🎉 Test suite completed!')
  console.log('\n📋 Next steps:')
  console.log('1. Open http://localhost:3000 in your browser')
  console.log('2. Try adding a real article URL (e.g., a news article)')
  console.log('3. Test the reading interface and dark mode')
  console.log('4. Verify offline functionality (PWA)')
}

// Run the tests
runTests().catch(console.error)
