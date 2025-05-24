// UI Functionality Test Script for Cocoa Reader AI Processing
// Run this in the browser console after the app loads

console.log('🧪 Starting UI Functionality Test for AI Processing...');

// Test 1: Check if articles are loaded with AI processing data
async function testArticlesLoaded() {
    console.log('\n📄 Test 1: Checking if articles are loaded...');
    
    // Wait for articles to load
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const articleCards = document.querySelectorAll('[data-testid="article-card"], .article-card');
    console.log(`Found ${articleCards.length} article cards`);
    
    if (articleCards.length === 0) {
        console.warn('⚠️ No article cards found. Make sure articles are loaded.');
        return false;
    }
    
    return true;
}

// Test 2: Check for AI processing buttons
async function testAIProcessingButtons() {
    console.log('\n🤖 Test 2: Checking for AI processing buttons...');
    
    const aiButtons = document.querySelectorAll('button[aria-label*="AI"], button[title*="AI"], button:has-text("Generate AI Summary"), [data-testid*="ai-process"]');
    console.log(`Found ${aiButtons.length} potential AI processing buttons`);
    
    // Look for buttons with AI-related text
    const allButtons = document.querySelectorAll('button');
    const aiRelatedButtons = Array.from(allButtons).filter(btn => {
        const text = btn.textContent || '';
        const ariaLabel = btn.getAttribute('aria-label') || '';
        const title = btn.getAttribute('title') || '';
        return /AI|summary|process/i.test(text + ariaLabel + title);
    });
    
    console.log(`Found ${aiRelatedButtons.length} AI-related buttons:`, aiRelatedButtons.map(btn => ({
        text: btn.textContent,
        ariaLabel: btn.getAttribute('aria-label'),
        classes: btn.className,
        disabled: btn.disabled
    })));
    
    return aiRelatedButtons;
}

// Test 3: Test individual AI processing button click
async function testIndividualAIProcessing() {
    console.log('\n⚡ Test 3: Testing individual AI processing...');
    
    const aiButtons = await testAIProcessingButtons();
    
    if (aiButtons.length === 0) {
        console.warn('⚠️ No AI processing buttons found');
        return false;
    }
    
    // Find a button that's not disabled
    const enabledButton = aiButtons.find(btn => !btn.disabled);
    
    if (!enabledButton) {
        console.warn('⚠️ All AI processing buttons are disabled');
        return false;
    }
    
    console.log('🎯 Found enabled AI processing button:', {
        text: enabledButton.textContent,
        ariaLabel: enabledButton.getAttribute('aria-label')
    });
    
    // Monitor network requests
    const originalFetch = window.fetch;
    let apiCalls = [];
    
    window.fetch = function(...args) {
        apiCalls.push({
            url: args[0],
            options: args[1],
            timestamp: new Date().toISOString()
        });
        return originalFetch.apply(this, args);
    };
    
    // Click the button
    console.log('🖱️ Clicking AI processing button...');
    enabledButton.click();
    
    // Wait for potential API calls
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Restore fetch
    window.fetch = originalFetch;
    
    console.log('📡 API calls made:', apiCalls.filter(call => 
        typeof call.url === 'string' && call.url.includes('/api/')
    ));
    
    // Check if button state changed
    console.log('🔄 Button state after click:', {
        disabled: enabledButton.disabled,
        text: enabledButton.textContent
    });
    
    return apiCalls.length > 0;
}

// Test 4: Check for batch processing functionality
async function testBatchProcessing() {
    console.log('\n📦 Test 4: Checking for batch processing...');
    
    // Look for settings or batch processing UI
    const settingsButtons = document.querySelectorAll('button[aria-label*="Settings"], button[title*="Settings"], [data-testid*="settings"]');
    const batchButtons = document.querySelectorAll('button:has-text("Process All"), button:has-text("Batch"), [data-testid*="batch"]');
    
    console.log(`Found ${settingsButtons.length} settings buttons`);
    console.log(`Found ${batchButtons.length} batch processing buttons`);
    
    // Try to find and click settings to access batch processing
    if (settingsButtons.length > 0) {
        console.log('🖱️ Clicking settings button...');
        settingsButtons[0].click();
        
        // Wait for settings panel to open
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Look for batch processing in settings
        const batchInSettings = document.querySelectorAll('button:has-text("Process All"), button:has-text("Batch"), [data-testid*="batch"]');
        console.log(`Found ${batchInSettings.length} batch processing options in settings`);
        
        return batchInSettings.length > 0;
    }
    
    return batchButtons.length > 0;
}

// Test 5: Check for AI summaries display
async function testAISummariesDisplay() {
    console.log('\n📋 Test 5: Checking for AI summaries display...');
    
    // Look for articles that might have AI summaries
    const summaryElements = document.querySelectorAll('[data-testid*="ai-summary"], .ai-summary, .summary');
    console.log(`Found ${summaryElements.length} potential AI summary elements`);
    
    // Look for processed articles (articles with AI data)
    const processedIndicators = document.querySelectorAll('[data-testid*="processed"], .ai-processed, .processed');
    console.log(`Found ${processedIndicators.length} processed article indicators`);
    
    return summaryElements.length > 0 || processedIndicators.length > 0;
}

// Run all tests
async function runAllTests() {
    console.log('🚀 Running comprehensive UI functionality tests...\n');
    
    const results = {
        articlesLoaded: await testArticlesLoaded(),
        aiButtonsFound: (await testAIProcessingButtons()).length > 0,
        individualProcessingWorks: await testIndividualAIProcessing(),
        batchProcessingAvailable: await testBatchProcessing(),
        aiSummariesVisible: await testAISummariesDisplay()
    };
    
    console.log('\n📊 Test Results Summary:');
    console.table(results);
    
    const passedTests = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;
    
    console.log(`\n✅ ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
        console.log('🎉 All tests passed! AI processing functionality is working correctly.');
    } else {
        console.log('⚠️ Some tests failed. There may be issues with AI processing functionality.');
    }
    
    return results;
}

// Auto-run tests after a short delay
setTimeout(() => {
    runAllTests().catch(console.error);
}, 2000);

// Export functions for manual testing
window.uiTests = {
    runAllTests,
    testArticlesLoaded,
    testAIProcessingButtons,
    testIndividualAIProcessing,
    testBatchProcessing,
    testAISummariesDisplay
};

console.log('📝 Test script loaded. Tests will run automatically in 2 seconds.');
console.log('💡 You can also run individual tests manually using window.uiTests.*');
