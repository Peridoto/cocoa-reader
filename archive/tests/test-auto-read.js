#!/usr/bin/env node

/**
 * Test script to verify auto-read functionality
 * This script tests if articles are automatically marked as read when reaching 100% progress
 */

const readline = require('readline');

async function testAutoReadFunctionality() {
    console.log('🧪 Testing Auto-Read Functionality');
    console.log('=====================================\n');

    const baseUrl = 'http://localhost:3000';
    
    try {
        // Test 1: Create a test article
        console.log('1. Creating a test article...');
        const createResponse = await fetch(`${baseUrl}/api/article`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                url: 'https://example.com/test-auto-read-article' 
            })
        });
        
        if (!createResponse.ok) {
            throw new Error('Failed to create test article');
        }
        
        const article = await createResponse.json();
        console.log(`✅ Test article created with ID: ${article.id}`);
        console.log(`   Title: ${article.title}`);
        console.log(`   Initial read status: ${article.read}`);
        console.log(`   Initial scroll progress: ${article.scroll}%\n`);

        // Test 2: Update scroll progress to various percentages
        const progressSteps = [25, 50, 75, 95, 100];
        
        for (const progress of progressSteps) {
            console.log(`2. Setting scroll progress to ${progress}%...`);
            
            const updateResponse = await fetch(`${baseUrl}/api/article/${article.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ scroll: progress })
            });
            
            if (!updateResponse.ok) {
                throw new Error(`Failed to update scroll progress to ${progress}%`);
            }
            
            const updatedArticle = await updateResponse.json();
            console.log(`   Progress: ${updatedArticle.scroll}%`);
            console.log(`   Read status: ${updatedArticle.read}`);
            
            if (progress === 100) {
                if (updatedArticle.read) {
                    console.log('✅ SUCCESS: Article automatically marked as read at 100%!\n');
                } else {
                    console.log('❌ FAILED: Article not automatically marked as read at 100%\n');
                }
            } else {
                if (!updatedArticle.read) {
                    console.log(`✅ Correct: Article not marked as read at ${progress}%`);
                } else {
                    console.log(`⚠️  Warning: Article already marked as read at ${progress}%`);
                }
            }
            console.log('');
        }

        // Test 3: Verify the functionality works in the reading page
        console.log('3. Testing reading page integration...');
        console.log(`📖 Open this URL to test the reading experience:`);
        console.log(`   ${baseUrl}/read/${article.id}\n`);
        console.log('📋 Manual testing steps:');
        console.log('   1. Open the article in your browser');
        console.log('   2. Scroll to the bottom of the article');
        console.log('   3. Verify the progress bar shows 100%');
        console.log('   4. Check if the article is automatically marked as "Read"');
        console.log('   5. Look for the green notification message\n');

        // Cleanup
        console.log('4. Cleaning up test article...');
        const deleteResponse = await fetch(`${baseUrl}/api/article/${article.id}`, {
            method: 'DELETE'
        });
        
        if (deleteResponse.ok) {
            console.log('✅ Test article cleaned up successfully');
        } else {
            console.log('⚠️  Warning: Failed to clean up test article');
        }

        console.log('\n🎉 Auto-read functionality test completed!');
        console.log('📝 The automatic marking should work when:');
        console.log('   - User scrolls to 100% progress in the reading page');
        console.log('   - Article is not already marked as read');
        console.log('   - A green notification appears confirming the action');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('   1. Make sure the development server is running');
        console.log('   2. Check that the database is properly set up');
        console.log('   3. Verify the API endpoints are working');
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
    await testAutoReadFunctionality();
}

// Run the test
if (require.main === module) {
    main().catch(console.error);
}
