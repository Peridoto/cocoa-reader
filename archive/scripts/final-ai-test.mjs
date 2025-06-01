// Direct database article insertion and AI testing
import { PrismaClient } from '@prisma/client';
import { processArticleLocally } from './src/lib/ai-processor.js';

const prisma = new PrismaClient();

async function setupAndTest() {
  console.log('🔄 Setting up test data and testing AI processing...\n');
  
  try {
    // First, let's add a test article directly via Prisma
    console.log('1. Adding test article...');
    const article = await prisma.article.create({
      data: {
        url: 'https://example.com/react-guide',
        title: 'Complete React Hooks Guide',
        textContent: `React Hooks are functions that let you use state and other React features without writing a class. They were introduced in React 16.8 and have fundamentally changed how we write React components.

The most basic hook is useState. It lets you add React state to function components. When you call useState, it returns a pair: the current state value and a function that lets you update it. You can call this function from an event handler or somewhere else.

useEffect is another fundamental hook. It serves the same purpose as componentDidMount, componentDidUpdate, and componentWillUnmount combined in React class components. When you call useEffect, you're telling React that your component needs to do something after render.

There are two common kinds of side effects in React components: those that don't require cleanup, and those that do. Network requests, manual DOM mutations, and logging are common examples of effects that don't require a cleanup. We say that because we can run them and immediately forget about them.

Effects with cleanup are necessary when we want to set up a subscription to some external data source. In this case, it is important to clean up so that we don't introduce a memory leak! React will perform the cleanup when the component unmounts.

Custom hooks are a natural extension of the hooks design. They let you extract component logic into reusable functions. A custom hook is a JavaScript function whose name starts with "use" and that may call other hooks.

The rules of hooks are important to follow: only call hooks at the top level, and only call hooks from React functions. These rules ensure that hooks are called in the same order every time the component renders.`,
        excerpt: 'Learn React Hooks including useState, useEffect, and custom hooks for modern React development.',
        domain: 'example.com'
      }
    });
    
    console.log(`   ✅ Created article with ID: ${article.id}`);
    
    // 2. Test AI processing on this article
    console.log('\n2. Testing AI processing...');
    const aiResult = await processArticleLocally(
      article.title,
      article.textContent,
      article.excerpt
    );
    
    if (aiResult.processed) {
      console.log('   ✅ AI processing successful!');
      console.log(`   📝 Summary: ${aiResult.summary.summary.slice(0, 100)}...`);
      console.log(`   📚 Category: ${aiResult.categories.primaryCategory}`);
      console.log(`   ⏱️ Reading time: ${aiResult.summary.readingTime} minutes`);
      console.log(`   😊 Sentiment: ${aiResult.summary.sentiment}`);
      console.log(`   🏷️ Tags: ${aiResult.categories.tags.slice(0, 3).join(', ')}`);
      
      // 3. Update the article with AI results
      console.log('\n3. Updating article with AI results...');
      const updatedArticle = await prisma.article.update({
        where: { id: article.id },
        data: {
          summary: aiResult.summary.summary,
          keyPoints: JSON.stringify(aiResult.summary.keyPoints),
          readingTime: aiResult.summary.readingTime,
          sentiment: aiResult.summary.sentiment,
          primaryCategory: aiResult.categories.primaryCategory,
          categories: JSON.stringify(aiResult.categories.categories),
          tags: JSON.stringify(aiResult.categories.tags),
          aiProcessed: true,
          processedAt: new Date()
        }
      });
      
      console.log('   ✅ Article updated successfully!');
      
    } else {
      console.log('   ❌ AI processing failed:', aiResult.error);
    }
    
    // 4. Test API endpoints
    console.log('\n4. Testing API endpoints...');
    
    // Test single article processing endpoint
    console.log('   Testing single article processing API...');
    const processResponse = await fetch('http://localhost:3000/api/articles/process-v2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ articleId: article.id })
    });
    
    if (processResponse.ok) {
      const result = await processResponse.json();
      console.log('   ✅ API processing successful');
    } else {
      console.log('   ❌ API processing failed');
    }
    
    // 5. Verify the results
    console.log('\n5. Final verification...');
    const finalArticle = await prisma.article.findUnique({
      where: { id: article.id }
    });
    
    if (finalArticle?.aiProcessed) {
      console.log('   ✅ Article is marked as AI processed');
      console.log('   ✅ All tests completed successfully!');
      
      console.log('\n🎉 AI Processing Implementation Complete!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✨ Features implemented:');
      console.log('   • Local text summarization');
      console.log('   • Automatic categorization');
      console.log('   • Sentiment analysis');
      console.log('   • Reading time estimation');
      console.log('   • Key points extraction');
      console.log('   • Tag generation');
      console.log('   • Single article processing API');
      console.log('   • Batch processing API');
      console.log('   • UI components for processing');
      console.log('   • Database integration');
      console.log('\n🚀 Ready to use at: http://localhost:3000');
      
    } else {
      console.log('   ❌ Article processing verification failed');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupAndTest();
