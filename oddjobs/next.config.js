/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
        port: '',
        pathname: '/**',
      },
    ],
  },
  transpilePackages: ['@nivo'], // Safe to keep
}

module.exports = nextConfig
// This configuration allows Next.js to handle images from the specified remote pattern
// and ensures that the @nivo packages are transpiled correctly for use in the application.