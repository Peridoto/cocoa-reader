#!/usr/bin/env node

// Verification script for Coco Reader new features
const fetch = require('node-fetch');

async function verifyFeatures() {
    console.log('🥥 COCO READER - FEATURE VERIFICATION');
    console.log('====================================\n');

    try {
        // Test 1: Verify app is running and shows correct name
        console.log('1. 📱 Testing App Name Change...');
        const response = await fetch('http://localhost:3001');
        const html = await response.text();
        
        const hasCocoReader = html.includes('Coco Reader');
        const hasOldName = html.includes('Cocoa Reader');
        
        console.log(`   ✅ Contains "Coco Reader": ${hasCocoReader}`);
        console.log(`   ✅ No "Cocoa Reader" references: ${!hasOldName}`);

        // Test 2: Check for Statistics component
        console.log('\n2. 📊 Testing Statistics Component...');
        const hasStatistics = html.includes('Statistics') || html.includes('min read') || html.includes('articles read');
        console.log(`   ${hasStatistics ? '✅' : '❌'} Statistics component present: ${hasStatistics}`);

        // Test 3: Check for Coffee button
        console.log('\n3. ☕ Testing Coffee Donation Button...');
        const hasCoffeeButton = html.includes('☕') || html.includes('coffee') || html.includes('buymeacoffee');
        console.log(`   ${hasCoffeeButton ? '✅' : '❌'} Coffee button present: ${hasCoffeeButton}`);

        // Test 4: Check for shake animation CSS
        console.log('\n4. 🎨 Testing Shake Animation...');
        const animationResponse = await fetch('http://localhost:3001/_next/static/css/app/globals.css');
        if (animationResponse.ok) {
            const css = await animationResponse.text();
            const hasShakeAnimation = css.includes('@keyframes shake') || css.includes('shake');
            console.log(`   ${hasShakeAnimation ? '✅' : '❌'} Shake animation CSS: ${hasShakeAnimation}`);
        } else {
            console.log('   ⚠️  Could not fetch CSS file');
        }

        console.log('\n🎯 VERIFICATION COMPLETE!');
        console.log('========================');

    } catch (error) {
        console.error('❌ Error during verification:', error.message);
    }
}

verifyFeatures();
