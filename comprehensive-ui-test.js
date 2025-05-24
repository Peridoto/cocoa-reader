// Comprehensive UI Test for AI Processing Functionality
// This script verifies that the AI processing buttons work correctly

async function comprehensiveUITest() {
    console.log('🧪 Starting Comprehensive UI Test for AI Processing...\n');

    // Wait for page to fully load
    await new Promise(resolve => setTimeout(resolve, 3000));

    const results = {
        pageLoaded: false,
        articlesFound: false,
        aiButtonsFound: false,
        buttonsFunctional: false,
        apiCallsWork: false,
        settingsAccessible: false,
        batchProcessingAvailable: false
    };

    try {
        // Test 1: Page Loading
        console.log('1️⃣ Testing page loading...');
        const appElement = document.querySelector('#__next') || document.querySelector('[data-reactroot]') || document.body;
        results.pageLoaded = !!appElement;
        console.log(`   ${results.pageLoaded ? '✅' : '❌'} Page loaded: ${results.pageLoaded}`);

        // Test 2: Articles Loading
        console.log('\n2️⃣ Testing articles loading...');
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for data fetch
        
        const articleElements = document.querySelectorAll(
            '[data-testid="article-card"], .article-card, article, [class*="article"]'
        );
        results.articlesFound = articleElements.length > 0;
        console.log(`   ${results.articlesFound ? '✅' : '❌'} Articles found: ${articleElements.length}`);

        // Test 3: AI Processing Buttons
        console.log('\n3️⃣ Testing AI processing buttons...');
        
        // Look for various button patterns
        const buttonSelectors = [
            'button[aria-label*="AI"]',
            'button[title*="AI"]',
            'button:has-text("Generate")',
            'button:has-text("Summary")',
            'button:has-text("Process")',
            '[data-testid*="ai"]',
            'button[class*="ai"]'
        ];

        let aiButtons = [];
        for (const selector of buttonSelectors) {
            try {
                const buttons = document.querySelectorAll(selector);
                aiButtons.push(...Array.from(buttons));
            } catch (e) {
                // Some selectors might not work in all browsers
            }
        }

        // Also search by text content
        const allButtons = document.querySelectorAll('button');
        const aiTextButtons = Array.from(allButtons).filter(btn => {
            const text = (btn.textContent || '').toLowerCase();
            const ariaLabel = (btn.getAttribute('aria-label') || '').toLowerCase();
            const title = (btn.getAttribute('title') || '').toLowerCase();
            return /ai|summary|process|generate/.test(text + ' ' + ariaLabel + ' ' + title);
        });

        aiButtons.push(...aiTextButtons);
        aiButtons = [...new Set(aiButtons)]; // Remove duplicates

        results.aiButtonsFound = aiButtons.length > 0;
        console.log(`   ${results.aiButtonsFound ? '✅' : '❌'} AI buttons found: ${aiButtons.length}`);

        if (aiButtons.length > 0) {
            console.log('   📋 Button details:');
            aiButtons.forEach((btn, index) => {
                console.log(`      ${index + 1}. "${btn.textContent?.trim()}" (${btn.disabled ? 'disabled' : 'enabled'})`);
            });
        }

        // Test 4: Button Functionality
        console.log('\n4️⃣ Testing button functionality...');
        
        if (aiButtons.length > 0) {
            const enabledButton = aiButtons.find(btn => !btn.disabled);
            
            if (enabledButton) {
                // Set up network monitoring
                const networkCalls = [];
                const originalFetch = window.fetch;
                
                window.fetch = function(...args) {
                    const url = typeof args[0] === 'string' ? args[0] : args[0].url;
                    networkCalls.push({
                        url: url,
                        method: args[1]?.method || 'GET',
                        timestamp: Date.now()
                    });
                    return originalFetch.apply(this, args);
                };

                try {
                    console.log(`   🖱️ Clicking button: "${enabledButton.textContent?.trim()}"`);
                    
                    const beforeText = enabledButton.textContent;
                    const beforeDisabled = enabledButton.disabled;
                    
                    enabledButton.click();
                    
                    // Wait for potential state changes and network calls
                    await new Promise(resolve => setTimeout(resolve, 5000));
                    
                    const afterText = enabledButton.textContent;
                    const afterDisabled = enabledButton.disabled;
                    
                    // Check for button state changes
                    const buttonChanged = beforeText !== afterText || beforeDisabled !== afterDisabled;
                    
                    // Check for API calls
                    const apiCalls = networkCalls.filter(call => 
                        call.url.includes('/api/') && 
                        (call.url.includes('process') || call.url.includes('ai'))
                    );
                    
                    results.buttonsFunctional = buttonChanged;
                    results.apiCallsWork = apiCalls.length > 0;
                    
                    console.log(`   ${results.buttonsFunctional ? '✅' : '❌'} Button state changed: ${buttonChanged}`);
                    console.log(`   ${results.apiCallsWork ? '✅' : '❌'} API calls made: ${apiCalls.length}`);
                    
                    if (apiCalls.length > 0) {
                        console.log('   📡 API calls:', apiCalls.map(call => `${call.method} ${call.url}`));
                    }
                    
                } finally {
                    // Restore fetch
                    window.fetch = originalFetch;
                }
            } else {
                console.log('   ❌ No enabled buttons found');
            }
        }

        // Test 5: Settings Access
        console.log('\n5️⃣ Testing settings access...');
        
        const settingsSelectors = [
            'button[aria-label*="Settings"]',
            'button[title*="Settings"]',
            'button:has-text("Settings")',
            '[data-testid*="settings"]',
            'button[class*="settings"]'
        ];

        let settingsButtons = [];
        for (const selector of settingsSelectors) {
            try {
                const buttons = document.querySelectorAll(selector);
                settingsButtons.push(...Array.from(buttons));
            } catch (e) {
                // Ignore selector errors
            }
        }

        // Also search by text content and icons
        const allButtons2 = document.querySelectorAll('button');
        const settingsTextButtons = Array.from(allButtons2).filter(btn => {
            const text = (btn.textContent || '').toLowerCase();
            const ariaLabel = (btn.getAttribute('aria-label') || '').toLowerCase();
            const title = (btn.getAttribute('title') || '').toLowerCase();
            return /settings|config|menu|⚙|gear/.test(text + ' ' + ariaLabel + ' ' + title) ||
                   btn.innerHTML.includes('⚙') || btn.innerHTML.includes('gear');
        });

        settingsButtons.push(...settingsTextButtons);
        settingsButtons = [...new Set(settingsButtons)];

        results.settingsAccessible = settingsButtons.length > 0;
        console.log(`   ${results.settingsAccessible ? '✅' : '❌'} Settings buttons found: ${settingsButtons.length}`);

        // Test 6: Batch Processing
        console.log('\n6️⃣ Testing batch processing availability...');
        
        if (settingsButtons.length > 0) {
            const settingsBtn = settingsButtons[0];
            console.log(`   🖱️ Clicking settings button: "${settingsBtn.textContent?.trim()}"`);
            
            settingsBtn.click();
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Look for batch processing options
            const batchSelectors = [
                'button:has-text("Process All")',
                'button:has-text("Batch")',
                '[data-testid*="batch"]',
                'button[class*="batch"]'
            ];

            let batchButtons = [];
            for (const selector of batchSelectors) {
                try {
                    const buttons = document.querySelectorAll(selector);
                    batchButtons.push(...Array.from(buttons));
                } catch (e) {
                    // Ignore selector errors
                }
            }

            const allButtons3 = document.querySelectorAll('button');
            const batchTextButtons = Array.from(allButtons3).filter(btn => {
                const text = (btn.textContent || '').toLowerCase();
                return /process all|batch|bulk/.test(text);
            });

            batchButtons.push(...batchTextButtons);
            batchButtons = [...new Set(batchButtons)];

            results.batchProcessingAvailable = batchButtons.length > 0;
            console.log(`   ${results.batchProcessingAvailable ? '✅' : '❌'} Batch processing found: ${batchButtons.length}`);
        }

    } catch (error) {
        console.error('❌ Test error:', error);
    }

    // Summary
    console.log('\n📊 Test Results Summary:');
    console.table(results);

    const passedTests = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;
    
    console.log(`\n${passedTests === totalTests ? '🎉' : '⚠️'} Overall: ${passedTests}/${totalTests} tests passed`);

    if (passedTests === totalTests) {
        console.log('✅ All UI functionality is working correctly!');
    } else {
        console.log('❌ Some functionality may have issues. Check the failed tests above.');
    }

    return results;
}

// Auto-run test after page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(comprehensiveUITest, 2000);
    });
} else {
    setTimeout(comprehensiveUITest, 2000);
}

// Export for manual use
window.comprehensiveUITest = comprehensiveUITest;

console.log('🔧 UI Test Script loaded. Test will run automatically in 2 seconds.');
console.log('💡 Run manually with: comprehensiveUITest()');
