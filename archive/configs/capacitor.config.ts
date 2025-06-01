import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'coco.reader.app',
  appName: 'Cocoa Reader',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    // Ensure proper local loading
    cleartext: true
  },
  ios: {
    scheme: 'App',
    path: 'ios'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 500, // Further reduced for faster startup
      launchAutoHide: false, // Let our component handle hiding
      backgroundColor: "#6366f1",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
      // iOS-specific optimizations
      iosSpinnerStyle: "small",
      spinnerColor: "#ffffff",
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#6366f1',
      overlaysWebView: false, // Better iOS integration
    },
    Share: {
      // Native sharing capabilities - critical for iOS share targets
    },
    Browser: {
      // Native browser for external links
    },
    App: {
      // Handle incoming URLs from sharing - critical for iOS share targets
      urlOpen: true,
      // iOS-specific configurations
      handleDeepLinks: true,
    },
    // Add Keyboard plugin for better iOS handling
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true,
    },
  },
};

export default config;
