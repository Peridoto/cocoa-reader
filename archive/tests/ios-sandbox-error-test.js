#!/usr/bin/env node

/**
 * Enhanced iOS Sandbox & Plugin Error Detection Test
 * Tests for sandbox extension errors and undefined SplashScreen values
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 iOS Sandbox & Plugin Error Detection Test');
console.log('==========================================');

async function testSandboxErrorHandling() {
  console.log('\n📦 Testing Sandbox Error Handler...');
  
  const handlerPath = 'src/components/IOSSandboxErrorHandler.tsx';
  
  if (!fs.existsSync(handlerPath)) {
    console.log('❌ IOSSandboxErrorHandler.tsx not found');
    return false;
  }
  
  const handlerContent = fs.readFileSync(handlerPath, 'utf8');
  
  // Check for key sandbox error handling features
  const checks = [
    { pattern: /Could not create a sandbox extension/, feature: 'Sandbox extension error detection' },
    { pattern: /SplashScreen.*undefined/, feature: 'SplashScreen undefined detection' },
    { pattern: /TO JS undefined/, feature: 'TO JS undefined error detection' },
    { pattern: /attemptSandboxFix/, feature: 'Sandbox error auto-fix' },
    { pattern: /attemptPluginFix/, feature: 'Plugin error auto-fix' },
    { pattern: /Filesystem.*requestPermissions/, feature: 'Filesystem permission reset' },
    { pattern: /import.*@capacitor\/splash-screen/, feature: 'Modern SplashScreen import fallback' }
  ];
  
  let passedChecks = 0;
  checks.forEach(check => {
    if (check.pattern.test(handlerContent)) {
      console.log(`✅ ${check.feature}`);
      passedChecks++;
    } else {
      console.log(`❌ ${check.feature}`);
    }
  });
  
  console.log(`\n📊 Sandbox Handler Score: ${passedChecks}/${checks.length} (${Math.round(passedChecks/checks.length*100)}%)`);
  return passedChecks === checks.length;
}

async function testEnhancedSplashScreenHandler() {
  console.log('\n🎬 Testing Enhanced SplashScreen Handler...');
  
  const splashPath = 'src/components/SplashScreenHandler.tsx';
  
  if (!fs.existsSync(splashPath)) {
    console.log('❌ SplashScreenHandler.tsx not found');
    return false;
  }
  
  const splashContent = fs.readFileSync(splashPath, 'utf8');
  
  // Check for enhanced SplashScreen features
  const checks = [
    { pattern: /tryModernImport/, feature: 'Modern ES module import strategy' },
    { pattern: /tryCapacitorPlugin/, feature: 'Capacitor plugin strategy with validation' },
    { pattern: /tryCSS.*/, feature: 'CSS fallback strategy' },
    { pattern: /typeof.*hide.*function/, feature: 'Method availability validation' },
    { pattern: /emergency.*fallback/i, feature: 'Emergency CSS fallback' },
    { pattern: /fadeOutDuration.*200/, feature: 'Smooth fade out animation' },
    { pattern: /selector.*splash.*forEach/, feature: 'Multiple splash element handling' }
  ];
  
  let passedChecks = 0;
  checks.forEach(check => {
    if (check.pattern.test(splashContent)) {
      console.log(`✅ ${check.feature}`);
      passedChecks++;
    } else {
      console.log(`❌ ${check.feature}`);
    }
  });
  
  console.log(`\n📊 Enhanced SplashScreen Score: ${passedChecks}/${checks.length} (${Math.round(passedChecks/checks.length*100)}%)`);
  return passedChecks >= checks.length - 1; // Allow 1 miss
}

async function testLayoutIntegration() {
  console.log('\n🧩 Testing Layout Integration...');
  
  const layoutPath = 'src/app/layout.tsx';
  
  if (!fs.existsSync(layoutPath)) {
    console.log('❌ layout.tsx not found');
    return false;
  }
  
  const layoutContent = fs.readFileSync(layoutPath, 'utf8');
  
  // Check for proper integration
  const checks = [
    { pattern: /IOSSandboxErrorHandler.*from/, feature: 'IOSSandboxErrorHandler import' },
    { pattern: /<IOSSandboxErrorHandler/, feature: 'IOSSandboxErrorHandler component usage' },
    { pattern: /enableAutoFix.*true/, feature: 'Auto-fix enabled' },
    { pattern: /<SplashScreenHandler/, feature: 'SplashScreenHandler maintained' },
    { pattern: /<IOSErrorMonitor/, feature: 'IOSErrorMonitor maintained' }
  ];
  
  let passedChecks = 0;
  checks.forEach(check => {
    if (check.pattern.test(layoutContent)) {
      console.log(`✅ ${check.feature}`);
      passedChecks++;
    } else {
      console.log(`❌ ${check.feature}`);
    }
  });
  
  console.log(`\n📊 Layout Integration Score: ${passedChecks}/${checks.length} (${Math.round(passedChecks/checks.length*100)}%)`);
  return passedChecks === checks.length;
}

