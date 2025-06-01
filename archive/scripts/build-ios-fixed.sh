#!/bin/bash

echo "🍎 Building Cocoa Reader for iOS with original UI preserved..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf out ios/App/public

# Backup the original next.config.js and page.tsx
echo "💾 Backing up Next.js config and page..."
cp next.config.js next.config.dynamic.js.bak
cp src/app/page.tsx src/app/page.dynamic.tsx.bak

# Use the iOS-specific config and page for static export
echo "🔧 Switching to iOS build configuration..."
cp next.config.ios.js next.config.js
cp src/app/page.ios.tsx src/app/page.tsx

# Build the Next.js app for static export
echo "📦 Building Next.js app for iOS..."
npm run build

# Restore the original dynamic config and page
echo "🔄 Restoring dynamic configuration..."
cp next.config.dynamic.js.bak next.config.js
cp src/app/page.dynamic.tsx.bak src/app/page.tsx

# Update Capacitor config to use the static build
echo "📋 Updating Capacitor configuration..."
cat > capacitor.config.ts << 'EOF'
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'coco.reader.app',
  appName: 'Cocoa Reader',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  },
  ios: {
    scheme: 'Cocoa Reader',
    path: 'ios'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#6366f1",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#ffffff",
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: "launch_screen",
      useDialog: true,
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#6366f1',
    },
    Share: {
      // Native sharing capabilities
    },
    Browser: {
      // Native browser for external links
    },
  },
};

export default config;
EOF

# Copy static files to Capacitor
echo "📋 Copying files to Capacitor..."
npx cap copy ios

# Sync Capacitor configuration
echo "🔄 Syncing Capacitor..."
npx cap sync ios

echo "✅ iOS build complete with original UI preserved!"
echo ""
echo "📋 Next steps:"
echo "1. Open Xcode: npx cap open ios"
echo "2. Connect your iOS device or select simulator"
echo "3. Change Bundle Identifier if needed"
echo "4. Press ▶️ to build and run"
echo ""
echo "🎉 Your Cocoa Reader app is ready for iOS with original PWA interface!"
