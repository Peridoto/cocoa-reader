/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  distDir: 'out',
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    optimizeCss: false,
  },
  // Development mode configurations for better debugging
  compress: false,
  minify: false,
  swcMinify: false,
  productionBrowserSourceMaps: true,
  // Disable optimizations for easier debugging
  optimizeFonts: false,
  
  webpack: (config, { dev, isServer }) => {
    // Add source maps for better debugging
    if (dev) {
      config.devtool = 'eval-source-map'
    }
    
    // Ensure client/server consistency
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    }
    
    return config
  },
}

module.exports = nextConfig
