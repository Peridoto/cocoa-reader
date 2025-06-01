#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

async function addTestArticlesForIOS() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Adding test articles for iOS testing...\n');
    
    // Clear existing articles first
    await prisma.article.deleteMany({});
    console.log('✅ Cleared existing articles');
    
    // Add test articles with proper content
    const testArticles = [
      {
        url: 'https://example.com/article1',
        title: 'iOS Navigation Test Article',
        domain: 'example.com',
        excerpt: 'Test article for iOS navigation verification',
        cleanedHTML: '<h1>iOS Navigation Test</h1><p>This is a test article to verify that the read button navigation works correctly on iOS devices. The content should load properly when clicking the read button.</p><p>This article contains enough content to test scroll progress tracking and reading features.</p>',
        textContent: 'iOS Navigation Test. This is a test article to verify that the read button navigation works correctly on iOS devices. The content should load properly when clicking the read button. This article contains enough content to test scroll progress tracking and reading features.',
        read: false,
        scroll: 0
      },
      {
        url: 'https://techcrunch.com/article2',
        title: 'Safe Area Test Article',
        domain: 'techcrunch.com',
        excerpt: 'Test article for safe area handling on iOS',
        cleanedHTML: '<h1>Safe Area Test</h1><p>This article tests safe area handling on iOS devices with camera notches.</p><p>The content should have proper top padding to avoid being hidden behind the camera notch.</p><p>This is additional content to make the article longer for testing scroll progress.</p>',
        textContent: 'Safe Area Test. This article tests safe area handling on iOS devices with camera notches. The content should have proper top padding to avoid being hidden behind the camera notch. This is additional content to make the article longer for testing scroll progress.',
        read: false,
        scroll: 25
      },
      {
        url: 'https://medium.com/article3',
        title: 'Share Target Test Article',
        domain: 'medium.com',
        excerpt: 'Test article for sharing functionality',
        cleanedHTML: '<h1>Share Target Test</h1><p>This article can be used to test sharing functionality.</p><p>When sharing URLs from Safari or Chrome, the Cocoa Reader app should appear as an option.</p><p>Additional content for testing purposes...</p>',
        textContent: 'Share Target Test. This article can be used to test sharing functionality. When sharing URLs from Safari or Chrome, the Cocoa Reader app should appear as an option. Additional content for testing purposes...',
        read: true,
        scroll: 100
      }
    ];
    
    for (const article of testArticles) {
      const created = await prisma.article.create({
        data: article
      });
      console.log(`✅ Added article: "${created.title}" (ID: ${created.id})`);
    }
    
    console.log('\n🎉 Test articles added successfully!');
    console.log('\n📱 Testing Instructions:');
    console.log('1. Build and run the iOS app in Xcode');
    console.log('2. Test read button navigation by clicking "Read" on any article');
    console.log('3. Verify safe area padding around camera notch');
    console.log('4. Test sharing by sharing a URL from Safari/Chrome to Cocoa Reader');
    
  } catch (error) {
    console.error('❌ Error adding test articles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addTestArticlesForIOS();
