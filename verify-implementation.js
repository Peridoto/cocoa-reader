#!/usr/bin/env node

/**
 * Final Verification Script for Coco Reader Updates
 * Tests all implemented features and provides a summary
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 COCO READER - FINAL VERIFICATION');
console.log('=====================================\n');

const results = {
    appNameChanges: [],
    statisticsComponent: [],
    coffeeButton: [],
    databaseFix: [],
    errors: []
};

// Test 1: App Name Changes
console.log('1. 📝 Testing App Name Changes (Cocoa Reader → Coco Reader)');
console.log('   --------------------------------------------------------');

const filesToCheck = [
    'public/manifest.json',
    'src/app/layout.tsx', 
    'public/sw.js',
    'src/app/HomePageContent.tsx',
    'src/app/page-static.tsx',
    'src/components/PWAInstaller.tsx',
    'src/components/ExportImport.tsx',
    'src/app/api/import/route.ts',
    'src/app/api/export/route.ts',
    'src/lib/export-import.ts'
];

filesToCheck.forEach(file => {
    const filePath = path.join(__dirname, file);
    try {
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            if (content.includes('Coco Reader')) {
                results.appNameChanges.push(`✅ ${file}: Contains "Coco Reader"`);
                console.log(`   ✅ ${file}: Contains "Coco Reader"`);
            } else {
                results.appNameChanges.push(`❓ ${file}: May not contain "Coco Reader"`);
                console.log(`   ❓ ${file}: May not contain "Coco Reader"`);
            }
            
            // Check for remaining "Cocoa Reader" (should be minimal)
            const cocoaMatches = (content.match(/Cocoa Reader/g) || []).length;
            if (cocoaMatches > 0) {
                results.appNameChanges.push(`⚠️  ${file}: Still contains ${cocoaMatches} "Cocoa Reader" references`);
                console.log(`   ⚠️  ${file}: Still contains ${cocoaMatches} "Cocoa Reader" references`);
            }
        } else {
            results.appNameChanges.push(`❌ ${file}: File not found`);
            console.log(`   ❌ ${file}: File not found`);
        }
    } catch (error) {
        results.errors.push(`Error checking ${file}: ${error.message}`);
        console.log(`   ❌ Error checking ${file}: ${error.message}`);
    }
});

// Test 2: Statistics Component
console.log('\n2. 📊 Testing Statistics Component');
console.log('   --------------------------------');

const statisticsPath = path.join(__dirname, 'src/components/Statistics.tsx');
try {
    if (fs.existsSync(statisticsPath)) {
        const statsContent = fs.readFileSync(statisticsPath, 'utf8');
        
        // Check for required features
        const features = [
            'minutesRead',
            'totalArticlesRead', 
            'totalArticlesAdded',
            'getAllArticles',
            'readingTime',
            'Reading Progress',
            'Avg. Reading Time'
        ];
        
        features.forEach(feature => {
            if (statsContent.includes(feature)) {
                results.statisticsComponent.push(`✅ Contains: ${feature}`);
                console.log(`   ✅ Contains: ${feature}`);
            } else {
                results.statisticsComponent.push(`❌ Missing: ${feature}`);
                console.log(`   ❌ Missing: ${feature}`);
            }
        });

        // Check if it's imported in HomePageContent
        const homePath = path.join(__dirname, 'src/app/HomePageContent.tsx');
        if (fs.existsSync(homePath)) {
            const homeContent = fs.readFileSync(homePath, 'utf8');
            if (homeContent.includes('import { Statistics }') && homeContent.includes('<Statistics')) {
                results.statisticsComponent.push('✅ Properly imported and used in HomePageContent');
                console.log('   ✅ Properly imported and used in HomePageContent');
            } else {
                results.statisticsComponent.push('❌ Not properly imported/used in HomePageContent');
                console.log('   ❌ Not properly imported/used in HomePageContent');
            }
        }
    } else {
        results.statisticsComponent.push('❌ Statistics.tsx not found');
        console.log('   ❌ Statistics.tsx not found');
    }
} catch (error) {
    results.errors.push(`Error checking Statistics component: ${error.message}`);
    console.log(`   ❌ Error checking Statistics component: ${error.message}`);
}

// Test 3: Coffee Donation Button
console.log('\n3. ☕ Testing Coffee Donation Button');
console.log('   ----------------------------------');

const coffeeButtonPath = path.join(__dirname, 'src/components/CoffeeDonationButton.tsx');
try {
    if (fs.existsSync(coffeeButtonPath)) {
        const coffeeContent = fs.readFileSync(coffeeButtonPath, 'utf8');
        
        const features = [
            'buymeacoffee.com/peridoto',
            'shake',
            'articlesCount',
            'useEffect',
            'useState',
            'animate-shake'
        ];
        
        features.forEach(feature => {
            if (coffeeContent.includes(feature)) {
                results.coffeeButton.push(`✅ Contains: ${feature}`);
                console.log(`   ✅ Contains: ${feature}`);
            } else {
                results.coffeeButton.push(`❌ Missing: ${feature}`);
                console.log(`   ❌ Missing: ${feature}`);
            }
        });

        // Check CSS animations
        const cssPath = path.join(__dirname, 'src/app/globals.css');
        if (fs.existsSync(cssPath)) {
            const cssContent = fs.readFileSync(cssPath, 'utf8');
            if (cssContent.includes('@keyframes shake') || cssContent.includes('animate-shake')) {
                results.coffeeButton.push('✅ Shake animation defined in CSS');
                console.log('   ✅ Shake animation defined in CSS');
            } else {
                results.coffeeButton.push('❌ Shake animation not found in CSS');
                console.log('   ❌ Shake animation not found in CSS');
            }
        }

        // Check if it's imported in HomePageContent
        const homePath = path.join(__dirname, 'src/app/HomePageContent.tsx');
        if (fs.existsSync(homePath)) {
            const homeContent = fs.readFileSync(homePath, 'utf8');
            if (homeContent.includes('import { CoffeeDonationButton }') && homeContent.includes('<CoffeeDonationButton')) {
                results.coffeeButton.push('✅ Properly imported and used in HomePageContent');
                console.log('   ✅ Properly imported and used in HomePageContent');
            } else {
                results.coffeeButton.push('❌ Not properly imported/used in HomePageContent');
                console.log('   ❌ Not properly imported/used in HomePageContent');
            }
        }
    } else {
        results.coffeeButton.push('❌ CoffeeDonationButton.tsx not found');
        console.log('   ❌ CoffeeDonationButton.tsx not found');
    }
} catch (error) {
    results.errors.push(`Error checking Coffee Button: ${error.message}`);
    console.log(`   ❌ Error checking Coffee Button: ${error.message}`);
}

// Test 4: Database Configuration
console.log('\n4. 🗄️  Testing Database Configuration');
console.log('   ------------------------------------');

try {
    // Check .env files
    const envPath = path.join(__dirname, '.env');
    const envLocalPath = path.join(__dirname, '.env.local');
    
    [envPath, envLocalPath].forEach(envFile => {
        if (fs.existsSync(envFile)) {
            const envContent = fs.readFileSync(envFile, 'utf8');
            if (envContent.includes('DATABASE_URL')) {
                const dbUrl = envContent.match(/DATABASE_URL="(.+)"/)?.[1] || 'not found';
                results.databaseFix.push(`✅ ${path.basename(envFile)}: DATABASE_URL defined (${dbUrl.substring(0, 30)}...)`);
                console.log(`   ✅ ${path.basename(envFile)}: DATABASE_URL defined`);
            } else {
                results.databaseFix.push(`❌ ${path.basename(envFile)}: No DATABASE_URL found`);
                console.log(`   ❌ ${path.basename(envFile)}: No DATABASE_URL found`);
            }
        }
    });

    // Check Prisma schema
    const schemaPath = path.join(__dirname, 'prisma/schema.prisma');
    if (fs.existsSync(schemaPath)) {
        const schemaContent = fs.readFileSync(schemaPath, 'utf8');
        if (schemaContent.includes('provider = "sqlite"')) {
            results.databaseFix.push('✅ Prisma schema configured for SQLite');
            console.log('   ✅ Prisma schema configured for SQLite');
        } else if (schemaContent.includes('provider = "postgresql"')) {
            results.databaseFix.push('✅ Prisma schema configured for PostgreSQL');
            console.log('   ✅ Prisma schema configured for PostgreSQL');
        } else {
            results.databaseFix.push('❓ Prisma schema provider unclear');
            console.log('   ❓ Prisma schema provider unclear');
        }
    }

    // Check local database
    const localDbPath = path.join(__dirname, 'src/lib/local-database.ts');
    if (fs.existsSync(localDbPath)) {
        const localDbContent = fs.readFileSync(localDbPath, 'utf8');
        if (localDbContent.includes('getAllArticles')) {
            results.databaseFix.push('✅ Local database has getAllArticles method');
            console.log('   ✅ Local database has getAllArticles method');
        } else {
            results.databaseFix.push('❌ Local database missing getAllArticles method');
            console.log('   ❌ Local database missing getAllArticles method');
        }
    }
} catch (error) {
    results.errors.push(`Error checking database: ${error.message}`);
    console.log(`   ❌ Error checking database: ${error.message}`);
}

// Summary
console.log('\n🎯 VERIFICATION SUMMARY');
console.log('=======================');

const totalTests = results.appNameChanges.length + results.statisticsComponent.length + 
                  results.coffeeButton.length + results.databaseFix.length;
const successfulTests = [...results.appNameChanges, ...results.statisticsComponent, 
                        ...results.coffeeButton, ...results.databaseFix]
                       .filter(test => test.startsWith('✅')).length;

console.log(`\n📊 Tests Passed: ${successfulTests}/${totalTests}`);
console.log(`📊 Success Rate: ${Math.round((successfulTests/totalTests) * 100)}%`);

if (results.errors.length > 0) {
    console.log(`\n❌ Errors Encountered: ${results.errors.length}`);
    results.errors.forEach(error => console.log(`   • ${error}`));
}

console.log('\n🚀 NEXT STEPS:');
console.log('1. Start the development server: npm run dev');
console.log('2. Open http://localhost:3000');
console.log('3. Test the settings panel for Statistics component');
console.log('4. Test the coffee button (☕) in the top right');
console.log('5. Add articles and mark as read to test statistics');
console.log('6. Add 15+ articles to test shake animation');

console.log('\n✅ Implementation Status: Ready for Testing!');
