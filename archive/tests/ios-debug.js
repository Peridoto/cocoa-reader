#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 iOS Debug - Checking Capacitor app files...\n');

// Check main files
const publicDir = '/Users/pc/Documents/Escritorio/github/cocoa-readerweb/ios/App/App/public';

console.log('📂 Public directory contents:');
try {
  const files = fs.readdirSync(publicDir);
  console.log(`   Found ${files.length} files/folders`);
  
  // Check for critical files
  const criticalFiles = ['index.html', 'manifest.json', '_next'];
  criticalFiles.forEach(file => {
    const exists = fs.existsSync(path.join(publicDir, file));
    console.log(`   ${exists ? '✅' : '❌'} ${file}`);
  });
  
} catch (e) {
  console.log(`   ❌ Error reading directory: ${e.message}`);
}

console.log('\n📄 Index.html check:');
try {
  const indexPath = path.join(publicDir, 'index.html');
  const content = fs.readFileSync(indexPath, 'utf8');
  
  console.log(`   Size: ${(content.length / 1024).toFixed(1)}KB`);
  console.log(`   Has viewport meta: ${content.includes('viewport') ? '✅' : '❌'}`);
  console.log(`   Has theme script: ${content.includes('localStorage.getItem') ? '✅' : '❌'}`);
  console.log(`   Has CSS links: ${content.includes('/_next/static/css/') ? '✅' : '❌'}`);
  console.log(`   Has JS scripts: ${content.includes('/_next/static/chunks/') ? '✅' : '❌'}`);
  
  // Check for any obvious errors
  if (content.includes('404') || content.includes('error')) {
    console.log('   ⚠️  Contains error content');
  }
  
} catch (e) {
  console.log(`   ❌ Error reading index.html: ${e.message}`);
}

console.log('\n🎨 CSS files check:');
try {
  const nextStaticDir = path.join(publicDir, '_next/static');
  if (fs.existsSync(nextStaticDir)) {
    const cssDir = path.join(nextStaticDir, 'css');
    if (fs.existsSync(cssDir)) {
      const cssFiles = fs.readdirSync(cssDir);
      console.log(`   Found ${cssFiles.length} CSS files`);
      cssFiles.forEach(file => {
        const size = fs.statSync(path.join(cssDir, file)).size;
        console.log(`   📄 ${file} (${(size / 1024).toFixed(1)}KB)`);
      });
    } else {
      console.log('   ❌ CSS directory not found');
    }
  } else {
    console.log('   ❌ _next/static directory not found');
  }
} catch (e) {
  console.log(`   ❌ Error checking CSS: ${e.message}`);
}

console.log('\n📱 Capacitor config:');
try {
  const configPath = path.join(publicDir, '..', 'capacitor.config.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  
  console.log(`   App ID: ${config.appId}`);
  console.log(`   App Name: ${config.appName}`);
  console.log(`   Web Dir: ${config.webDir}`);
  console.log(`   Server config: ${JSON.stringify(config.server || {})}`);
  
} catch (e) {
  console.log(`   ❌ Error reading config: ${e.message}`);
}

console.log('\n🔧 Recommendations:');
console.log('1. Try building and syncing again: npm run build && npx cap sync ios');
console.log('2. Clean and rebuild iOS: Product > Clean Build Folder in Xcode');
console.log('3. Check Xcode console for detailed JavaScript errors');
console.log('4. Verify network requests in Safari Web Inspector');
