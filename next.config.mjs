/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Enable the new App Router for API routes
  },
  webpack: (config) => {
    // Support importing from frontend directory
    config.resolve.alias['@frontend'] = require('path').resolve(__dirname, 'frontend/src');
    return config;
  },
};

export default nextConfig;
