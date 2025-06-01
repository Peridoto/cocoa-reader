#!/bin/bash

# Quick iOS Testing Script
# Tests the Cocoa Reader app in Xcode iOS Simulator

echo "🚀 Starting iOS App Testing..."

# Check if we're in the right directory
if [ ! -f "capacitor.config.ts" ]; then
    echo "❌ Error: capacitor.config.ts not found. Please run this script from the project root."
    exit 1
fi

# Check if iOS project exists
if [ ! -d "ios/App" ]; then
    echo "❌ Error: iOS project not found. Please run 'npx cap add ios' first."
    exit 1
fi

echo "📱 Opening Xcode workspace..."
cd ios/App

# Open in Xcode
if command -v xed &> /dev/null; then
    xed App.xcworkspace
    echo "✅ Xcode opened successfully!"
    echo ""
    echo "📋 Testing checklist:"
    echo "   1. Select iPhone 15 Pro simulator (has Dynamic Island)"
    echo "   2. Build and run the app (⌘+R)"
    echo "   3. Check console for reduced warnings"
    echo "   4. Test safe area layout on notched device"
    echo "   5. Test 'Read' button navigation"
    echo "   6. Test sharing from Safari to the app"
    echo ""
    echo "🧪 Share target testing:"
    echo "   1. Open Safari in simulator"
    echo "   2. Navigate to any article (e.g., https://example.com)"
    echo "   3. Tap share button"
    echo "   4. Look for 'Cocoa Reader' in share options"
    echo ""
    echo "✅ All iOS runtime warnings should now be minimal!"
else
    echo "❌ Xcode command line tools not found."
    echo "💡 Please open ios/App/App.xcworkspace manually in Xcode"
fi

cd ../..
echo ""
echo "📱 Alternative: Build from command line"
echo "   xcodebuild -workspace ios/App/App.xcworkspace -scheme App -destination 'platform=iOS Simulator,name=iPhone 15 Pro' build"
