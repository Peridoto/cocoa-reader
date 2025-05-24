/**
 * Test script for AI processing functionality
 */

async function testAIProcessing() {
  console.log('🧪 Testing AI Processing functionality...\n')
  
  try {
    // 1. Check if server is running
    console.log('1. Checking server status...')
    const healthResponse = await fetch('http://localhost:3000/api/test')
    if (!healthResponse.ok) {
      throw new Error('Server is not running. Please start with: npm run dev')
    }
    console.log('   ✅ Server is running\n')
    
    // 2. Get articles from database
    console.log('2. Fetching articles...')
    const articlesResponse = await fetch('http://localhost:3000/api/articles?limit=5')
    if (!articlesResponse.ok) {
      throw new Error('Failed to fetch articles')
    }
    
    const articlesData = await articlesResponse.json()
    const articles = articlesData.articles
    
    if (articles.length === 0) {
      console.log('   ⚠️  No articles found. Please add some articles first.')
      return
    }
    
    console.log(`   ✅ Found ${articles.length} articles\n`)
    
    // 3. Find an unprocessed article
    const unprocessedArticle = articles.find(article => !article.aiProcessed)
    
    if (!unprocessedArticle) {
      console.log('   ℹ️  All articles are already processed. Testing batch processing...\n')
      
      // Test batch processing
      const batchResponse = await fetch('http://localhost:3000/api/articles/process?batchSize=3')
      const batchResult = await batchResponse.json()
      
      console.log('   Batch processing result:', batchResult)
      return
    }
    
    console.log(`3. Processing article: "${unprocessedArticle.title}"`)
    
    // 4. Process the article
    const processResponse = await fetch('http://localhost:3000/api/articles/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        articleId: unprocessedArticle.id
      })
    })
    
    if (!processResponse.ok) {
      const errorData = await processResponse.json()
      throw new Error(`Processing failed: ${errorData.error}`)
    }
    
    const processResult = await processResponse.json()
    
    if (processResult.success) {
      console.log('   ✅ Article processed successfully!\n')
      
      // 5. Display results
      console.log('📊 Processing Results:')
      console.log('────────────────────────────────────────')
      console.log(`Summary: ${processResult.processing.summary.summary.slice(0, 100)}...`)
      console.log(`Reading Time: ${processResult.processing.summary.readingTime} minutes`)
      console.log(`Sentiment: ${processResult.processing.summary.sentiment}`)
      console.log(`Primary Category: ${processResult.categories.primaryCategory}`)
      console.log(`Key Points: ${processResult.processing.summary.keyPoints.length} found`)
      console.log(`Tags: ${processResult.categories.tags.length} generated`)
      console.log('────────────────────────────────────────\n')
      
      // 6. Verify the article was updated in database
      console.log('4. Verifying database update...')
      const updatedArticleResponse = await fetch(`http://localhost:3000/api/article/${unprocessedArticle.id}`)
      const updatedArticle = await updatedArticleResponse.json()
      
      if (updatedArticle.aiProcessed) {
        console.log('   ✅ Article successfully updated in database')
      } else {
        console.log('   ❌ Article was not marked as processed in database')
      }
      
    } else {
      console.log('   ❌ Processing failed:', processResult.error)
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    
    if (error.message.includes('fetch')) {
      console.log('\n💡 Make sure the development server is running:')
      console.log('   npm run dev')
    }
  }
}

// Add a delay to ensure server is fully started
setTimeout(() => {
  testAIProcessing()
}, 2000)
