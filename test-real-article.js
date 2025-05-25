#!/usr/bin/env node

/**
 * Test article saving with a real URL to verify content extraction
 */

const PORT = 3004;
const BASE_URL = `http://localhost:${PORT}`;

async function testRealArticleSaving() {
  console.log('🔗 Testing Real Article Content Extraction\n');

  // Test with a real, accessible URL
  const testUrls = [
    'https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API',
    'https://web.dev/web-share/',
    'https://github.com'
  ];

  for (const url of testUrls) {
    console.log(`\n📄 Testing URL: ${url}`);
    try {
      const response = await fetch(`${BASE_URL}/api/article`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('   ✅ Article saved successfully');
        console.log(`   📄 Title: ${result.article.title}`);
        console.log(`   🏠 Domain: ${result.article.domain}`);
        console.log(`   📝 Content length: ${result.article.textContent?.length || 0} chars`);
        console.log(`   📄 HTML length: ${result.article.cleanedHTML?.length || 0} chars`);
        
        if (result.article.textContent && result.article.textContent.length > 100) {
          console.log('   ✅ Content extraction successful');
        } else {
          console.log('   ⚠️ Content extraction may be limited');
        }
        break; // Success, no need to test more URLs
      } else {
        const error = await response.json();
        if (response.status === 409) {
          console.log('   ✅ Article already exists (previously saved)');
          break;
        } else {
          console.log(`   ❌ Error: ${error.error}`);
        }
      }
    } catch (error) {
      console.log(`   ❌ Request failed: ${error.message}`);
    }
    
    await sleep(1000); // Wait between requests
  }

  // Check saved articles
  console.log('\n📚 Checking saved articles...');
  try {
    const response = await fetch(`${BASE_URL}/api/articles`);
    if (response.ok) {
      const data = await response.json();
      console.log(`   📊 Total articles: ${data.articles.length}`);
      
      if (data.articles.length > 0) {
        const article = data.articles[0];
        console.log(`   📄 Latest article: "${article.title}"`);
        console.log(`   🔗 URL: ${article.url}`);
        console.log(`   📝 Has content: ${article.textContent ? 'Yes' : 'No'}`);
        console.log(`   🤖 AI processed: ${article.aiProcessed ? 'Yes' : 'No'}`);
      }
    }
  } catch (error) {
    console.log(`   ❌ Error checking articles: ${error.message}`);
  }

  console.log('\n✅ Content extraction test completed');
  console.log('\n🎯 Web Share Target Test:');
  console.log(`   Open: ${BASE_URL}/share?url=https://example.com&title=Test`);
  console.log('   The URL should be pre-filled in the form');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

testRealArticleSaving().catch(console.error);
