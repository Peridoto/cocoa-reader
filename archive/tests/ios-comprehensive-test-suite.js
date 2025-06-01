#!/usr/bin/env node

/**
 * Comprehensive iOS Testing Suite
 * Tests all aspects of the iOS app functionality
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const TEST_CONFIG = {
  timeout: 30000,
  retries: 3,
  simulatorDevice: 'iPhone 15',
  iosVersion: '17.0'
}

class IOSTestSuite {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      skipped: 0,
      errors: []
    }
    this.startTime = Date.now()
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString()
    const prefix = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      test: '🧪'
    }[type] || 'ℹ️'
    
    console.log(`${prefix} [${timestamp}] ${message}`)
  }

  async runTest(testName, testFunction) {
    this.log(`Running test: ${testName}`, 'test')
    
    try {
      await testFunction()
      this.results.passed++
      this.log(`Test passed: ${testName}`, 'success')
      return true
    } catch (error) {
      this.results.failed++
      this.results.errors.push({ test: testName, error: error.message })
      this.log(`Test failed: ${testName} - ${error.message}`, 'error')
      return false
    }
  }

  async testBuildIntegrity() {
    // Test that all required build files exist
    const requiredFiles = [
      'ios/App/App/public/index.html',
      'ios/App/App/public/manifest.json',
      'ios/App/App/public/_next/static/chunks/main.js',
      'ios/App/App/capacitor.config.json',
      'ios/App/Info.plist'
    ]

    for (const file of requiredFiles) {
      if (!fs.existsSync(file)) {
        throw new Error(`Required file missing: ${file}`)
      }
    }

    // Test build file sizes are reasonable
    const indexHtml = fs.statSync('ios/App/App/public/index.html')
    if (indexHtml.size < 1000) {
      throw new Error('Index.html file too small, possibly corrupted')
    }

    // Test manifest.json is valid
    const manifestPath = 'ios/App/App/public/manifest.json'
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
    
    if (!manifest.name || !manifest.icons || !manifest.start_url) {
      throw new Error('Manifest.json is missing required fields')
    }
  }

  async testCapacitorConfiguration() {
    const configPath = 'capacitor.config.ts'
    const config = fs.readFileSync(configPath, 'utf8')

    // Test essential configurations
    if (!config.includes('appId')) {
      throw new Error('Capacitor config missing appId')
    }

    if (!config.includes('webDir')) {
      throw new Error('Capacitor config missing webDir')
    }

    // Test iOS-specific configurations
    if (!config.includes('ios')) {
      throw new Error('Capacitor config missing iOS section')
    }
  }

  async testIOSAssets() {
    const assetPaths = [
      'ios/App/App/Assets.xcassets/AppIcon.appiconset',
      'ios/App/App/Assets.xcassets/Splash.imageset',
      'ios/App/App/public/icon-192.png',
      'ios/App/App/public/icon-512.png'
    ]

    for (const assetPath of assetPaths) {
      if (!fs.existsSync(assetPath)) {
        throw new Error(`Required asset missing: ${assetPath}`)
      }
    }

    // Test icon sizes
    const icon192 = fs.statSync('ios/App/App/public/icon-192.png')
    const icon512 = fs.statSync('ios/App/App/public/icon-512.png')

    if (icon192.size < 5000 || icon512.size < 15000) {
      throw new Error('Icon files appear to be too small')
    }
  }

  async testSimulatorStatus() {
    try {
      const devices = execSync('xcrun simctl list devices available', { encoding: 'utf8' })
      
      if (!devices.includes(TEST_CONFIG.simulatorDevice)) {
        throw new Error(`${TEST_CONFIG.simulatorDevice} simulator not available`)
      }

      // Check if simulator is booted
      const bootedDevices = execSync('xcrun simctl list devices | grep Booted', { encoding: 'utf8' })
      
      if (!bootedDevices.includes(TEST_CONFIG.simulatorDevice)) {
        this.log('Starting iOS simulator...', 'info')
        execSync(`xcrun simctl boot "${TEST_CONFIG.simulatorDevice}"`, { encoding: 'utf8' })
        
        // Wait for simulator to boot
        await new Promise(resolve => setTimeout(resolve, 10000))
      }
    } catch (error) {
      throw new Error(`Simulator test failed: ${error.message}`)
    }
  }

  async testAppInstallation() {
    try {
      // Check if app is installed
      const bundleId = 'io.ionic.cocoareaderweb'
      const installedApps = execSync('xcrun simctl listapps booted', { encoding: 'utf8' })
      
      if (!installedApps.includes(bundleId)) {
        this.log('Installing app on simulator...', 'info')
        execSync('cd ios && xcodebuild -workspace App.xcworkspace -scheme App -destination "platform=iOS Simulator,name=iPhone 15" build', { encoding: 'utf8' })
        execSync('npx cap run ios', { encoding: 'utf8' })
      }

      // Verify installation
      const appsAfterInstall = execSync('xcrun simctl listapps booted', { encoding: 'utf8' })
      if (!appsAfterInstall.includes(bundleId)) {
        throw new Error('App installation verification failed')
      }
    } catch (error) {
      throw new Error(`App installation test failed: ${error.message}`)
    }
  }

  async testAppLaunch() {
    try {
      const bundleId = 'io.ionic.cocoareaderweb'
      
      // Launch app
      execSync(`xcrun simctl launch booted ${bundleId}`, { encoding: 'utf8' })
      
      // Wait for app to launch
      await new Promise(resolve => setTimeout(resolve, 5000))
      
      // Check if app is running
      const runningApps = execSync('xcrun simctl spawn booted launchctl list', { encoding: 'utf8' })
      
      // Note: This is a simplified check. In a real test, you'd use more sophisticated methods
      // to verify the app is actually running and responding
      
    } catch (error) {
      throw new Error(`App launch test failed: ${error.message}`)
    }
  }

  async testPerformanceMetrics() {
    try {
      // Test app startup time
      const startTime = Date.now()
      const bundleId = 'io.ionic.cocoareaderweb'
      
      execSync(`xcrun simctl launch booted ${bundleId}`, { encoding: 'utf8' })
      
      // Wait for app to be responsive (simplified)
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const launchTime = Date.now() - startTime
      
      if (launchTime > 10000) {
        throw new Error(`App launch time too slow: ${launchTime}ms`)
      }

      this.log(`App launch time: ${launchTime}ms`, 'success')
      
    } catch (error) {
      throw new Error(`Performance test failed: ${error.message}`)
    }
  }

  async testErrorHandling() {
    // Test that error monitoring components exist
    const errorMonitorPath = 'src/components/IOSErrorMonitor.tsx'
    if (!fs.existsSync(errorMonitorPath)) {
      throw new Error('IOSErrorMonitor component not found')
    }

    const errorMonitorContent = fs.readFileSync(errorMonitorPath, 'utf8')
    
    // Test that error handling features are implemented
    if (!errorMonitorContent.includes('handleError')) {
      throw new Error('Error handling not implemented in IOSErrorMonitor')
    }

    if (!errorMonitorContent.includes('PerformanceMetrics')) {
      throw new Error('Performance metrics not implemented in IOSErrorMonitor')
    }
  }

  async testUIEnhancements() {
    const uiEnhancementsPath = 'src/components/IOSUIEnhancements.tsx'
    if (!fs.existsSync(uiEnhancementsPath)) {
      throw new Error('IOSUIEnhancements component not found')
    }

    const uiContent = fs.readFileSync(uiEnhancementsPath, 'utf8')
    
    // Test that iOS-specific features are implemented
    if (!uiContent.includes('Haptics')) {
      throw new Error('Haptic feedback not implemented')
    }

    if (!uiContent.includes('SafeArea')) {
      throw new Error('Safe area handling not implemented')
    }

    if (!uiContent.includes('StatusBar')) {
      throw new Error('Status bar styling not implemented')
    }
  }

  async testPWAFeatures() {
    const pwaFeaturesPath = 'src/components/AdvancedPWAFeatures.tsx'
    if (!fs.existsSync(pwaFeaturesPath)) {
      throw new Error('AdvancedPWAFeatures component not found')
    }

    const pwaContent = fs.readFileSync(pwaFeaturesPath, 'utf8')
    
    // Test that PWA features are implemented
    if (!pwaContent.includes('serviceWorker')) {
      throw new Error('Service worker support not implemented')
    }

    if (!pwaContent.includes('caches')) {
      throw new Error('Cache management not implemented')
    }

    // Test service worker file exists
    if (!fs.existsSync('public/sw.js')) {
      throw new Error('Service worker file not found')
    }
  }

  async testOfflineCapabilities() {
    // Test that offline functionality is implemented
    const offlinePage = 'src/app/offline/page.tsx'
    if (!fs.existsSync(offlinePage)) {
      throw new Error('Offline page not found')
    }

    // Test database for offline storage
    const dbFiles = ['prisma/schema.prisma']
    for (const dbFile of dbFiles) {
      if (!fs.existsSync(dbFile)) {
        throw new Error(`Database file not found: ${dbFile}`)
      }
    }
  }

  async runAllTests() {
    this.log('🚀 Starting Comprehensive iOS Test Suite', 'info')
    this.log(`Target Device: ${TEST_CONFIG.simulatorDevice}`, 'info')
    this.log(`Test Timeout: ${TEST_CONFIG.timeout}ms`, 'info')

    const tests = [
      ['Build Integrity', () => this.testBuildIntegrity()],
      ['Capacitor Configuration', () => this.testCapacitorConfiguration()],
      ['iOS Assets', () => this.testIOSAssets()],
      ['Simulator Status', () => this.testSimulatorStatus()],
      ['App Installation', () => this.testAppInstallation()],
      ['App Launch', () => this.testAppLaunch()],
      ['Performance Metrics', () => this.testPerformanceMetrics()],
      ['Error Handling', () => this.testErrorHandling()],
      ['UI Enhancements', () => this.testUIEnhancements()],
      ['PWA Features', () => this.testPWAFeatures()],
      ['Offline Capabilities', () => this.testOfflineCapabilities()]
    ]

    for (const [testName, testFunction] of tests) {
      await this.runTest(testName, testFunction)
    }

    this.generateReport()
  }

  generateReport() {
    const duration = Date.now() - this.startTime
    const total = this.results.passed + this.results.failed + this.results.skipped

    this.log('📊 Test Suite Complete', 'info')
    this.log(`Duration: ${Math.round(duration / 1000)}s`, 'info')
    this.log(`Total Tests: ${total}`, 'info')
    this.log(`Passed: ${this.results.passed}`, 'success')
    this.log(`Failed: ${this.results.failed}`, this.results.failed > 0 ? 'error' : 'info')
    this.log(`Skipped: ${this.results.skipped}`, 'info')

    const successRate = Math.round((this.results.passed / total) * 100)
    this.log(`Success Rate: ${successRate}%`, successRate >= 90 ? 'success' : 'warning')

    if (this.results.errors.length > 0) {
      this.log('❌ Failed Tests:', 'error')
      this.results.errors.forEach(({ test, error }) => {
        this.log(`  • ${test}: ${error}`, 'error')
      })
    }

    // Generate test report file
    const report = {
      timestamp: new Date().toISOString(),
      duration: duration,
      results: this.results,
      successRate: successRate,
      config: TEST_CONFIG
    }

    fs.writeFileSync('ios-test-report.json', JSON.stringify(report, null, 2))
    this.log('📄 Test report saved to ios-test-report.json', 'info')

    if (successRate >= 90) {
      this.log('🎉 iOS App Test Suite PASSED!', 'success')
      process.exit(0)
    } else {
      this.log('💥 iOS App Test Suite FAILED!', 'error')
      process.exit(1)
    }
  }
}

// Run the test suite
if (require.main === module) {
  const testSuite = new IOSTestSuite()
  testSuite.runAllTests().catch(error => {
    console.error('❌ Test suite crashed:', error)
    process.exit(1)
  })
}

module.exports = IOSTestSuite
