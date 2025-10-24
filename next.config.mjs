/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack(config, { isServer }) {
    config.module?.rules?.push({
      test: /\.svg$/,
      issuer: /\.(js|ts)x?$/,
      use: ['@svgr/webpack'],
      type: 'asset/resource',
    });
    return config;
  },
  images: {
    domains: [
      'coin-images.coingecko.com',
    ],
    unoptimized: true,
  },
}

export default nextConfig