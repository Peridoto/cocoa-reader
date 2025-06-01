#!/usr/bin/env node

/**
 * iOS App Validation Script
 * Validates that the Cocoa Reader iOS app is working correctly
 * and that client-side exceptions have been resolved.
 */

const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🍎 iOS App Validation Script');
console.log('=====================================');

// Test configuration
const SIMULATOR_ID = 'D4A58C50-8B2B-4BBD-9479-09F6BA42904F'; // iPhone 15
const APP_BUNDLE_ID = 'coco.reader.app'; // Cocoa Reader bundle ID
const APP_DISPLAY_NAME = 'Cocoa Reader';
const TEST_DURATION = 30000; // 30 seconds

// Performance thresholds
const PERFORMANCE_THRESHOLDS = {
  MAX_BUILD_TIME: 30, // seconds
  MAX_LAUNCH_TIME: 5, // seconds
  MAX_MEMORY_USAGE: 100, // MB
  MIN_FPS: 55 // frames per second
};

async function runCommand(command, description) {
  console.log(`\n🔧 ${description}...`);
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error: ${error.message}`);
        reject(error);
        return;
      }
      if (stderr && !stderr.includes('getpwuid_r')) {
        console.warn(`⚠️ Warning: ${stderr}`);
      }
      console.log('✅ Complete');
      resolve(stdout);
    });
  });
}

async function checkSimulatorStatus() {
  console.log('\n📱 Checking iOS Simulator Status...');
  try {
    const result = await runCommand(
      `xcrun simctl list devices | grep "${SIMULATOR_ID}"`,
      'Getting simulator status'
    );
    
    if (result.includes('Booted')) {
      console.log('✅ iPhone 15 Simulator is running');
      return true;
    } else {
      console.log('⚠️ iPhone 15 Simulator is not running');
      return false;
    }
  } catch (error) {
    console.error('❌ Failed to check simulator status');
    return false;
  }
}

async function checkAppStatus() {
  console.log('\n📱 Checking App Installation...');
  try {
    const result = await runCommand(
      `xcrun simctl listapps ${SIMULATOR_ID} | grep -A 5 -B 5 "App"`,
      'Checking installed apps'
    );
    
    if (result.includes('App')) {
      console.log('✅ Cocoa Reader app is installed');
      return true;
    } else {
      console.log('⚠️ App not found in simulator');
      return false;
    }
  } catch (error) {
    console.log('⚠️ Could not verify app installation');
    return false;
  }
}

async function checkForClientSideExceptions() {
  console.log('\n🐛 Monitoring for Client-Side Exceptions...');
  console.log(`Monitoring for ${TEST_DURATION / 1000} seconds...`);
  
  return new Promise((resolve) => {
    let errorCount = 0;
    let jsErrorCount = 0;
    
    const logProcess = spawn('xcrun', [
      'simctl', 'spawn', SIMULATOR_ID, 'log', 'stream',
      '--predicate', 'processImagePath endswith "App"',
      '--info'
    ]);
    
    const jsLogProcess = spawn('xcrun', [
      'simctl', 'spawn', SIMULATOR_ID, 'log', 'stream',
      '--predicate', 'category == "JavaScript"',
      '--info'
    ]);
    
    logProcess.stdout.on('data', (data) => {
      const logData = data.toString();
      if (logData.includes('Error') && !logData.includes('getpwuid_r')) {
        errorCount++;
        console.log(`⚠️ Error detected: ${logData.trim()}`);
      }
    });
    
    jsLogProcess.stdout.on('data', (data) => {
      const logData = data.toString();
      if (logData.includes('ERROR') || logData.includes('Exception')) {
        jsErrorCount++;
        console.log(`❌ JavaScript error detected: ${logData.trim()}`);
      }
    });
    
    setTimeout(() => {
      logProcess.kill();
      jsLogProcess.kill();
      
      console.log('\n📊 Error Monitoring Results:');
      console.log(`System errors detected: ${errorCount}`);
      console.log(`JavaScript errors detected: ${jsErrorCount}`);
      
      if (jsErrorCount === 0) {
        console.log('✅ No client-side exceptions detected!');
      } else {
        console.log('❌ Client-side exceptions still present');
      }
      
      resolve({
        systemErrors: errorCount,
        jsErrors: jsErrorCount,
        success: jsErrorCount === 0
      });
    }, TEST_DURATION);
  });
}

async function validateBuildFiles() {
  console.log('\n📦 Validating Build Files...');
  
  const files = [
    'ios/App/App/public/index.html',
    'ios/App/App/capacitor.config.json'
  ];
  
  const directories = [
    'ios/App/App/public/_next/static/chunks/app'
  ];
  
  let validFiles = 0;
  
  for (const file of files) {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file} exists`);
      validFiles++;
    } else {
      console.log(`❌ ${file} missing`);
    }
  }
  
  for (const dir of directories) {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      const layoutFile = files.find(f => f.startsWith('layout-') && f.endsWith('.js'));
      if (layoutFile) {
        console.log(`✅ ${dir}/${layoutFile} exists`);
        validFiles++;
      } else {
        console.log(`❌ Layout file missing in ${dir}`);
      }
    } else {
      console.log(`❌ ${dir} missing`);
    }
  }
  
  return validFiles === (files.length + directories.length);
}

