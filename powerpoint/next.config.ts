const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      https: false
    }
    return config
  }
}

export default nextConfig
