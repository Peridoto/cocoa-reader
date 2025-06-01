/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  experimental: {
    // Next.js 12 compatible settings
    esmExternals: false,
  },
  // React 17 + Next.js 12 compatibility settings
  reactStrictMode: false,
  // Disable SWC for maximum compatibility
  swcMinify: false,
  // Add iOS-specific optimizations
  compiler: {
    // Disable emotion optimization which can cause hydration issues
    emotion: false,
    // Disable styled-components optimization
    styledComponents: false
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
      
      // iOS Capacitor specific optimizations
      config.optimization = {
        ...config.optimization,
        // Disable aggressive chunking that can cause loading issues
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: {
              minChunks: 1,
              priority: -20,
              reuseExistingChunk: true
            },
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: -10,
              chunks: 'all'
            }
          }
        },
        // Reduce complexity to avoid iOS WebView issues
        minimize: process.env.NODE_ENV === 'production',
        // More conservative module concatenation
        concatenateModules: false
      };
      
      // Add polyfills for iOS WebView compatibility
      config.resolve.alias = {
        ...config.resolve.alias,
        'react/jsx-runtime': require.resolve('react/jsx-runtime'),
        'react/jsx-dev-runtime': require.resolve('react/jsx-dev-runtime')
      };
    }
    return config;
  },
}

module.exports = nextConfig
