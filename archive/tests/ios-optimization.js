#!/usr/bin/env node

/**
 * iOS Optimization Script
 * Applies performance optimizations and best practices for Cocoa Reader iOS app
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

console.log('🍎 iOS App Optimization Script');
console.log('=====================================');

class IOSOptimizer {
  constructor() {
    this.optimizations = [];
    this.errors = [];
  }

  async optimize() {
    console.log('Starting iOS optimizations...\n');

    await this.optimizeBuildConfiguration();
    await this.optimizeCapacitorConfig();
    await this.optimizeIOSAssets();
    await this.optimizeXcodeProject();
    await this.generateReport();
  }

  async optimizeBuildConfiguration() {
    console.log('🔧 Optimizing Build Configuration...');

    try {
      // Update Next.js config for iOS optimization
      const nextConfigPath = 'next.config.js';
      if (fs.existsSync(nextConfigPath)) {
        let config = fs.readFileSync(nextConfigPath, 'utf8');
        
        // Add iOS-specific optimizations
        if (!config.includes('compress: true')) {
          config = config.replace(
            'module.exports = {',
            `module.exports = {
  compress: true, // Enable compression for iOS
  poweredByHeader: false, // Remove X-Powered-By header
  generateEtags: false, // Disable ETags for better caching
  optimizeFonts: true, // Optimize font loading`
          );
          
          fs.writeFileSync(nextConfigPath, config);
          this.optimizations.push('✅ Enhanced Next.js config for iOS performance');
        }
      }

      // Optimize package.json scripts
      const packagePath = 'package.json';
      if (fs.existsSync(packagePath)) {
        const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        
        // Add iOS optimization scripts
        const iosScripts = {
          'ios:optimize': 'npm run build && npx cap sync ios && node ios-optimization.js',
          'ios:profile': 'npx cap run ios --configuration=Release',
          'ios:clean': 'npx cap clean ios && npm run build && npx cap sync ios'
        };

        let updated = false;
        for (const [key, value] of Object.entries(iosScripts)) {
          if (!pkg.scripts[key]) {
            pkg.scripts[key] = value;
            updated = true;
          }
        }

        if (updated) {
          fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2));
          this.optimizations.push('✅ Added iOS optimization scripts to package.json');
        }
      }

    } catch (error) {
      this.errors.push(`❌ Build configuration optimization failed: ${error.message}`);
    }
  }

  async optimizeCapacitorConfig() {
    console.log('⚙️ Optimizing Capacitor Configuration...');

    try {
      const configPath = 'capacitor.config.ts';
      if (fs.existsSync(configPath)) {
        let config = fs.readFileSync(configPath, 'utf8');

        // Apply iOS-specific optimizations
        const optimizations = [
          {
            search: 'launchShowDuration: 500',
            replace: 'launchShowDuration: 300',
            description: 'Reduced splash screen duration for faster startup'
          },
          {
            search: 'ios: {',
            replace: `ios: {
    scheme: 'App',
    path: 'ios',
    // Performance optimizations
    limitsNavigationsToAppBoundDomains: true,
    scrollEnabled: true,
    backgroundColor: '#6366f1',
    preferredContentMode: 'mobile',`,
            description: 'Added iOS performance configurations'
          }
        ];

        let configUpdated = false;
        for (const opt of optimizations) {
          if (config.includes(opt.search) && !config.includes(opt.replace)) {
            config = config.replace(opt.search, opt.replace);
            configUpdated = true;
            this.optimizations.push(`✅ ${opt.description}`);
          }
        }

        if (configUpdated) {
          fs.writeFileSync(configPath, config);
        }
      }
    } catch (error) {
      this.errors.push(`❌ Capacitor config optimization failed: ${error.message}`);
    }
  }

  async optimizeIOSAssets() {
    console.log('🎨 Optimizing iOS Assets...');

    try {
      // Check and optimize app icons
      const iconPath = 'ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png';
      if (fs.existsSync(iconPath)) {
        const stats = fs.statSync(iconPath);
        const sizeKB = Math.round(stats.size / 1024);
        
        if (sizeKB > 200) {
          this.optimizations.push(`⚠️ App icon is ${sizeKB}KB - consider optimizing for better performance`);
        } else {
          this.optimizations.push('✅ App icon size is optimized');
        }
      }

      // Check splash screen assets
      const splashPath = 'ios/App/App/Assets.xcassets/Splash.imageset';
      if (fs.existsSync(splashPath)) {
        const files = fs.readdirSync(splashPath);
        const imageFiles = files.filter(f => f.endsWith('.png'));
        
        if (imageFiles.length >= 3) {
          this.optimizations.push('✅ Splash screen assets are complete');
        } else {
          this.errors.push('❌ Missing splash screen assets');
        }
      }

    } catch (error) {
      this.errors.push(`❌ iOS assets optimization failed: ${error.message}`);
    }
  }

  async optimizeXcodeProject() {
    console.log('🔨 Optimizing Xcode Project...');

    try {
      // Check iOS deployment target
      const projectPath = 'ios/App/App.xcodeproj/project.pbxproj';
      if (fs.existsSync(projectPath)) {
        const project = fs.readFileSync(projectPath, 'utf8');
        
        if (project.includes('IPHONEOS_DEPLOYMENT_TARGET = 14.0')) {
          this.optimizations.push('✅ iOS deployment target is optimized (iOS 14.0+)');
        } else {
          this.optimizations.push('⚠️ Consider updating iOS deployment target to 14.0 for better performance');
        }

        // Check for release optimizations
        if (project.includes('SWIFT_OPTIMIZATION_LEVEL = "-O"')) {
          this.optimizations.push('✅ Swift optimization level is set for release builds');
        }
      }

      // Check Info.plist optimizations
      const infoPlistPath = 'ios/App/App/Info.plist';
      if (fs.existsSync(infoPlistPath)) {
        const infoPlist = fs.readFileSync(infoPlistPath, 'utf8');
        
        const checks = [
          { key: 'UIViewControllerBasedStatusBarAppearance', description: 'Status bar appearance is configured' },
          { key: 'NSAppTransportSecurity', description: 'App Transport Security is configured' },
          { key: 'CFBundleURLTypes', description: 'URL schemes are configured' }
        ];

        for (const check of checks) {
          if (infoPlist.includes(check.key)) {
            this.optimizations.push(`✅ ${check.description}`);
          } else {
            this.errors.push(`❌ Missing ${check.description}`);
          }
        }
      }

    } catch (error) {
      this.errors.push(`❌ Xcode project optimization failed: ${error.message}`);
    }
  }

  async generateReport() {
    console.log('\n📊 Optimization Report');
    console.log('=====================================');

    if (this.optimizations.length > 0) {
      console.log('\n✅ Applied Optimizations:');
      this.optimizations.forEach(opt => console.log(`  ${opt}`));
    }

    if (this.errors.length > 0) {
      console.log('\n❌ Issues Found:');
      this.errors.forEach(err => console.log(`  ${err}`));
    }

    const score = Math.round((this.optimizations.length / (this.optimizations.length + this.errors.length)) * 100) || 100;
    
    console.log(`\n📈 Optimization Score: ${score}%`);
    
    if (score >= 90) {
      console.log('🎉 Excellent! Your iOS app is highly optimized.');
    } else if (score >= 75) {
      console.log('✅ Good! Your iOS app is well optimized with minor improvements available.');
    } else {
      console.log('⚠️ Your iOS app needs optimization improvements.');
    }

    // Generate optimization report file
    const report = {
      timestamp: new Date().toISOString(),
      score: score,
      optimizations: this.optimizations,
      errors: this.errors,
      recommendations: this.generateRecommendations()
    };

    fs.writeFileSync('ios-optimization-report.json', JSON.stringify(report, null, 2));
    console.log('\n📄 Detailed report saved to: ios-optimization-report.json');
  }

  generateRecommendations() {
    const recommendations = [];

    if (this.errors.some(e => e.includes('deployment target'))) {
      recommendations.push('Update iOS deployment target to 14.0 or higher for better performance');
    }

    if (this.errors.some(e => e.includes('assets'))) {
      recommendations.push('Generate missing app icons and splash screens using npx @capacitor/assets generate');
    }

    if (this.errors.some(e => e.includes('URL schemes'))) {
      recommendations.push('Configure custom URL schemes in Info.plist for share target functionality');
    }

    if (this.optimizations.length < 5) {
      recommendations.push('Run npm run build before iOS optimization for best results');
      recommendations.push('Consider enabling code splitting and lazy loading for better performance');
    }

    return recommendations;
  }
}

// Run optimization
const optimizer = new IOSOptimizer();
optimizer.optimize().catch(console.error);
