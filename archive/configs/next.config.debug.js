/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  distDir: 'out',
  // Enable better error reporting for iOS debugging
  productionBrowserSourceMaps: true,
  optimizeFonts: false, // Prevent hydration issues with fonts
  images: {
    unoptimized: true
  },
  experimental: {
    serverComponentsExternalPackages: ['@mozilla/readability', 'jsdom']
  },
  // Add compiler options for better iOS compatibility
  compiler: {
    removeConsole: false, // Keep console.log for debugging
  },
  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    
    // Better source maps for iOS debugging
    if (!dev) {
      config.devtool = 'source-map';
    }
    
    return config;
  },
}

module.exports = nextConfig
