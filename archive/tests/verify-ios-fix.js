#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Verifying iOS fixes...\n');

// Check 1: Verify Swift compilation works
console.log('1. Checking Swift compilation...');
try {
  const result = execSync('xcodebuild -workspace ios/App/App.xcworkspace -scheme App -destination "platform=iOS Simulator,name=iPhone 15" clean build', 
    { cwd: process.cwd(), encoding: 'utf8', timeout: 120000 });
  
  if (result.includes('BUILD SUCCEEDED')) {
    console.log('   ✅ Swift compilation successful');
  } else {
    console.log('   ⚠️  Build completed but check output for warnings');
  }
} catch (error) {
  if (error.stdout && error.stdout.includes('BUILD SUCCEEDED')) {
    console.log('   ✅ Swift compilation successful');
  } else {
    console.log('   ❌ Swift compilation failed');
    console.log('   Error:', error.message.split('\n')[0]);
  }
}

// Check 2: Verify app assets are properly synced
console.log('\n2. Checking app assets...');
const publicDir = path.join(process.cwd(), 'ios/App/App/public');
const indexPath = path.join(publicDir, 'index.html');
const manifestPath = path.join(publicDir, 'manifest.json');
const nextDir = path.join(publicDir, '_next');

if (fs.existsSync(indexPath)) {
  const indexSize = fs.statSync(indexPath).size;
  console.log(`   ✅ index.html exists (${(indexSize/1024).toFixed(1)}KB)`);
} else {
  console.log('   ❌ index.html missing');
}

if (fs.existsSync(manifestPath)) {
  console.log('   ✅ manifest.json exists');
} else {
  console.log('   ❌ manifest.json missing');
}

if (fs.existsSync(nextDir)) {
  console.log('   ✅ _next directory exists');
} else {
  console.log('   ❌ _next directory missing');
}

// Check 3: Verify AppDelegate.swift has correct syntax
console.log('\n3. Checking AppDelegate.swift...');
const appDelegatePath = path.join(process.cwd(), 'ios/App/App/AppDelegate.swift');
if (fs.existsSync(appDelegatePath)) {
  const content = fs.readFileSync(appDelegatePath, 'utf8');
  
  if (!content.includes('#unavailable(iOS 13.0)')) {
    console.log('   ✅ No problematic #unavailable syntax');
  } else {
    console.log('   ❌ Still contains #unavailable(iOS 13.0)');
  }
  
  if (!content.includes('CAPBridge()') && !content.includes('bridge.viewController')) {
    console.log('   ✅ No problematic CAPBridge API usage');
  } else {
    console.log('   ❌ Still contains problematic CAPBridge usage');
  }
  
  if (content.includes('UIStoryboard') && content.includes('instantiateInitialViewController')) {
    console.log('   ✅ Uses proper storyboard-based initialization');
  } else {
    console.log('   ⚠️  Check storyboard initialization');
  }
} else {
  console.log('   ❌ AppDelegate.swift not found');
}

// Check 4: Verify Capacitor configuration
console.log('\n4. Checking Capacitor configuration...');
const capacitorConfigPath = path.join(process.cwd(), 'capacitor.config.ts');
if (fs.existsSync(capacitorConfigPath)) {
  const content = fs.readFileSync(capacitorConfigPath, 'utf8');
  
  if (content.includes('webDir: \'out\'')) {
    console.log('   ✅ webDir points to \'out\'');
  } else {
    console.log('   ❌ webDir not set to \'out\'');
  }
  
  if (content.includes('cleartext: true')) {
    console.log('   ✅ cleartext enabled for local loading');
  } else {
    console.log('   ⚠️  cleartext not enabled');
  }
} else {
  console.log('   ❌ capacitor.config.ts not found');
}

// Check 5: Verify Next.js configuration
console.log('\n5. Checking Next.js configuration...');
const nextConfigPath = path.join(process.cwd(), 'next.config.js');
if (fs.existsSync(nextConfigPath)) {
  const content = fs.readFileSync(nextConfigPath, 'utf8');
  
  if (content.includes('output: \'export\'')) {
    console.log('   ✅ Static export enabled');
  } else {
    console.log('   ❌ Static export not enabled');
  }
  
  if (content.includes('trailingSlash: true')) {
    console.log('   ✅ Trailing slash enabled');
  } else {
    console.log('   ⚠️  Trailing slash not enabled');
  }
  
  if (content.includes('unoptimized: true')) {
    console.log('   ✅ Image optimization disabled');
  } else {
    console.log('   ⚠️  Image optimization not disabled');
  }
} else {
  console.log('   ❌ next.config.js not found');
}

console.log('\n🎉 iOS fix verification complete!');
console.log('\n📱 To test the app:');
console.log('   1. Open Xcode (should already be open)');
console.log('   2. Select an iOS Simulator (iPhone 15 recommended)');
console.log('   3. Click the Play button to build and run');
console.log('   4. The app should load without the purple bar/white background issue');
console.log('\n🔧 If issues persist:');
console.log('   1. Clean Build Folder in Xcode (Product > Clean Build Folder)');
console.log('   2. Run: npm run build && npx cap sync ios');
console.log('   3. Check Xcode console for JavaScript errors');