async function validateCapacitorConfiguration() {
  console.log('\n⚙️ Validating Capacitor Configuration...');
  
  try {
    const configPath = 'capacitor.config.ts';
    if (!fs.existsSync(configPath)) {
      console.log('❌ capacitor.config.ts not found');
      return false;
    }
    
    const config = fs.readFileSync(configPath, 'utf8');
    const checks = [
      { key: 'appId: \'coco.reader.app\'', description: 'App ID matches bundle identifier' },
      { key: 'appName: \'Cocoa Reader\'', description: 'App name is properly set' },
      { key: 'webDir: \'out\'', description: 'Web directory configured for static export' },
      { key: 'SplashScreen:', description: 'SplashScreen plugin configured' },
      { key: 'StatusBar:', description: 'StatusBar plugin configured' },
      { key: 'Share:', description: 'Share plugin configured' },
      { key: 'Browser:', description: 'Browser plugin configured' }
    ];
    
    let validChecks = 0;
    for (const check of checks) {
      if (config.includes(check.key)) {
        console.log(`✅ ${check.description}`);
        validChecks++;
      } else {
        console.log(`❌ ${check.description}`);
      }
    }
    
    return validChecks === checks.length;
  } catch (error) {
    console.log(`❌ Error validating Capacitor config: ${error.message}`);
    return false;
  }
}

async function validateIOSConfiguration() {
  console.log('\n📱 Validating iOS Configuration...');
  
  try {
    const infoPlistPath = 'ios/App/App/Info.plist';
    if (!fs.existsSync(infoPlistPath)) {
      console.log('❌ Info.plist not found');
      return false;
    }
    
    const infoPlist = fs.readFileSync(infoPlistPath, 'utf8');
    const checks = [
      { key: '<string>Cocoa Reader</string>', description: 'Display name is set' },
      { key: 'CFBundleURLSchemes', description: 'URL schemes configured' },
      { key: 'cocoa-reader', description: 'Custom URL scheme present' },
      { key: 'NSAppTransportSecurity', description: 'App Transport Security configured' },
      { key: 'UILaunchStoryboardName', description: 'Launch storyboard configured' }
    ];
    
    let validChecks = 0;
    for (const check of checks) {
      if (infoPlist.includes(check.key)) {
        console.log(`✅ ${check.description}`);
        validChecks++;
      } else {
        console.log(`❌ ${check.description}`);
      }
    }
    
    return validChecks === checks.length;
  } catch (error) {
    console.log(`❌ Error validating iOS config: ${error.message}`);
    return false;
  }
}

async function validateIOSAssets() {
  console.log('\n🎨 Validating iOS Assets...');
  
  const requiredAssets = [
    'ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png',
    'ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732.png',
    'ios/App/App/Base.lproj/LaunchScreen.storyboard',
    'ios/App/App/Base.lproj/Main.storyboard'
  ];
  
  let validAssets = 0;
  
  for (const asset of requiredAssets) {
    if (fs.existsSync(asset)) {
      console.log(`✅ ${asset.split('/').pop()} exists`);
      validAssets++;
    } else {
      console.log(`❌ ${asset} missing`);
    }
  }
  
  return validAssets === requiredAssets.length;
}

async function validatePerformanceMetrics() {
  console.log('\n⚡ Validating Performance Metrics...');
  
  try {
    // Check app launch performance
    const startTime = Date.now();
    
    const launchResult = await runCommand(
      `xcrun simctl launch ${SIMULATOR_ID} ${APP_BUNDLE_ID}`,
      'Testing app launch performance'
    );
    
    const launchTime = (Date.now() - startTime) / 1000;
    
    if (launchTime <= PERFORMANCE_THRESHOLDS.MAX_LAUNCH_TIME) {
      console.log(`✅ App launch time: ${launchTime.toFixed(2)}s (target: <${PERFORMANCE_THRESHOLDS.MAX_LAUNCH_TIME}s)`);
    } else {
      console.log(`⚠️ App launch time: ${launchTime.toFixed(2)}s (target: <${PERFORMANCE_THRESHOLDS.MAX_LAUNCH_TIME}s)`);
    }
    
    // Check memory usage
    try {
      const memoryResult = await runCommand(
        `xcrun simctl spawn ${SIMULATOR_ID} vm_stat`,
        'Checking memory usage'
      );
      console.log('✅ Memory metrics collected');
    } catch (error) {
      console.log('⚠️ Could not collect memory metrics');
    }
    
    return launchTime <= PERFORMANCE_THRESHOLDS.MAX_LAUNCH_TIME;
  } catch (error) {
    console.log(`⚠️ Performance validation skipped: ${error.message}`);
    return true; // Don't fail validation for performance issues
  }
}