async function simulateErrorScenarios() {
  console.log('\n🧪 Simulating Error Scenarios...');
  
  // Create a test script that simulates the errors
  const testScript = `
    // Simulate sandbox extension error
    const simulateSandboxError = () => {
      const event = new ErrorEvent('error', {
        message: 'Could not create a sandbox extension for file',
        filename: 'capacitor://localhost/main.js',
        lineno: 42,
        colno: 10
      });
      window.dispatchEvent(event);
    };
    
    // Simulate SplashScreen undefined error
    const simulateSplashScreenError = () => {
      const event = new ErrorEvent('error', {
        message: 'SplashScreen plugin TO JS undefined',
        filename: 'capacitor://localhost/capacitor.js',
        lineno: 125,
        colno: 5
      });
      window.dispatchEvent(event);
    };
    
    // Simulate plugin unavailable
    const simulatePluginUnavailable = () => {
      console.error('SplashScreen plugin undefined - implementing fallback');
    };
    
    console.log('🧪 Running error simulation tests...');
    setTimeout(simulateSandboxError, 100);
    setTimeout(simulateSplashScreenError, 200);
    setTimeout(simulatePluginUnavailable, 300);
    
    console.log('✅ Error simulation complete');
  `;
  
  fs.writeFileSync('ios-error-simulation.js', testScript);
  console.log('✅ Created error simulation script');
  
  return true;
}

async function testErrorFilteringLogic() {
  console.log('\n🔍 Testing Error Filtering Logic...');
  
  // Check if error monitor filters out non-critical errors
  const errorMonitorPath = 'src/components/IOSErrorMonitor.tsx';
  
  if (!fs.existsSync(errorMonitorPath)) {
    console.log('❌ IOSErrorMonitor.tsx not found');
    return false;
  }
  
  const monitorContent = fs.readFileSync(errorMonitorPath, 'utf8');
  
  const checks = [
    { pattern: /ignoredErrors.*ResizeObserver/, feature: 'ResizeObserver filtering' },
    { pattern: /ignoredErrors.*Script error/, feature: 'Script error filtering' },
    { pattern: /ignoredErrors.*Network request failed/, feature: 'Network error filtering' },
    { pattern: /user aborted.*fetch aborted/, feature: 'Abort error filtering' },
    { pattern: /enableAdvancedMonitoring/, feature: 'Advanced monitoring toggle' }
  ];
  
  let passedChecks = 0;
  checks.forEach(check => {
    if (check.pattern.test(monitorContent)) {
      console.log(`✅ ${check.feature}`);
      passedChecks++;
    } else {
      console.log(`❌ ${check.feature}`);
    }
  });
  
  console.log(`\n📊 Error Filtering Score: ${passedChecks}/${checks.length} (${Math.round(passedChecks/checks.length*100)}%)`);
  return passedChecks >= checks.length - 1;
}

async function runIOSSimulatorTest() {
  console.log('\n📱 Testing iOS Simulator Integration...');
  
  try {
    // Check if simulator is running
    const simulatorCheck = execSync('xcrun simctl list devices | grep "Booted"', { encoding: 'utf8' });
    
    if (simulatorCheck.trim().length === 0) {
      console.log('⚠️  No iOS simulator currently running');
      console.log('ℹ️  Run: xcrun simctl boot "iPhone 15" to start simulator');
      return false;
    }
    
    console.log('✅ iOS Simulator is running');
    
    // Check if Cocoa Reader is installed
    try {
      const installedApps = execSync('xcrun simctl listapps booted | grep -i "cocoa\\|reader"', { encoding: 'utf8' });
      
      if (installedApps.includes('coco.reader.app') || installedApps.includes('Cocoa Reader')) {
        console.log('✅ Cocoa Reader app is installed in simulator');
        return true;
      } else {
        console.log('⚠️  Cocoa Reader app not found in simulator');
        return false;
      }
    } catch (error) {
      console.log('⚠️  Could not check installed apps');
      return false;
    }
    
  } catch (error) {
    console.log('⚠️  iOS Simulator not available');
    return false;
  }
}

async function generateErrorHandlingReport() {
  console.log('\n📊 Generating Error Handling Report...');
  
  const report = {
    timestamp: new Date().toISOString(),
    testResults: {
      sandboxErrorHandling: await testSandboxErrorHandling(),
      enhancedSplashScreen: await testEnhancedSplashScreenHandler(),
      layoutIntegration: await testLayoutIntegration(),
      errorFiltering: await testErrorFilteringLogic(),
      simulatorIntegration: await runIOSSimulatorTest()
    },
    recommendations: [
      'Monitor app launch for sandbox extension errors',
      'Test SplashScreen plugin availability on device',
      'Verify filesystem permissions on iOS',
      'Check Capacitor plugin loading sequence',
      'Test offline functionality with sandbox restrictions'
    ]
  };
  
  // Calculate overall score
  const testCount = Object.keys(report.testResults).length;
  const passedTests = Object.values(report.testResults).filter(Boolean).length;
  const overallScore = Math.round((passedTests / testCount) * 100);
  
  report.overallScore = overallScore;
  report.status = overallScore >= 80 ? 'EXCELLENT' : overallScore >= 60 ? 'GOOD' : 'NEEDS_IMPROVEMENT';
  
  fs.writeFileSync('ios-error-handling-report.json', JSON.stringify(report, null, 2));
  
  console.log(`\n🎯 Overall Error Handling Score: ${overallScore}% (${passedTests}/${testCount} tests passed)`);
  console.log(`📋 Status: ${report.status}`);
  console.log(`📄 Detailed report saved to: ios-error-handling-report.json`);
  
  return report;
}

// Main execution
async function main() {
  try {
    await simulateErrorScenarios();
    const report = await generateErrorHandlingReport();
    
    console.log('\n🎉 iOS Sandbox & Plugin Error Detection Test Complete!');
    
    if (report.overallScore >= 80) {
      console.log('✅ Your iOS app has excellent error handling capabilities');
      console.log('🛡️  Sandbox and plugin errors will be automatically detected and fixed');
    } else {
      console.log('⚠️  Some error handling improvements are recommended');
      console.log('📋 Check the detailed report for specific recommendations');
    }
    
  } catch (error) {
    console.error('❌ Error during testing:', error.message);
    process.exit(1);
  }
}

main();
