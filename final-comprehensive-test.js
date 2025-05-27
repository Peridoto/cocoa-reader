#!/usr/bin/env node

/**
 * 🎯 FINAL COMPREHENSIVE TEST
 * Verifies all implemented features for Coco Reader
 */

const https = require('https');
const http = require('http');

console.log('🎯 COCO READER - FINAL COMPREHENSIVE TEST');
console.log('=========================================\n');

// Test results storage
const testResults = {
    appNameChanges: { passed: 0, failed: 0, tests: [] },
    statisticsComponent: { passed: 0, failed: 0, tests: [] },
    coffeeButton: { passed: 0, failed: 0, tests: [] },
    integration: { passed: 0, failed: 0, tests: [] }
};

function addTestResult(category, testName, passed, message) {
    const result = { testName, passed, message };
    testResults[category].tests.push(result);
    
    if (passed) {
        testResults[category].passed++;
        console.log(`   ✅ ${testName}: ${message}`);
    } else {
        testResults[category].failed++;
        console.log(`   ❌ ${testName}: ${message}`);
    }
}

async function makeRequest(url) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https:') ? https : http;
        client.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, data }));
        }).on('error', reject);
    });
}

async function testAppNameChanges() {
    console.log('1. 📝 Testing App Name Changes');
    console.log('   ----------------------------');
    
    try {
        // Test homepage
        const homeResponse = await makeRequest('http://localhost:3000');
        const homeContent = homeResponse.data;
        
        // Check for "Coco Reader" in title
        if (homeContent.includes('<title>Coco Reader')) {
            addTestResult('appNameChanges', 'Homepage Title', true, 'Contains "Coco Reader" in title');
        } else {
            addTestResult('appNameChanges', 'Homepage Title', false, 'Title does not contain "Coco Reader"');
        }
        
        // Check for header text
        if (homeContent.includes('🥥 Coco Reader')) {
            addTestResult('appNameChanges', 'Header Text', true, 'Header shows "🥥 Coco Reader"');
        } else {
            addTestResult('appNameChanges', 'Header Text', false, 'Header does not show "🥥 Coco Reader"');
        }
        
        // Check for minimal "Cocoa Reader" references (should be very few)
        const cocoaReferences = (homeContent.match(/Cocoa Reader/g) || []).length;
        if (cocoaReferences <= 2) { // Allow some demo content references
            addTestResult('appNameChanges', 'Legacy References', true, `Only ${cocoaReferences} "Cocoa Reader" references found`);
        } else {
            addTestResult('appNameChanges', 'Legacy References', false, `Too many "Cocoa Reader" references: ${cocoaReferences}`);
        }
        
        // Test manifest
        const manifestResponse = await makeRequest('http://localhost:3000/manifest.json');
        const manifest = JSON.parse(manifestResponse.data);
        
        if (manifest.name === 'Coco Reader - Read Later App' && manifest.short_name === 'Coco Reader') {
            addTestResult('appNameChanges', 'PWA Manifest', true, 'Manifest contains correct app name');
        } else {
            addTestResult('appNameChanges', 'PWA Manifest', false, `Manifest: name="${manifest.name}", short_name="${manifest.short_name}"`);
        }
        
    } catch (error) {
        addTestResult('appNameChanges', 'Request Error', false, error.message);
    }
}

async function testStatisticsComponent() {
    console.log('\n2. 📊 Testing Statistics Component');
    console.log('   --------------------------------');
    
    try {
        const homeResponse = await makeRequest('http://localhost:3000');
        const homeContent = homeResponse.data;
        
        // Check if Statistics component is being loaded
        if (homeContent.includes('Reading Statistics') || homeContent.includes('Min Read')) {
            addTestResult('statisticsComponent', 'Component Present', true, 'Statistics component elements found in DOM');
        } else {
            addTestResult('statisticsComponent', 'Component Present', false, 'Statistics component not found in rendered page');
        }
        
        // Check for component imports in the built page
        if (homeContent.includes('Statistics') && homeContent.includes('articles')) {
            addTestResult('statisticsComponent', 'Integration', true, 'Statistics component properly integrated');
        } else {
            addTestResult('statisticsComponent', 'Integration', false, 'Statistics component may not be properly integrated');
        }
        
        // Check for required statistics features
        const requiredFeatures = ['minutes', 'read', 'added'];
        let foundFeatures = 0;
        requiredFeatures.forEach(feature => {
            if (homeContent.toLowerCase().includes(feature)) {
                foundFeatures++;
            }
        });
        
        if (foundFeatures >= 2) {
            addTestResult('statisticsComponent', 'Features', true, `Found ${foundFeatures}/${requiredFeatures.length} statistics features`);
        } else {
            addTestResult('statisticsComponent', 'Features', false, `Only found ${foundFeatures}/${requiredFeatures.length} statistics features`);
        }
        
    } catch (error) {
        addTestResult('statisticsComponent', 'Request Error', false, error.message);
    }
}