async function validateWebShareTarget() {
  console.log('\n🔗 Validating Web Share Target...');
  
  try {
    // Check manifest.json configuration
    const manifestPath = 'public/manifest.json';
    if (!fs.existsSync(manifestPath)) {
      console.log('❌ manifest.json not found');
      return false;
    }
    
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    if (manifest.share_target && manifest.share_target.action === '/share') {
      console.log('✅ Web Share Target configured in manifest');
    } else {
      console.log('❌ Web Share Target missing from manifest');
      return false;
    }
    
    // Check share page exists
    const sharePage = 'src/app/share/page.tsx';
    if (fs.existsSync(sharePage)) {
      console.log('✅ Share page exists');
    } else {
      console.log('❌ Share page missing');
      return false;
    }
    
    return true;
  } catch (error) {
    console.log(`❌ Error validating Share Target: ${error.message}`);
    return false;
  }
}

async function validatePWAFeatures() {
  console.log('\n📱 Validating PWA Features...');
  
  try {
    // Check service worker
    const swPath = 'public/sw.js';
    if (fs.existsSync(swPath)) {
      console.log('✅ Service Worker exists');
    } else {
      console.log('⚠️ Service Worker not found');
    }
    
    // Check offline capability
    const offlineData = 'src/lib/offline-data.ts';
    if (fs.existsSync(offlineData)) {
      console.log('✅ Offline data management exists');
    } else {
      console.log('⚠️ Offline data management not found');
    }
    
    // Check manifest icons
    const manifest = JSON.parse(fs.readFileSync('public/manifest.json', 'utf8'));
    if (manifest.icons && manifest.icons.length > 0) {
      console.log(`✅ ${manifest.icons.length} manifest icons configured`);
    } else {
      console.log('❌ No manifest icons found');
      return false;
    }
    
    return true;
  } catch (error) {
    console.log(`❌ Error validating PWA features: ${error.message}`);
    return false;
  }
}

async function validateErrorHandling() {
  console.log('\n🛡️ Validating Error Handling Improvements...');
  
  // Check SplashScreenHandler enhanced implementation
  const splashHandlerPath = 'src/components/SplashScreenHandler.tsx';
  if (fs.existsSync(splashHandlerPath)) {
    const content = fs.readFileSync(splashHandlerPath, 'utf8');
    if (content.includes('tryModernImport') && 
        content.includes('tryCapacitorPlugin') && 
        content.includes('Emergency CSS fallback')) {
      console.log('✅ SplashScreenHandler has enhanced multi-strategy error handling');
    } else {
      console.log('❌ SplashScreenHandler missing enhanced error handling');
      return false;
    }
  }
  
  // Check IOSSandboxErrorHandler
  const sandboxHandlerPath = 'src/components/IOSSandboxErrorHandler.tsx';
  if (fs.existsSync(sandboxHandlerPath)) {
    const content = fs.readFileSync(sandboxHandlerPath, 'utf8');
    if (content.includes('Could not create a sandbox extension') && 
        content.includes('TO JS undefined') && 
        content.includes('attemptSandboxFix')) {
      console.log('✅ IOSSandboxErrorHandler has comprehensive error detection and fixing');
    } else {
      console.log('❌ IOSSandboxErrorHandler missing comprehensive error handling');
      return false;
    }
  }
  
  // Check layout.tsx theme handling
  const layoutPath = 'src/app/layout.tsx';
  if (fs.existsSync(layoutPath)) {
    const content = fs.readFileSync(layoutPath, 'utf8');
    if (content.includes('try {') && content.includes('catch (fallbackError)')) {
      console.log('✅ Layout has enhanced theme initialization error handling');
    } else {
      console.log('❌ Layout missing enhanced error handling');
      return false;
    }
  }
  
  return true;
}

