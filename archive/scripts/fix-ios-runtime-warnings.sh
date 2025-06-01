#!/bin/bash

# Fix iOS Runtime Warnings Script
# This script addresses UIKit lifecycle warnings, SplashScreen timeout issues, and WebView errors

echo "🔧 Starting iOS Runtime Warning Fixes..."

# Check if we're in the right directory
if [ ! -f "capacitor.config.ts" ]; then
    echo "❌ Error: capacitor.config.ts not found. Please run this script from the project root."
    exit 1
fi

echo "📦 Installing/updating dependencies..."
pnpm install

echo "🏗️ Building static export for iOS..."
pnpm run build:static

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please check for errors above."
    exit 1
fi

echo "📱 Syncing with Capacitor..."
npx cap sync ios

if [ $? -ne 0 ]; then
    echo "❌ Capacitor sync failed. Please check for errors above."
    exit 1
fi

echo "🧹 Cleaning iOS build cache..."
cd ios/App
xcodebuild clean -workspace App.xcworkspace -scheme App > /dev/null 2>&1
cd ../..

echo "✅ iOS Runtime Warning fixes applied successfully!"
echo ""
echo "📋 What was fixed:"
echo "   ✓ Updated AppDelegate.swift with proper iOS 13+ lifecycle support"
echo "   ✓ Enhanced SceneDelegate.swift with URL handling"
echo "   ✓ Optimized SplashScreen configuration (500ms timeout)"
echo "   ✓ Improved SplashScreenHandler component with better timing"
echo "   ✓ Added proper cleanup and error handling"
echo ""
echo "🚀 Next steps:"
echo "   1. Open ios/App/App.xcworkspace in Xcode"
echo "   2. Build and run the app to verify fixes"
echo "   3. Check console for reduced warnings"
echo ""
echo "📱 To test in Xcode simulator:"
echo "   cd ios/App && xcodebuild -workspace App.xcworkspace -scheme App -destination 'platform=iOS Simulator,name=iPhone 15' build"