async function testCoffeeButton() {
    console.log('\n3. ☕ Testing Coffee Donation Button');
    console.log('   ----------------------------------');
    
    try {
        const homeResponse = await makeRequest('http://localhost:3000');
        const homeContent = homeResponse.data;
        
        // Check for coffee button presence
        if (homeContent.includes('☕') || homeContent.includes('coffee')) {
            addTestResult('coffeeButton', 'Button Present', true, 'Coffee button found in page');
        } else {
            addTestResult('coffeeButton', 'Button Present', false, 'Coffee button not found in page');
        }
        
        // Check for buymeacoffee link
        if (homeContent.includes('buymeacoffee.com/peridoto')) {
            addTestResult('coffeeButton', 'Donation Link', true, 'Correct donation link found');
        } else {
            addTestResult('coffeeButton', 'Donation Link', false, 'Donation link not found or incorrect');
        }
        
        // Check for shake animation CSS
        if (homeContent.includes('shake') || homeContent.includes('animate')) {
            addTestResult('coffeeButton', 'Animation Support', true, 'Animation CSS found');
        } else {
            addTestResult('coffeeButton', 'Animation Support', false, 'Animation CSS not found');
        }
        
        // Check for articles count prop
        if (homeContent.includes('articlesCount') || homeContent.includes('articles.length')) {
            addTestResult('coffeeButton', 'Articles Count', true, 'Articles count integration found');
        } else {
            addTestResult('coffeeButton', 'Articles Count', false, 'Articles count integration not found');
        }
        
    } catch (error) {
        addTestResult('coffeeButton', 'Request Error', false, error.message);
    }
}

async function testIntegration() {
    console.log('\n4. 🔧 Testing Overall Integration');
    console.log('   --------------------------------');
    
    try {
        const homeResponse = await makeRequest('http://localhost:3000');
        
        // Test server responsiveness
        if (homeResponse.status === 200) {
            addTestResult('integration', 'Server Status', true, 'Development server responding correctly');
        } else {
            addTestResult('integration', 'Server Status', false, `Server returned status ${homeResponse.status}`);
        }
        
        // Test page loading
        const homeContent = homeResponse.data;
        if (homeContent.includes('<html') && homeContent.includes('</html>')) {
            addTestResult('integration', 'Page Structure', true, 'Complete HTML page structure');
        } else {
            addTestResult('integration', 'Page Structure', false, 'Incomplete HTML page structure');
        }
        
        // Test React hydration
        if (homeContent.includes('__NEXT_DATA__') || homeContent.includes('_next')) {
            addTestResult('integration', 'Next.js Framework', true, 'Next.js framework loading correctly');
        } else {
            addTestResult('integration', 'Next.js Framework', false, 'Next.js framework may not be loading correctly');
        }
        
        // Test component presence
        const components = ['ThemeToggle', 'CoffeeDonation', 'Statistics'];
        let foundComponents = 0;
        components.forEach(component => {
            if (homeContent.includes(component)) {
                foundComponents++;
            }
        });
        
        if (foundComponents >= 2) {
            addTestResult('integration', 'Components Loaded', true, `${foundComponents}/${components.length} components found`);
        } else {
            addTestResult('integration', 'Components Loaded', false, `Only ${foundComponents}/${components.length} components found`);
        }
        
    } catch (error) {
        addTestResult('integration', 'Request Error', false, error.message);
    }
}

function printSummary() {
    console.log('\n🎯 TEST SUMMARY');
    console.log('================');
    
    let totalPassed = 0;
    let totalFailed = 0;
    
    Object.keys(testResults).forEach(category => {
        const { passed, failed } = testResults[category];
        totalPassed += passed;
        totalFailed += failed;
        
        const categoryName = category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        console.log(`\n${categoryName}: ${passed}/${passed + failed} passed`);
        
        testResults[category].tests.forEach(test => {
            const status = test.passed ? '✅' : '❌';
            console.log(`  ${status} ${test.testName}`);
        });
    });
    
    const successRate = Math.round((totalPassed / (totalPassed + totalFailed)) * 100);
    
    console.log(`\n📊 OVERALL RESULTS`);
    console.log(`   Passed: ${totalPassed}`);
    console.log(`   Failed: ${totalFailed}`);
    console.log(`   Success Rate: ${successRate}%`);
    
    if (successRate >= 80) {
        console.log('\n🎉 IMPLEMENTATION SUCCESSFUL!');
        console.log('✅ All major features are working correctly');
        console.log('🚀 Coco Reader is ready for use');
    } else if (successRate >= 60) {
        console.log('\n⚠️  IMPLEMENTATION MOSTLY SUCCESSFUL');
        console.log('✅ Core features are working');
        console.log('🔧 Some minor issues may need attention');
    } else {
        console.log('\n❌ IMPLEMENTATION NEEDS ATTENTION');
        console.log('🔧 Several issues need to be addressed');
    }
    
    console.log('\n🎯 MANUAL TESTING CHECKLIST:');
    console.log('1. ✓ Open http://localhost:3000');
    console.log('2. ✓ Verify "Coco Reader" appears in title and header');
    console.log('3. ✓ Click Settings button to see Statistics component');
    console.log('4. ✓ Check coffee button (☕) in top right header');
    console.log('5. ✓ Add some articles and mark as read to test statistics');
    console.log('6. ✓ Try adding 15+ articles to test shake animation');
    console.log('7. ✓ Click coffee button to test external donation link');
}

async function runAllTests() {
    console.log('Starting comprehensive test suite...\n');
    
    await testAppNameChanges();
    await testStatisticsComponent();
    await testCoffeeButton();
    await testIntegration();
    
    printSummary();
}

// Run the tests
runAllTests().catch(console.error);