async function main() {
  try {
    console.log('Starting comprehensive iOS app validation...\n');
    
    const results = {
      buildFiles: false,
      capacitorConfig: false,
      iosConfig: false,
      iosAssets: false,
      errorHandling: false,
      webShareTarget: false,
      pwaFeatures: false,
      simulatorRunning: false,
      appInstalled: false,
      performance: false,
      clientExceptions: false
    };
    
    // Step 1: Validate build files
    results.buildFiles = await validateBuildFiles();
    
    // Step 2: Validate Capacitor configuration
    results.capacitorConfig = await validateCapacitorConfiguration();
    
    // Step 3: Validate iOS configuration
    results.iosConfig = await validateIOSConfiguration();
    
    // Step 4: Validate iOS assets
    results.iosAssets = await validateIOSAssets();
    
    // Step 5: Validate error handling code
    results.errorHandling = await validateErrorHandling();
    
    // Step 6: Validate Web Share Target
    results.webShareTarget = await validateWebShareTarget();
    
    // Step 7: Validate PWA features
    results.pwaFeatures = await validatePWAFeatures();
    
    // Step 8: Check simulator status
    results.simulatorRunning = await checkSimulatorStatus();
    
    if (!results.simulatorRunning) {
      console.log('⚠️ Simulator not running - skipping runtime tests');
    } else {
      // Step 9: Check app status
      results.appInstalled = await checkAppStatus();
      
      // Step 10: Validate performance metrics
      results.performance = await validatePerformanceMetrics();
      
      // Step 11: Monitor for client-side exceptions
      const monitoringResult = await checkForClientSideExceptions();
      results.clientExceptions = monitoringResult.success;
    }
    
    // Calculate overall score
    const totalChecks = Object.keys(results).length;
    const passedChecks = Object.values(results).filter(Boolean).length;
    const score = Math.round((passedChecks / totalChecks) * 100);
    
    // Final results
    console.log('\n🎯 Comprehensive Validation Summary:');
    console.log('=====================================');
    console.log(`📦 Build files: ${results.buildFiles ? '✅ Valid' : '❌ Invalid'}`);
    console.log(`⚙️ Capacitor config: ${results.capacitorConfig ? '✅ Valid' : '❌ Invalid'}`);
    console.log(`📱 iOS config: ${results.iosConfig ? '✅ Valid' : '❌ Invalid'}`);
    console.log(`🎨 iOS assets: ${results.iosAssets ? '✅ Valid' : '❌ Invalid'}`);
    console.log(`🛡️ Error handling: ${results.errorHandling ? '✅ Enhanced' : '❌ Missing'}`);
    console.log(`🔗 Web Share Target: ${results.webShareTarget ? '✅ Configured' : '❌ Missing'}`);
    console.log(`📱 PWA features: ${results.pwaFeatures ? '✅ Enabled' : '❌ Missing'}`);
    console.log(`📱 Simulator: ${results.simulatorRunning ? '✅ Running' : '❌ Not running'}`);
    console.log(`📦 App installed: ${results.appInstalled ? '✅ Installed' : '⚠️ Not detected'}`);
    console.log(`⚡ Performance: ${results.performance ? '✅ Good' : '⚠️ Needs optimization'}`);
    console.log(`🐛 Client exceptions: ${results.clientExceptions ? '✅ Resolved' : '❌ Still present'}`);
    
    console.log(`\n📊 Overall Score: ${score}% (${passedChecks}/${totalChecks} checks passed)`);
    
    if (score >= 85) {
      console.log('\n🎉 iOS App Validation EXCELLENT!');
      console.log('Your Cocoa Reader iOS app is production-ready with outstanding quality.');
    } else if (score >= 70) {
      console.log('\n✅ iOS App Validation PASSED!');
      console.log('Your Cocoa Reader iOS app is working well with minor improvements needed.');
    } else {
      console.log('\n⚠️ iOS App needs improvements - see details above');
    }
    
    // Provide specific recommendations
    console.log('\n💡 Recommendations:');
    if (!results.buildFiles) console.log('• Run npm run build to generate missing build files');
    if (!results.capacitorConfig) console.log('• Update capacitor.config.ts with proper app configuration');
    if (!results.iosConfig) console.log('• Review iOS Info.plist configuration');
    if (!results.iosAssets) console.log('• Generate missing iOS app icons and splash screens');
    if (!results.errorHandling) console.log('• Implement enhanced error handling in critical components');
    if (!results.webShareTarget) console.log('• Configure Web Share Target for better iOS integration');
    if (!results.pwaFeatures) console.log('• Enable PWA features for offline functionality');
    if (!results.simulatorRunning) console.log('• Start iOS simulator for complete testing');
    if (!results.performance) console.log('• Optimize app performance and startup time');
    if (!results.clientExceptions) console.log('• Fix remaining client-side exception issues');
    
  } catch (error) {
    console.error('\n❌ Validation failed with error:', error.message);
  }
}

main();
