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
