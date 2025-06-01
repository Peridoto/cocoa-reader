/**
 * iOS Performance Optimization Configuration
 * Enhances Cocoa Reader iOS app performance and user experience
 */

import type { CapacitorConfig } from '@capacitor/cli';

export const iosOptimizedConfig: CapacitorConfig = {
  appId: 'coco.reader.app',
  appName: 'Cocoa Reader',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    cleartext: true,
    // iOS performance optimization
    url: undefined, // Use local files for better performance
    allowNavigation: [
      // Only allow navigation to these domains for security
      'capacitor://localhost',
      'ionic://localhost',
      'http://localhost',
      'https://localhost'
    ]
  },
  ios: {
    scheme: 'App',
    path: 'ios',
    // Performance optimizations
    limitsNavigationsToAppBoundDomains: true,
    scrollEnabled: true,
    backgroundColor: '#6366f1',
    // Content mode optimizations
    contentInset: 'automatic',
    // Better resource handling
    allowsLinkPreview: false,
    // Memory management
    preferredContentMode: 'mobile'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 300, // Optimized for fast startup
      launchAutoHide: false, // Let our component handle hiding
      backgroundColor: "#6366f1",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
      // iOS-specific performance optimizations
      iosSpinnerStyle: "small",
      spinnerColor: "#ffffff"
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#6366f1',
      overlaysWebView: false // Better iOS integration
    },
    Share: {
      // Native sharing capabilities - optimized for iOS
      subject: 'Shared from Cocoa Reader',
      dialogTitle: 'Share Article'
    },
    Browser: {
      // Native browser for external links - iOS optimized
      presentationStyle: 'popover',
      showTitle: true,
      toolbarColor: '#6366f1'
    },
    App: {
      // Handle incoming URLs from sharing - optimized for iOS
      urlOpen: true,
      handleDeepLinks: true,
      // Performance optimizations
      launchAutoHide: true,
      iosCustomApplicationProtocol: 'cocoa-reader'
    },
    Keyboard: {
      // Optimized keyboard handling for iOS
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true,
      // Performance improvements
      disableScroll: false,
      hideFormAccessoryBar: false
    },
    // Add performance monitoring
    Device: {
      // Enable device info for performance optimization
    },
    Network: {
      // Network status for offline optimization
    }
  }
};

export default iosOptimizedConfig;
