import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  webpack: (config) => {
    // Prevent Node core modules from breaking browser builds
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      https: false
    }
    return config
  }
}

export default nextConfig
