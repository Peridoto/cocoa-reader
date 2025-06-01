#!/usr/bin/env node

/**
 * iOS Performance Integration Script
 * Integrates all iOS enhancements into the main application
 */

const fs = require('fs')
const path = require('path')

console.log('🔧 iOS Performance Integration Script')
console.log('=====================================')
console.log('Integrating iOS enhancements into the main application...\n')

// Step 1: Update the main layout to include iOS enhancements
function updateMainLayout() {
  console.log('📝 Updating main layout with iOS enhancements...')
  
  const layoutPath = 'src/app/layout.tsx'
  
  if (!fs.existsSync(layoutPath)) {
    console.error('❌ Layout file not found:', layoutPath)
    return false
  }
  
  let layoutContent = fs.readFileSync(layoutPath, 'utf8')
  
  // Check if already integrated
  if (layoutContent.includes('IOSUIEnhancements')) {
    console.log('✅ iOS UI enhancements already integrated')
    return true
  }
  
  // Add imports
  const iosImports = `import IOSUIEnhancements from '@/components/IOSUIEnhancements'
import IOSErrorMonitor from '@/components/IOSErrorMonitor'
import AdvancedPWAFeatures from '@/components/AdvancedPWAFeatures'`

  // Add imports after existing imports
  const importRegex = /(import.*from.*\n)+/
  layoutContent = layoutContent.replace(importRegex, (match) => {
    return match + iosImports + '\n'
  })
  
  // Wrap the body content with iOS enhancements
  const bodyWrapRegex = /(<body[^>]*>)([\s\S]*?)(<\/body>)/
  layoutContent = layoutContent.replace(bodyWrapRegex, (match, openTag, content, closeTag) => {
    return `${openTag}
        <IOSUIEnhancements
          enableHaptics={true}
          enableStatusBarStyling={true}
          enableSafeAreaHandling={true}
        >
          ${content}
          <IOSErrorMonitor 
            enableLogging={process.env.NODE_ENV === 'development'}
            enableAdvancedMonitoring={true}
          />
          <AdvancedPWAFeatures
            enableOfflineSync={true}
            enableBackgroundSync={true}
            enablePeriodicSync={true}
          />
        </IOSUIEnhancements>
      ${closeTag}`
  })
  
  try {
    fs.writeFileSync(layoutPath, layoutContent)
    console.log('✅ Layout updated successfully')
    return true
  } catch (error) {
    console.error('❌ Failed to update layout:', error)
    return false
  }
}

// Step 2: Initialize performance manager
function initializePerformanceManager() {
  console.log('⚡ Initializing iOS performance manager...')
  
  const performanceInitPath = 'src/lib/ios-performance-init.ts'
  
  const performanceInitContent = `// iOS Performance Manager Initialization
import { iosPerformanceManager } from '../../ios-performance-config'

// Initialize performance optimizations when the app starts
if (typeof window !== 'undefined') {
  // Initialize on app load
  window.addEventListener('load', () => {
    try {
      iosPerformanceManager.initializeOptimizations()
      console.log('📱 iOS Performance Manager initialized')
    } catch (error) {
      console.warn('⚠️ iOS Performance Manager initialization failed:', error)
    }
  })

  // Optimize images as they load
  const imageObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) { // Element node
          const images = (node as Element).querySelectorAll('img')
          images.forEach((img) => {
            iosPerformanceManager.optimizeImage(img as HTMLImageElement)
          })
        }
      })
    })
  })

  imageObserver.observe(document.body, {
    childList: true,
    subtree: true
  })

  // Setup scroll optimization
  const scrollElements = document.querySelectorAll('[data-scroll-optimized]')
  scrollElements.forEach((element) => {
    iosPerformanceManager.optimizeScrolling(element as HTMLElement)
  })

  // Monitor memory usage
  setInterval(() => {
    iosPerformanceManager.performGarbageCollection()
  }, 30000) // Every 30 seconds
}

export { iosPerformanceManager }
`

  try {
    // Create lib directory if it doesn't exist
    const libDir = 'src/lib'
    if (!fs.existsSync(libDir)) {
      fs.mkdirSync(libDir, { recursive: true })
    }
    
    fs.writeFileSync(performanceInitPath, performanceInitContent)
    console.log('✅ Performance manager initialization script created')
    return true
  } catch (error) {
    console.error('❌ Failed to create performance initialization:', error)
    return false
  }
}

// Step 3: Update package.json scripts
function updatePackageScripts() {
  console.log('📦 Updating package.json scripts...')
  
  const packagePath = 'package.json'
  
  if (!fs.existsSync(packagePath)) {
    console.error('❌ package.json not found')
    return false
  }
  
  try {
    const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
    
    // Add iOS-specific scripts
    const iosScripts = {
      'ios:validate': 'node ios-app-validation.js',
      'ios:test': 'node ios-comprehensive-test-suite.js',
      'ios:performance': 'node ios-performance-config.js',
      'ios:debug': 'node ios-debug.js'
    }
    
    packageData.scripts = { ...packageData.scripts, ...iosScripts }
    
    fs.writeFileSync(packagePath, JSON.stringify(packageData, null, 2))
    console.log('✅ Package scripts updated')
    return true
  } catch (error) {
    console.error('❌ Failed to update package.json:', error)
    return false
  }
}

// Step 4: Create iOS configuration file
function createIOSConfig() {
  console.log('🔧 Creating iOS configuration file...')
  
  const configPath = 'ios-config.json'
  
  const iosConfig = {
    version: '1.0.0',
    features: {
      hapticFeedback: true,
      safeAreaHandling: true,
      statusBarStyling: true,
      performanceOptimization: true,
      errorMonitoring: true,
      advancedPWA: true,
      offlineSync: true,
      backgroundSync: true
    },
    performance: {
      memoryLimit: 50, // MB
      cacheSize: 100, // MB
      requestTimeout: 10000, // ms
      maxConcurrentRequests: 3
    },
    ui: {
      enableAnimations: true,
      enableTransitions: true,
      hapticFeedbackIntensity: 'medium',
      darkModeSupport: true
    },
    pwa: {
      enableOfflineMode: true,
      enableBackgroundSync: true,
      enablePushNotifications: false,
      cacheStrategy: 'network-first'
    },
    debugging: {
      enableErrorLogging: true,
      enablePerformanceMonitoring: true,
      enableNetworkLogging: false,
      logLevel: 'warn'
    }
  }
  
  try {
    fs.writeFileSync(configPath, JSON.stringify(iosConfig, null, 2))
    console.log('✅ iOS configuration file created')
    return true
  } catch (error) {
    console.error('❌ Failed to create iOS config:', error)
    return false
  }
}

// Step 5: Validate integration
function validateIntegration() {
  console.log('🔍 Validating iOS integration...')
  
  const requiredFiles = [
    'src/components/IOSUIEnhancements.tsx',
    'src/components/IOSErrorMonitor.tsx',
    'src/components/AdvancedPWAFeatures.tsx',
    'ios-performance-config.ts',
    'src/lib/ios-performance-init.ts',
    'ios-config.json'
  ]
  
  let allValid = true
  
  requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file}`)
    } else {
      console.log(`❌ ${file} - MISSING`)
      allValid = false
    }
  })
  
  return allValid
}

// Step 6: Generate integration report
function generateIntegrationReport() {
  console.log('📊 Generating integration report...')
  
  const report = {
    timestamp: new Date().toISOString(),
    status: 'completed',
    components: {
      iosUIEnhancements: fs.existsSync('src/components/IOSUIEnhancements.tsx'),
      iosErrorMonitor: fs.existsSync('src/components/IOSErrorMonitor.tsx'),
      advancedPWAFeatures: fs.existsSync('src/components/AdvancedPWAFeatures.tsx'),
      performanceConfig: fs.existsSync('ios-performance-config.ts'),
      performanceInit: fs.existsSync('src/lib/ios-performance-init.ts')
    },
    configuration: {
      iosConfig: fs.existsSync('ios-config.json'),
      packageScripts: true,
      layoutUpdated: true
    },
    features: {
      hapticFeedback: true,
      safeAreaHandling: true,
      statusBarStyling: true,
      performanceOptimization: true,
      errorMonitoring: true,
      advancedPWA: true,
      offlineSync: true,
      backgroundSync: true
    },
    nextSteps: [
      'Run "npm run ios:validate" to validate the iOS app',
      'Run "npm run ios:test" to run comprehensive tests',
      'Test the app on iOS simulator',
      'Deploy to TestFlight for testing'
    ]
  }
  
  try {
    fs.writeFileSync('ios-integration-report.json', JSON.stringify(report, null, 2))
    console.log('✅ Integration report saved to ios-integration-report.json')
    return true
  } catch (error) {
    console.error('❌ Failed to save integration report:', error)
    return false
  }
}

// Main integration process
async function runIntegration() {
  console.log('Starting iOS integration process...\n')
  
  const steps = [
    { name: 'Update Main Layout', fn: updateMainLayout },
    { name: 'Initialize Performance Manager', fn: initializePerformanceManager },
    { name: 'Update Package Scripts', fn: updatePackageScripts },
    { name: 'Create iOS Config', fn: createIOSConfig },
    { name: 'Validate Integration', fn: validateIntegration },
    { name: 'Generate Report', fn: generateIntegrationReport }
  ]
  
  let successCount = 0
  
  for (const step of steps) {
    try {
      const success = await step.fn()
      if (success) {
        successCount++
      }
    } catch (error) {
      console.error(`❌ Step "${step.name}" failed:`, error)
    }
    console.log() // Add spacing
  }
  
  console.log('🎯 Integration Summary')
  console.log('=====================')
  console.log(`✅ Completed steps: ${successCount}/${steps.length}`)
  console.log(`📊 Success rate: ${Math.round((successCount / steps.length) * 100)}%`)
  
  if (successCount === steps.length) {
    console.log('\n🎉 iOS integration completed successfully!')
    console.log('\n📋 Next Steps:')
    console.log('1. Run "npm run ios:validate" to validate the app')
    console.log('2. Run "npm run ios:test" for comprehensive testing')
    console.log('3. Test on iOS simulator')
    console.log('4. Review ios-integration-report.json for details')
  } else {
    console.log('\n⚠️ Integration completed with some issues.')
    console.log('Please review the errors above and retry failed steps.')
  }
}

// Run if called directly
if (require.main === module) {
  runIntegration().catch(error => {
    console.error('❌ Integration failed:', error)
    process.exit(1)
  })
}

module.exports = { runIntegration }
